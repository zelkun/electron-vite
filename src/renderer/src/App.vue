<!-- src/renderer/src/App.vue -->
<template>
	<Settings v-if="showSettings" @close="showSettings = false" @update-setting="updateSetting" />
	<div class="browser-container">
		<!-- 탭 영역 -->
		<div :class="['browser-tabs', { mac: isMac }]">
			<div
				v-for="(tab, index) in tabs"
				:key="index"
				:class="['tab', { active: currentTabIndex === index }]"
				:style="{ borderTop: `3px solid ${tab.color}`, width: tabWidth }"
				draggable="true"
				@click="switchTab(index)"
				@dragstart="dragStart(index, $event)"
				@dragover.prevent
				@drop="drop(index, $event)"
				@contextmenu.prevent="showContextMenu('tab', index, $event)"
			>
				<span class="tab-title">{{ tab.title || '새 탭' }}</span>
				<button class="close-tab" @click.stop="closeTab(index)">×</button>
			</div>
			<button class="add-tab" @click="addNewTab" @dragover.prevent @drop="onAddTabDrop">+</button>

			<div v-if="!isMac" class="window-controls">
				<button title="최소화" class="window-control minimize-btn" @click="windowCtrlBtnClick('minimize-window')">─</button>
				<button title="최대화" class="window-control maximize-btn" @click="windowCtrlBtnClick('maximize-window')">□</button>
				<button title="닫기" class="window-control close-btn" @click="windowCtrlBtnClick('close-window')">×</button>
			</div>
		</div>

		<!-- 주소창 및 네비게이션 영역 -->
		<div class="browser-toolbar">
			<div class="navigation-buttons">
				<button :disabled="!canGoBack" class="nav-btn" @click="navigatorCtrl('goBack')">◀</button>
				<button :disabled="!canGoForward" class="nav-btn" @click="navigatorCtrl('goForward')">▶</button>
				<button class="nav-btn" @click="navigatorCtrl('refresh')">↻</button>
				<button class="nav-btn" @click="navigatorCtrl('goHome')">🏠</button>
			</div>

			<div class="address-bar">
				<input v-model="currentUrl" type="text" placeholder="URL을 입력하세요" class="url-input" @keyup.enter="navigate" />
				<!--<button @click="navigate" class="go-btn">이동</button>-->
			</div>

			<div class="browser-actions">
				<button class="action-btn search-icon" title="검색" :class="{ active: showSearchArea }" @click="toggleSearchArea">🔍</button>
				<button class="action-btn" @click="addBookmark">🔖</button>
				<button class="action-btn" :class="{ active: showBookmarkBar }" @click="toggleBookmarkBar">📚</button>
				<button class="action-btn" @click="openSettings">⚙️</button>
				<button class="action-btn" @click="showMenu">⋮</button>
			</div>
		</div>

		<!-- 검색 영역 -->
		<div v-if="showSearchArea" class="search-area">
			<div class="search-area-container">
				<input type="text" placeholder="검색어를 입력하세요" class="search-area-input" />
				<button class="search-area-button" @click="performSearch">검색</button>
			</div>
		</div>

		<!-- 북마크 바 -->
		<div v-if="showBookmarkBar" class="bookmark-bar">
			<div class="bookmark-items">
				<div v-if="bookmarks.length === 0" class="bookmark-empty">
					<span>북마크가 없습니다.</span>
					<button class="bookmark-add-btn" @click="addBookmark">북마크 추가</button>
				</div>
				<template v-else>
					<div
						v-for="(bookmark, index) in bookmarks"
						:key="index"
						class="bookmark-item"
						draggable="true"
						@dragstart="dragStartBookmark(index, $event)"
						@dragover.prevent
						@drop="dropBookmark(index, $event)"
						@contextmenu.prevent="showContextMenu('bookmark', index, $event)"
					>
						<button class="bookmark-link" @click="navigateToBookmark(bookmark.url)">
							<span class="bookmark-favicon">🌐</span>
							<span class="bookmark-title">{{ bookmark.title }}</span>
						</button>
					</div>
				</template>
			</div>
		</div>

		<!-- 북마크 편집 모달 -->
		<div v-if="showBookmarkEditModal" class="bookmark-modal">
			<div class="bookmark-modal-content">
				<div class="bookmark-modal-header">
					<h3>{{ isNewBookmark ? '북마크 추가' : '북마크 편집' }}</h3>
					<button class="modal-close-btn" @click="closeBookmarkModal">×</button>
				</div>
				<div class="bookmark-modal-body">
					<div class="form-group">
						<label for="bookmark-title">이름</label>
						<input
							id="bookmark-title"
							ref="editTitleInput"
							v-model="editingBookmark.title"
							type="text"
							placeholder="북마크 이름"
							class="bookmark-input"
							@keyup.esc="closeBookmarkModal"
							@keyup.enter="saveBookmark"
						/>
					</div>
					<div class="form-group">
						<label for="bookmark-url">URL</label>
						<input id="bookmark-url" v-model="editingBookmark.url" type="text" placeholder="https://example.com" class="bookmark-input" @keyup.esc="closeBookmarkModal" @keyup.enter="saveBookmark" />
					</div>
				</div>
				<div class="bookmark-modal-footer">
					<button v-if="!isNewBookmark" class="bookmark-btn delete-btn" @click="deleteBookmark">삭제</button>
					<div class="modal-actions">
						<button class="bookmark-btn cancel-btn" @click="closeBookmarkModal">취소</button>
						<button class="bookmark-btn save-btn" @click="saveBookmark">저장</button>
					</div>
				</div>
			</div>
		</div>

		<!-- 페이지 검색 UI -->
		<div v-if="showSearch" class="search-bar">
			<div class="search-input-container">
				<input id="search-input" ref="searchInput" v-model="searchText" type="text" placeholder="페이지 내 검색" class="search-input" @keyup.enter="findInPage" @keyup.esc="closeSearch" />
				<div v-if="searchResults.matches > 0" class="search-counter">{{ searchResults.activeMatchOrdinal }}/{{ searchResults.matches }}</div>
			</div>
			<div class="search-buttons">
				<button class="search-btn" title="이전" @click="findPrevious">
					<span class="nav-icon">▲</span>
				</button>
				<button class="search-btn" title="다음" @click="findNext">
					<span class="nav-icon">▼</span>
				</button>
				<button class="search-btn close-btn" title="닫기" @click="closeSearch">
					<span>×</span>
				</button>
			</div>
		</div>

		<!-- 웹뷰 영역 -->
		<div class="webview-container">
			<webview
				v-for="(tab, index) in tabs"
				:id="`webview-${index}`"
				:key="index"
				:src="tab.url"
				:style="{ display: currentTabIndex === index ? 'flex' : 'none' }"
				class="webview"
				webpreferences="nativeWindowOption=true"
				allowpopups
				node-integration
				@did-start-loading="startLoading(index)"
				@did-stop-loading="stopLoading(index)"
				@did-navigate="updateUrl($event, index)"
				@page-title-updated="updateTitle($event, index)"
			></webview>
		</div>

		<!-- 상태 표시줄 -->
		<div class="status-bar">
			<div class="loading-status">
				{{ tabs[currentTabIndex]?.loading ? '로딩 중...' : '완료' }}
			</div>
			<div class="zoom-controls">
				<button class="zoom-btn" @click="zoomCtrl('decrease')">-</button>
				<span>{{ tabs[currentTabIndex]?.zoomLevel }}%</span>
				<button class="zoom-btn" @click="zoomCtrl('increase')">+</button>
			</div>
		</div>
	</div>
</template>

<script>
import Settings from './components/Settings/Settings.vue';

export default {
	components: {
		Settings,
	},
	data() {
		return {
			isMac: window.electronAPI?.platform === 'darwin' || false,
			homePage: 'about:blank',
			startupAction: 'newTab',
			showSettings: false,
			tabs: [],
			currentTabIndex: 0,
			currentUrl: '',
			canGoBack: false,
			canGoForward: false,
			draggedTabIndex: null,
			bookmarks: [],
			showSearchArea: true,
			showBookmarkBar: false,
			editingBookmarkIndex: -1,
			editingBookmark: { title: '', url: '' },
			showBookmarkEditModal: false,
			isNewBookmark: false,
			draggedBookmarkIndex: null,
			showSearch: false,
			searchText: '',
			searchResults: { activeMatchOrdinal: 0, matches: 0 },
			foundInPageListener: null,
		};
	},
	computed: {
		// 현재 탭의 URL
		currentTabUrl() {
			return this.tabs[this.currentTabIndex]?.url || '';
		},
		tabWidth() {
			// 브라우저 너비에서 추가 버튼과 종료 버튼 너비를 제외한 공간
			const availableWidth = window.innerWidth - 140;
			// 최소 60px, 최대 150px 사이에서 탭 너비 계산 (기존 100px, 200px에서 축소)
			const calculatedWidth = Math.min(150, Math.max(60, availableWidth / this.tabs.length));
			return `${calculatedWidth}px`;
		},
	},
	beforeUnmount() {
		window.removeEventListener('resize', this.handleResize);
		window.removeEventListener('beforeunload', this.saveSession);
	},
	async mounted() {
		await this.loadSettings(); // 설정 로드
		await this.loadBookmarks(); // 북마크 로드

		// 첫 번째 탭 생성
		this.startupAction = (await window.electronAPI.invoke('get-config-value', 'settings', 'startupAction')) || 'newTab';
		this.homePage = (await window.electronAPI.invoke('get-config-value', 'settings', 'homePage')) || 'about:blank';
		const saveSession = await window.electronAPI.invoke('load-session');

		console.log(`### startupAction: ${this.startupAction}, ${this.homePage}`, JSON.stringify(saveSession));

		switch (this.startupAction) {
			case 'newTab':
				this.addNewTab();
				break;
			case 'homePage':
				this.addNewTab(this.homePage);
				break;
			case 'lastSession':
				if (saveSession && saveSession.tabs) {
					this.tabs = saveSession.tabs;
					this.currentTabIndex = saveSession.currentTabIndex;
					this.$nextTick(() => {
						this.tabs.forEach((tab, index) => {
							const webview = this.getWebview(index);
							if (webview) {
								this.setupWebviewEventListeners(webview, index);
								webview.setZoomFactor(tab.zoomLevel / 100);
							}
						});
					});
					return;
				} else {
					this.addNewTab();
					this.showErrorNotification('세션 복원 실패: 세션 데이터가 없습니다.');
				}
				break;
			default:
				console.log('Invalid startup action:', this.startupAction);
		}

		// Zoom 관련 이벤트 리스너
		this.setupEventHandler('zoomCtrl', this.zoomCtrl); // reset, increase, decrease
		this.setupEventHandler('add-bookmark', this.addBookmark);
		this.setupEventHandler('toggle-bookmark-bar', this.toggleBookmarkBar);

		// 웹뷰 개발자 도구 이벤트 리스너
		this.setupEventHandler('toggle-webview-devtools', (tabIndex) => {
			// tabIndex가 제공되면 해당 탭의 웹뷰 사용, 아니면 현재 탭 사용
			const index = typeof tabIndex === 'number' ? tabIndex : this.currentTabIndex;
			const webview = this.getWebview(index);
			if (webview) {
				if (webview.isDevToolsOpened()) webview.closeDevTools();
				else webview.openDevTools();
			}
		});

		// 북마크 컨텍스트 메뉴 이벤트 리스너
		this.setupEventHandler('bookmark-context-menu-action', (action, index) => {
			switch (action) {
				case 'edit':
					this.openEditBookmarkModal(index);
					break;
				case 'delete':
					this.editingBookmarkIndex = index;
					this.deleteBookmark();
					break;
				case 'open-in-new-tab':
					this.addNewTab();
					this.currentUrl = this.bookmarks[index].url;
					this.navigate();
					break;
			}
		});

		// 탭 관련 이벤트 처리
		this.setupEventHandler('create-new-tab', (url) => {
			this.addNewTab();
			if (url) {
				this.currentUrl = url;
				this.navigate();
			}
		});

		this.setupEventHandler('navigate-to-url', (url) => {
			this.currentUrl = url;
			this.navigate();
		});

		this.setupEventHandler('close-current-tab', () => this.closeTab(this.currentTabIndex));
		this.setupEventHandler('show-page-search', this.showPageSearch);

		// 탭 컨텍스트 메뉴 이벤트 리스너
		this.setupEventHandler('refresh-tab', (index) => {
			if (!index) index = this.currentTabIndex;
			if (index === this.currentTabIndex) {
				this.navigatorCtrl('refresh');
			} else {
				const webview = this.getWebview(index);
				if (webview) {
					webview.reload();
				}
			}
		});

		this.setupEventHandler('close-tab', this.closeTab);

		// 컨텍스트 메뉴 액션 이벤트 리스너
		this.setupEventHandler('copy-to-clipboard', this.copyToClipboard);

		this.setupEventHandler('open-link-in-new-tab', (url) => {
			this.addNewTab();
			this.currentUrl = url;
			this.navigate();
		});

		this.setupEventHandler('save-image', this.saveImage);
		this.setupEventHandler('search-text', this.searchGoogle);
		this.setupEventHandler('navigatorCtrl', this.navigatorCtrl); // goBack, goForward, refresh

		window.addEventListener('resize', this.handleResize); // 창 크기 변경 감지
		window.addEventListener('beforeunload', this.saveSession); // 페이지 종료 시 세션 저장
	},

	methods: {
		// 에러 알림 메서드 추가
		showErrorNotification(message) {
			// 간단한 에러 알림 UI 표시
			console.error(message);
			// 실제 구현에서는 토스트 메시지나 모달 등으로 사용자에게 알림
		},
		getWebview(index) {
			return document.querySelector(`#webview-${index !== undefined ? index : this.currentTabIndex}`);
		},
		// 탭 전환 메서드
		windowCtrlBtnClick(action) {
			window.electronAPI.send('window-control-action', action);
		},

		// 탭의 웹뷰 상태 업데이트
		setNavigationButtonsState(webview) {
			if (!webview) return;
			this.canGoBack = webview.getURL() != '' && webview.getURL() != 'about:blank' && webview.canGoBack();
			this.canGoForward = webview.canGoForward();
		},

		async goHome() {
			// 설정에서 홈페이지 URL 가져오기
			this.homePage = (await window.electronAPI.invoke('get-config-value', 'settings', 'homePage ')) || 'about:blank';
			this.currentUrl = this.homePage;
			this.tabs[this.currentTabIndex].url = this.currentUrl;
			this.navigate();
		},
		saveSession() {
			const sessionData = {
				tabs: this.tabs.map((tab) => ({
					url: tab.url,
					title: tab.title,
					zoomLevel: tab.zoomLevel,
				})),
				currentTabIndex: this.currentTabIndex,
			};
			window.electronAPI.send('save-session', sessionData);
		},

		// 웹뷰 네비게이션 버튼 클릭 메서드
		navigatorCtrl(direction) {
			console.log(`navigatorCtrl: ${direction}`);
			const webview = this.getWebview();
			if (webview) {
				if (direction === 'goBack' && webview.canGoBack()) webview.goBack();
				if (direction === 'goForward' && webview.canGoForward()) webview.goForward();
				if (direction === 'refresh') webview.reload();
				if (direction === 'goHome') this.goHome();
			}
		},

		// 웹뷰 이벤트 리스너 설정 메서드 수정 - 참조 저장 추가
		setupWebviewEventListeners(webview, index) {
			console.log(`setupWebviewEventListeners for tab ${index}`);
			// dom-ready 이벤트 리스너
			webview._domReadyListener = () => {
				this.setNavigationButtonsState(webview);
			};
			webview.addEventListener('dom-ready', webview._domReadyListener);

			// did-fail-load 이벤트 리스너
			webview._failLoadListener = (e) => {
				if (e.errorCode === -3) {
					console.log('Navigation aborted, probably due to a redirect');
				} else {
					console.error('Failed to load:', e.errorDescription);
					this.showErrorNotification(`페이지 로드 실패: ${e.errorDescription}`);
				}
			};
			webview.addEventListener('did-fail-load', webview._failLoadListener);

			// ipc-message 이벤트 리스너
			webview._ipcMessageListener = (evt) => {
				console.log('Webview IPC message:', evt.channel, evt.args);
				if (evt.channel === 'webview-navigation') {
					const direction = evt.args[0];
					if (direction === 'goBack') this.navigatorCtrl('goBack');
					if (direction === 'goForward') this.navigatorCtrl('goForward');
				}
				if (evt.channel === 'show-webview-context-menu') {
					const data = evt.args[0];
					window.electronAPI.send('show-webview-context-menu', {
						...data,
						canGoBack: this.canGoBack,
						canGoForward: this.canGoForward,
					});
				}
			};
			webview.addEventListener('ipc-message', webview._ipcMessageListener);
		},

		// 탭의 이벤트 리스너를 정리하는 메서드 추가
		cleanupTabEventListeners(index) {
			const webview = this.getWebview(index);
			if (webview) {
				// DOM 이벤트 리스너 제거
				webview.removeEventListener('dom-ready', webview._domReadyListener);
				webview.removeEventListener('did-fail-load', webview._failLoadListener);
				webview.removeEventListener('ipc-message', webview._ipcMessageListener);

				// found-in-page 이벤트 리스너 제거
				if (webview._foundInPageListener) {
					webview.removeEventListener('found-in-page', webview._foundInPageListener);
				}

				// 검색 하이라이트 제거
				webview.stopFindInPage('clearSelection');
			}
		},

		navigate() {
			let url = this.currentUrl;
			if (url && !url.startsWith('http://') && !url.startsWith('https://') && url !== 'about:blank') {
				url = 'https://' + url;
			}
			this.tabs[this.currentTabIndex].url = url;
			const webview = this.getWebview();
			if (webview) {
				webview.src = url;
			}
		},

		addNewTab(url = 'about:blank') {
			console.log(`# addNewTab: url ${typeof url}`);
			if (typeof url !== 'string') url = 'about:blank';

			this.tabs.push({
				url: url,
				title: '새 탭',
				loading: false,
				color: this.getRandomColor(),
				zoomLevel: 100,
			});
			this.currentTabIndex = this.tabs.length - 1;
			this.currentUrl = url;

			// 새 탭의 웹뷰에 컨텍스트 메뉴 이벤트 등록
			this.$nextTick(() => {
				const index = this.tabs.length - 1;
				const webview = this.getWebview(index);
				if (webview) {
					this.setupWebviewEventListeners(webview, index);
				}
			});
			document.title = '새 탭';
		},
		closeTab(index) {
			// 탭을 닫기 전에 이벤트 리스너 정리
			this.cleanupTabEventListeners(index);

			this.tabs.splice(index, 1);
			if (this.tabs.length === 0) {
				window.electronAPI.send('window-control-action', 'close-window');
			} else {
				if (this.currentTabIndex >= index) {
					this.currentTabIndex = Math.max(0, this.currentTabIndex - 1);
				}
				this.currentUrl = this.tabs[this.currentTabIndex].url;
				if (this.currentUrl === 'about:blank') {
					this.currentUrl = '';
				}
			}
		},
		switchTab(index) {
			this.currentTabIndex = index;
			this.currentUrl = this.tabs[index].url;
			if (this.currentUrl === 'about:blank') {
				this.currentUrl = '';
			}

			// 웹뷰 상태 업데이트
			const webview = this.getWebview(index);
			if (webview) {
				webview.setZoomFactor(this.tabs[index].zoomLevel / 100);
				this.setNavigationButtonsState(webview);
			}

			// 윈도우 타이틀 변경: 활성 탭 타이틀 반영
			const activeTitle = this.tabs[index].title || '새 탭';
			document.title = activeTitle; // <title> 태그 변경
		},
		startLoading(index) {
			this.tabs[index].loading = true;
		},
		stopLoading(index) {
			this.tabs[index].loading = false;
			this.setNavigationButtonsState(this.getWebview(index));
		},
		updateUrl(event, index) {
			if (index === this.currentTabIndex) {
				this.currentUrl = event.url === 'about:blank' ? '' : event.url;
			}
			this.tabs[index].url = event.url;
		},
		updateTitle(event, index) {
			this.tabs[index].title = event.title === 'about:blank' ? '새 탭' : event.title;

			if (this.currentTabIndex == index) {
				// 윈도우 타이틀 변경: 활성 탭 타이틀 반영
				const activeTitle = this.tabs[index].title || '새 탭';
				document.title = activeTitle; // <title> 태그 변경
			}
		},

		zoomCtrl(action) {
			const webview = this.getWebview();
			const index = this.currentTabIndex;
			if (action === 'reset') {
				if (webview) {
					this.tabs[index].zoomLevel = 100;
					webview.setZoomFactor(1);
				}
			} else if (action === 'increase') {
				if (webview && this.tabs[index].zoomLevel < 200) {
					this.tabs[index].zoomLevel += 10;
					webview.setZoomFactor(this.tabs[index].zoomLevel / 100);
				}
			} else if (action === 'decrease') {
				if (webview && this.tabs[index].zoomLevel > 50) {
					this.tabs[index].zoomLevel -= 10;
					webview.setZoomFactor(this.tabs[index].zoomLevel / 100);
				}
			}
		},

		getRandomColor() {
			// 탭 색상 목록에서 선택
			const colors = [
				'#4285F4', // 파랑 (Google)
				'#EA4335', // 빨강 (Google)
				'#FBBC05', // 노랑 (Google)
				'#34A853', // 초록 (Google)
				'#8E44AD', // 보라
				'#F39C12', // 주황
				'#1ABC9C', // 청록
				'#E74C3C', // 빨강
				'#3498DB', // 하늘
				'#2ECC71', // 초록
			];
			return colors[Math.floor(Math.random() * colors.length)];
		},
		// 탭 드래그 앤 드롭 기능
		dragStart(index, event) {
			this.draggedTabIndex = index;
			event.dataTransfer.effectAllowed = 'move';
		},

		/* eslint-disable no-unused-vars */
		drop(index, event) {
			if (this.draggedTabIndex !== null) {
				// 탭 순서 변경
				const draggedTab = this.tabs[this.draggedTabIndex];
				this.tabs.splice(this.draggedTabIndex, 1);
				this.tabs.splice(index, 0, draggedTab);

				// 현재 선택된 탭 인덱스 업데이트
				if (this.currentTabIndex === this.draggedTabIndex) {
					this.currentTabIndex = index;
				} else if (this.currentTabIndex > this.draggedTabIndex && this.currentTabIndex <= index) {
					this.currentTabIndex--;
				} else if (this.currentTabIndex < this.draggedTabIndex && this.currentTabIndex >= index) {
					this.currentTabIndex++;
				}

				this.draggedTabIndex = null;
			}
		},

		async toggleSearchArea() {
			this.showSearchArea = !this.showSearchArea;
			try {
				await window.electronAPI.invoke('set-config-value', 'settings', 'searchBar', this.showSearchArea);
			} catch (error) {
				console.error('검색 바 설정 저장 오류:', error);
				this.showErrorNotification('검색 바 저장하는 중 오류가 발생했습니다.');
			}
		},

		// 북마크 관련 기능
		async loadBookmarks() {
			try {
				this.bookmarks = (await window.electronAPI.invoke('get-bookmarks')) || [];
			} catch (error) {
				console.error('북마크 로드 오류:', error);
				this.showErrorNotification('북마크를 불러오는 중 오류가 발생했습니다.');
				this.bookmarks = [];
			}
		},

		async saveBookmarks() {
			try {
				// 북마크 객체를 직렬화 가능한 형태로 변환
				const serializableBookmarks = this.bookmarks.map((bookmark) => ({
					title: bookmark.title,
					url: bookmark.url,
				}));

				await window.electronAPI.invoke('save-bookmarks', serializableBookmarks);
			} catch (error) {
				console.error('북마크 저장 오류:', error);
				this.showErrorNotification('북마크를 저장하는 중 오류가 발생했습니다.');
			}
		},

		// 북마크 바 토글 메서드 수정
		async toggleBookmarkBar() {
			this.showBookmarkBar = !this.showBookmarkBar;
			try {
				await window.electronAPI.invoke('set-config-value', 'settings', 'showBookmarkBar', this.showBookmarkBar);
			} catch (error) {
				console.error('북마크 바 설정 저장 오류:', error);
				this.showErrorNotification('북마크를 저장하는 중 오류가 발생했습니다.');
			}
		},

		async addBookmark() {
			// 현재 URL이 비어있거나 about:blank인 경우 추가하지 않음
			// if (!this.currentUrl || this.currentUrl === 'about:blank') return;

			// 북마크 바가 숨겨져 있으면 표시
			if (!this.showBookmarkBar) {
				this.showBookmarkBar = true;
			}

			// 현재 URL이 이미 북마크에 있는지 확인
			const existingIndex = this.bookmarks.findIndex((b) => b.url === this.currentUrl);
			if (existingIndex !== -1) {
				this.openEditBookmarkModal(existingIndex);
			} else {
				this.openAddBookmarkModal();
			}
		},

		openAddBookmarkModal() {
			this.isNewBookmark = true;
			this.editingBookmarkIndex = -1;
			this.editingBookmark = {
				title: this.tabs[this.currentTabIndex].title || '새 북마크',
				url: this.currentUrl,
			};
			this.showBookmarkEditModal = true;

			this.$nextTick(() => {
				if (this.$refs.editTitleInput) {
					this.$refs.editTitleInput.focus();
					this.$refs.editTitleInput.select();
				}
			});
		},

		openEditBookmarkModal(index) {
			this.isNewBookmark = false;
			this.editingBookmarkIndex = index;
			this.editingBookmark = {
				title: this.bookmarks[index].title,
				url: this.bookmarks[index].url,
			};
			this.showBookmarkEditModal = true;

			this.$nextTick(() => {
				if (this.$refs.editTitleInput) {
					this.$refs.editTitleInput.focus();
					this.$refs.editTitleInput.select();
				}
			});
		},

		closeBookmarkModal() {
			this.showBookmarkEditModal = false;
			this.editingBookmarkIndex = -1;
			this.editingBookmark = { title: '', url: '' };
		},

		async saveBookmark() {
			// 입력값 검증
			if (!this.editingBookmark.title.trim()) this.editingBookmark.title = '제목 없음';

			if (!this.editingBookmark.url.trim()) {
				this.editingBookmark.url = 'about:blank';
			} else if (!this.editingBookmark.url.startsWith('http://') && !this.editingBookmark.url.startsWith('https://') && this.editingBookmark.url !== 'about:blank') {
				this.editingBookmark.url = 'https://' + this.editingBookmark.url;
			}

			if (this.isNewBookmark) {
				this.bookmarks.push({ ...this.editingBookmark });
			} else {
				this.bookmarks[this.editingBookmarkIndex] = { ...this.editingBookmark };
			}

			await this.saveBookmarks();
			this.closeBookmarkModal();
		},

		async deleteBookmark() {
			if (this.editingBookmarkIndex >= 0) {
				this.bookmarks.splice(this.editingBookmarkIndex, 1);
				await this.saveBookmarks();
			}
			this.closeBookmarkModal();
		},

		navigateToBookmark(url) {
			this.currentUrl = url;
			this.navigate();
		},

		// 북마크 드래그 앤 드롭 기능
		dragStartBookmark(index, event) {
			this.draggedBookmarkIndex = index;
			event.dataTransfer.effectAllowed = 'move';

			// URL 데이터 등록
			const url = this.bookmarks[index].url;
			event.dataTransfer.setData('text/plain', url);
		},

		dropBookmark(index, event) {
			if (this.draggedBookmarkIndex !== null && this.draggedBookmarkIndex !== index) {
				// 북마크 순서 변경
				const draggedBookmark = this.bookmarks[this.draggedBookmarkIndex];
				this.bookmarks.splice(this.draggedBookmarkIndex, 1);
				this.bookmarks.splice(index, 0, draggedBookmark);

				// 변경사항 저장
				this.saveBookmarks();
				this.draggedBookmarkIndex = null;
			}
		},

		showContextMenu(type, index, evt) {
			window.electronAPI.send(`show-${type}-context-menu`, {
				type: type,
				x: evt.clientX,
				y: evt.clientY,
				[`${type}Index`]: index,
			});
		},

		// 클립보드에 복사
		copyToClipboard(text) {
			try {
				window.electronAPI.invoke('write-to-clipboard', text);
				console.log('Text copied to clipboard');
			} catch (err) {
				console.error('Failed to copy text: ', err);
			}
		},

		// 이미지 저장
		async saveImage(url) {
			try {
				const result = await window.electronAPI.invoke('save-file', {
					url: url,
					defaultPath: 'image.jpg',
				});
				if (result.success) {
					console.log('Image saved to:', result.path);
				} else {
					console.error('Failed to save image:', result.reason);
				}
			} catch (error) {
				console.error('Error saving image:', error);
			}
		},

		// 텍스트 검색
		searchGoogle(text) {
			// 검색 엔진으로 검색
			const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
			this.addNewTab();
			this.currentUrl = searchUrl;
			this.navigate();
		},

		// 검색 관련 메서드
		showPageSearch() {
			this.showSearch = true;
			this.$nextTick(() => {
				if (this.$refs.searchInput) {
					this.$refs.searchInput.focus();
				}
			});
		},
		closeSearch() {
			this.showSearch = false;
			this.searchText = '';
			this.searchResults = { activeMatchOrdinal: 0, matches: 0 };

			const webview = this.getWebview();
			if (webview) {
				webview.stopFindInPage('clearSelection');

				// 이벤트 리스너 제거
				if (this.foundInPageListener) {
					webview.removeEventListener('found-in-page', this.foundInPageListener);
					this.foundInPageListener = null;
				}
			}
		},
		findInPage() {
			if (!this.searchText) return;
			const webview = this.getWebview();
			if (webview) {
				// 이전에 등록된 이벤트 리스너가 있다면 제거
				if (this.foundInPageListener) webview.removeEventListener('found-in-page', this.foundInPageListener);

				// 새 이벤트 리스너 생성 및 저장
				this.foundInPageListener = (e) => {
					this.searchResults = {
						activeMatchOrdinal: e.result.activeMatchOrdinal,
						matches: e.result.matches,
					};
				};
				webview.addEventListener('found-in-page', this.foundInPageListener);
				webview._foundInPageListener = this.foundInPageListener;

				webview.findInPage(this.searchText);
			}
		},
		findNext() {
			if (!this.searchText) return;
			const webview = this.getWebview();
			if (webview) webview.findInPage(this.searchText, { forward: true, findNext: true });
		},

		findPrevious() {
			if (!this.searchText) return;
			const webview = this.getWebview();
			if (webview) webview.findInPage(this.searchText, { forward: false, findNext: true });
		},

		openSettings() {
			this.showSettings = !this.showSettings;
			console.log('설정 메뉴 표시', this.showSettings);
		},
		async updateSetting({ key, value }) {
			console.log('설정 업데이트:', key, value);
			await window.electronAPI.invoke('save-setting', key, value);
			this.applySetting(key, value);
		},
		applySetting(key, value) {
			// 메서드명 수정
			switch (key) {
				case 'showBookmarkBar':
					this.showBookmarkBar = value;
					break;
				case 'theme':
					document.documentElement.setAttribute('data-theme', value);
					break;
				case 'homePage':
					this.homePage = value;
					break;
				default:
					console.warn(`Unknown setting key: ${key}`);
			}
		},

		showMenu() {
			console.log('추가 메뉴 표시');
		},

		// 설정 로드 메서드
		async loadSettings() {
			try {
				const settings = await window.electronAPI.invoke('get-config-section', 'settings');
				if (settings) {
					// 북마크 바 설정 적용
					this.showBookmarkBar = settings.showBookmarkBar || false;

					// 테마 설정 강화
					const theme = settings.theme || 'light';
					document.documentElement.setAttribute('data-theme', theme);

					// 필요한 경우 추가 설정 적용
					// this.otherSetting = settings.otherSetting || defaultValue;
				}
			} catch (error) {
				console.error('설정 로드 오류:', error);
			}
		},
		// 설정 저장 메서드
		async saveSettings() {
			try {
				const settings = {
					showBookmarkBar: this.showBookmarkBar,
				};
				await window.electronAPI.invoke('save-config-section', 'settings', settings);
			} catch (error) {
				console.error('설정 저장 오류:', error);
			}
		},

		setupEventHandler(evtNm, handler) {
			window.electronAPI.on(evtNm, handler);
			return () => {
				window.electronAPI.removeListener(evtNm, handler);
			};
		},

		handleResize() {
			// 창 크기 변경 시 필요한 업데이트 수행
			// tabWidth computed 속성이 자동으로 재계산됨
		},

		onAddTabDrop(event) {
			// 드래그된 데이터 타입 확인 ('text/plain' 등)
			const url = event.dataTransfer.getData('text/plain');
			if (url) {
				this.addNewTab(url); // URL로 새 탭 생성
			}
		},
	},
};
</script>
