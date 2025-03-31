<template>
	<div class="browser-container">
		<!-- 탭 영역 -->
		<div class="browser-tabs">
			<div
				v-for="(tab, index) in tabs"
				:key="index"
				@click="switchTab(index)"
				:class="['tab', { active: currentTabIndex === index }]"
				:style="{ borderTop: `3px solid ${tab.color}`, width: tabWidth }"
				draggable="true"
				@dragstart="dragStart(index, $event)"
				@dragover.prevent
				@drop="drop(index, $event)"
				@contextmenu.prevent="showTabContextMenu(index, $event)"
			>
				<span class="tab-title">{{ tab.title || '새 탭' }}</span>
				<button @click.stop="closeTab(index)" class="close-tab">×</button>
			</div>
			<button @click="addNewTab" class="add-tab">+</button>

			<div class="window-controls">
				<button @click="windowCtrlBtnClick('minimize-window')" class="window-control minimize-btn" title="최소화">─</button>
				<button @click="windowCtrlBtnClick('maximize-window')" class="window-control maximize-btn" title="최대화">□</button>
				<button @click="windowCtrlBtnClick('close-window')" class="window-control close-btn" title="닫기">×</button>
			</div>
		</div>

		<!-- 주소창 및 네비게이션 영역 -->
		<div class="browser-toolbar">
			<div class="navigation-buttons">
				<button @click="navigatorCtrl('goBack')" :disabled="!canGoBack" class="nav-btn">◀</button>
				<button @click="navigatorCtrl('goForward')" :disabled="!canGoForward" class="nav-btn">▶</button>
				<button @click="navigatorCtrl('refresh')" class="nav-btn">↻</button>
				<button @click="navigatorCtrl('goHome')" class="nav-btn">🏠</button>
			</div>

			<div class="address-bar">
				<input type="text" v-model="currentUrl" @keyup.enter="navigate" placeholder="URL을 입력하세요" class="url-input" />
				<button @click="navigate" class="go-btn">이동</button>
			</div>

			<div class="browser-actions">
				<button @click="addBookmark" class="action-btn">🔖</button>
				<button @click="toggleBookmarkBar" class="action-btn" :class="{ active: showBookmarkBar }">📚</button>
				<button @click="showSettings" class="action-btn">⚙️</button>
				<button @click="showMenu" class="action-btn">⋮</button>
			</div>
		</div>

		<!-- 북마크 바 -->
		<div class="bookmark-bar" v-if="showBookmarkBar">
			<div class="bookmark-items">
				<div v-if="bookmarks.length === 0" class="bookmark-empty">
					<span>북마크가 없습니다.</span>
					<button @click="addBookmark" class="bookmark-add-btn">북마크 추가</button>
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
						@contextmenu.prevent="showBookmarkContextMenu(index, $event)"
					>
						<button @click="navigateToBookmark(bookmark.url)" class="bookmark-link">
							<span class="bookmark-favicon">🌐</span>
							<span class="bookmark-title">{{ bookmark.title }}</span>
						</button>
					</div>
				</template>
			</div>
		</div>

		<!-- 북마크 편집 모달 -->
		<div class="bookmark-modal" v-if="showBookmarkEditModal">
			<div class="bookmark-modal-content">
				<div class="bookmark-modal-header">
					<h3>{{ isNewBookmark ? '북마크 추가' : '북마크 편집' }}</h3>
					<button @click="closeBookmarkModal" class="modal-close-btn">×</button>
				</div>
				<div class="bookmark-modal-body">
					<div class="form-group">
						<label for="bookmark-title">이름</label>
						<input type="text" id="bookmark-title" v-model="editingBookmark.title" placeholder="북마크 이름" class="bookmark-input" ref="editTitleInput" />
					</div>
					<div class="form-group">
						<label for="bookmark-url">URL</label>
						<input type="text" id="bookmark-url" v-model="editingBookmark.url" placeholder="https://example.com" class="bookmark-input" />
					</div>
				</div>
				<div class="bookmark-modal-footer">
					<button @click="deleteBookmark" v-if="!isNewBookmark" class="bookmark-btn delete-btn">삭제</button>
					<div class="modal-actions">
						<button @click="closeBookmarkModal" class="bookmark-btn cancel-btn">취소</button>
						<button @click="saveBookmark" class="bookmark-btn save-btn">저장</button>
					</div>
				</div>
			</div>
		</div>

		<!-- 페이지 검색 UI -->
		<div class="search-bar" v-if="showSearch">
			<div class="search-input-container">
				<input id="search-input" type="text" v-model="searchText" @keyup.enter="findInPage" @keyup.esc="closeSearch" placeholder="페이지 내 검색" ref="searchInput" class="search-input" />
				<div class="search-counter" v-if="searchResults.matches > 0">{{ searchResults.activeMatchOrdinal }}/{{ searchResults.matches }}</div>
			</div>
			<div class="search-buttons">
				<button @click="findPrevious" class="search-btn" title="이전">
					<span class="nav-icon">▲</span>
				</button>
				<button @click="findNext" class="search-btn" title="다음">
					<span class="nav-icon">▼</span>
				</button>
				<button @click="closeSearch" class="search-btn close-btn" title="닫기">
					<span>×</span>
				</button>
			</div>
		</div>

		<!-- 웹뷰 영역 -->
		<div class="webview-container">
			<webview
				v-for="(tab, index) in tabs"
				:key="index"
				:id="`webview-${index}`"
				:src="tab.url"
				:style="{ display: currentTabIndex === index ? 'flex' : 'none' }"
				class="webview"
				webpreferences="nativeWindowOption=true"
				allowpopups
				nodeIntegration
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
				<button @click="decreaseZoom" class="zoom-btn">-</button>
				<span>{{ zoomLevel }}%</span>
				<button @click="increaseZoom" class="zoom-btn">+</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			tabs: [],
			currentTabIndex: 0,
			currentUrl: '',
			canGoBack: false,
			canGoForward: false,
			zoomLevel: 100,
			draggedTabIndex: null,
			bookmarks: [],
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
		}
	},
	methods: {
		getWebview(index) {
			return document.querySelector(`#webview-${index !== undefined ? index : this.currentTabIndex}`)
		},
		// 탭 전환 메서드
		windowCtrlBtnClick(action) {
			window.electronAPI.send('window-control-action', action)
		},

		// 탭의 웹뷰 상태 업데이트
		setNavigationButtonsState(webview) {
			if (!webview) return
			this.canGoBack = webview.getURL() != '' && webview.getURL() != 'about:blank' && webview.canGoBack()
			this.canGoForward = webview.canGoForward()
		},

		async goHome() {
			// 설정에서 홈페이지 URL 가져오기
			const homePage = (await window.electronAPI.invoke('get-config-value', 'settings', 'defaultHomePage')) || 'about:blank'
			this.currentUrl = homePage
			this.tabs[this.currentTabIndex].url = homePage
			const webview = this.getWebview()
			if (webview) {
				webview.src = homePage
			}
		},

		// 웹뷰 네비게이션 버튼 클릭 메서드
		navigatorCtrl(direction) {
			const webview = this.getWebview()
			if (webview) {
				if (direction === 'goBack' && webview.canGoBack()) webview.goBack()
				if (direction === 'goForward' && webview.canGoForward()) webview.goForward()
				if (direction === 'refresh') webview.reload()
				if (direction === 'goHome') this.goHome()
			}
		},

		// 웹뷰 이벤트 리스너 설정
		setupWebviewEventListeners(webview, index) {
			// 웹뷰 로딩 시작 및 중지 이벤트 리스너 추가
			webview.addEventListener('dom-ready', () => {
				webview.addEventListener('context-menu', (e, params) => {
					window.electronAPI.send('show-webview-context-menu', {
						x: e.clientX,
						y: e.clientY,
						linkURL: params.linkURL,
						srcURL: params.srcURL,
						isEditable: params.isEditable,
						selectionText: params.selectionText,
					})
				})
				this.setNavigationButtonsState(webview)
			})

			// 웹뷰 로딩 시작 및 중지 이벤트 리스너 추가
			webview.addEventListener('did-fail-load', (e) => {
				if (e.errorCode === -3) {
					console.log('Navigation aborted, probably due to a redirect')
				} else {
					console.error('Failed to load:', e.errorDescription)
				}
			})

			// 웹뷰 네비게이션 이벤트 리스너 추가
			webview.addEventListener('ipc-message', (event) => {
				console.log('Webview IPC message:', event.channel, event.args)
				if (event.channel === 'webview-navigation') {
					const direction = event.args[0]
					if (direction === 'goBack') navigatorCtrl('goBack')
					if (direction === 'goForward') navigatorCtrl('goForward')
				}
			})
		},

		navigate() {
			let url = this.currentUrl
			if (url && !url.startsWith('http://') && !url.startsWith('https://') && url !== 'about:blank') {
				url = 'https://' + url
			}
			this.tabs[this.currentTabIndex].url = url
			const webview = this.getWebview()
			if (webview) {
				webview.src = url
			}
		},

		addNewTab(url = 'about:blank') {
			console.log(`url ${typeof url}`)
			if (typeof url !== 'string') url = 'about:blank'

			this.tabs.push({
				url: url,
				title: '새 탭',
				loading: false,
				color: this.getRandomColor(),
			})
			this.currentTabIndex = this.tabs.length - 1
			this.currentUrl = url

			// 새 탭의 웹뷰에 컨텍스트 메뉴 이벤트 등록
			this.$nextTick(() => {
				const index = this.tabs.length - 1
				const webview = this.getWebview(index)
				if (webview) {
					this.setupWebviewEventListeners(webview, index)
				}
			})
		},
		closeTab(index) {
			this.tabs.splice(index, 1)
			if (this.tabs.length === 0) {
				window.electronAPI.send('window-control-action', 'close-window')
			} else {
				if (this.currentTabIndex >= index) {
					this.currentTabIndex = Math.max(0, this.currentTabIndex - 1)
				}
				this.currentUrl = this.tabs[this.currentTabIndex].url
				if (this.currentUrl === 'about:blank') {
					this.currentUrl = ''
				}
			}
		},
		switchTab(index) {
			this.currentTabIndex = index
			this.currentUrl = this.tabs[index].url
			if (this.currentUrl === 'about:blank') {
				this.currentUrl = ''
			}

			// 웹뷰 상태 업데이트
			this.setNavigationButtonsState(this.getWebview(index))
		},
		startLoading(index) {
			this.tabs[index].loading = true
		},
		stopLoading(index) {
			this.tabs[index].loading = false
			this.setNavigationButtonsState(this.getWebview(index))
		},
		updateUrl(event, index) {
			if (index === this.currentTabIndex) {
				this.currentUrl = event.url === 'about:blank' ? '' : event.url
			}
			this.tabs[index].url = event.url
		},
		updateTitle(event, index) {
			this.tabs[index].title = event.title === 'about:blank' ? '새 탭' : event.title
		},
		increaseZoom() {
			const webview = this.getWebview()
			if (webview && this.zoomLevel < 200) {
				this.zoomLevel += 10
				webview.setZoomFactor(this.zoomLevel / 100)
			}
		},
		decreaseZoom() {
			const webview = this.getWebview()
			if (webview && this.zoomLevel > 50) {
				this.zoomLevel -= 10
				webview.setZoomFactor(this.zoomLevel / 100)
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
			]
			return colors[Math.floor(Math.random() * colors.length)]
		},
		// 탭 드래그 앤 드롭 기능
		dragStart(index, event) {
			this.draggedTabIndex = index
			event.dataTransfer.effectAllowed = 'move'
		},
		drop(index, event) {
			if (this.draggedTabIndex !== null) {
				// 탭 순서 변경
				const draggedTab = this.tabs[this.draggedTabIndex]
				this.tabs.splice(this.draggedTabIndex, 1)
				this.tabs.splice(index, 0, draggedTab)

				// 현재 선택된 탭 인덱스 업데이트
				if (this.currentTabIndex === this.draggedTabIndex) {
					this.currentTabIndex = index
				} else if (this.currentTabIndex > this.draggedTabIndex && this.currentTabIndex <= index) {
					this.currentTabIndex--
				} else if (this.currentTabIndex < this.draggedTabIndex && this.currentTabIndex >= index) {
					this.currentTabIndex++
				}

				this.draggedTabIndex = null
			}
		},

		// 설정 로드 메서드
		async loadSettings() {
			try {
				// 설정에서 북마크 바 표시 여부 가져오기
				const showBookmarkBar = await window.electronAPI.invoke('get-config-value', 'settings', 'showBookmarkBar')
				// null이나 undefined가 아니면 설정값 적용
				if (showBookmarkBar !== null && showBookmarkBar !== undefined) {
					this.showBookmarkBar = showBookmarkBar
				}
			} catch (error) {
				console.error('설정 로드 오류:', error)
			}
		},

		// 북마크 관련 기능
		async loadBookmarks() {
			try {
				this.bookmarks = (await window.electronAPI.invoke('get-bookmarks')) || []
			} catch (error) {
				console.error('북마크 로드 오류:', error)
				this.bookmarks = []
			}
		},

		async saveBookmarks() {
			try {
				// 북마크 객체를 직렬화 가능한 형태로 변환
				const serializableBookmarks = this.bookmarks.map((bookmark) => ({
					title: bookmark.title,
					url: bookmark.url,
				}))

				await window.electronAPI.invoke('save-bookmarks', serializableBookmarks)
			} catch (error) {
				console.error('북마크 저장 오류:', error)
			}
		},

		// 북마크 바 토글 메서드 수정
		async toggleBookmarkBar() {
			this.showBookmarkBar = !this.showBookmarkBar
			try {
				await window.electronAPI.invoke('set-config-value', 'settings', 'showBookmarkBar', this.showBookmarkBar)
			} catch (error) {
				console.error('북마크 바 설정 저장 오류:', error)
			}
		},

		async addBookmark() {
			// 현재 URL이 비어있거나 about:blank인 경우 추가하지 않음
			if (!this.currentUrl || this.currentUrl === 'about:blank') return

			// 북마크 바가 숨겨져 있으면 표시
			if (!this.showBookmarkBar) {
				this.showBookmarkBar = true
			}

			// 현재 URL이 이미 북마크에 있는지 확인
			const existingIndex = this.bookmarks.findIndex((b) => b.url === this.currentUrl)
			if (existingIndex !== -1) {
				this.openEditBookmarkModal(existingIndex)
			} else {
				this.openAddBookmarkModal()
			}
		},

		openAddBookmarkModal() {
			this.isNewBookmark = true
			this.editingBookmarkIndex = -1
			this.editingBookmark = {
				title: this.tabs[this.currentTabIndex].title || '새 북마크',
				url: this.currentUrl,
			}
			this.showBookmarkEditModal = true

			this.$nextTick(() => {
				if (this.$refs.editTitleInput) {
					this.$refs.editTitleInput.focus()
					this.$refs.editTitleInput.select()
				}
			})
		},

		openEditBookmarkModal(index) {
			this.isNewBookmark = false
			this.editingBookmarkIndex = index
			this.editingBookmark = {
				title: this.bookmarks[index].title,
				url: this.bookmarks[index].url,
			}
			this.showBookmarkEditModal = true

			this.$nextTick(() => {
				if (this.$refs.editTitleInput) {
					this.$refs.editTitleInput.focus()
					this.$refs.editTitleInput.select()
				}
			})
		},

		closeBookmarkModal() {
			this.showBookmarkEditModal = false
			this.editingBookmarkIndex = -1
			this.editingBookmark = { title: '', url: '' }
		},

		async saveBookmark() {
			// 입력값 검증
			if (!this.editingBookmark.title.trim()) this.editingBookmark.title = '제목 없음'

			if (!this.editingBookmark.url.trim()) {
				this.editingBookmark.url = 'about:blank'
			} else if (!this.editingBookmark.url.startsWith('http://') && !this.editingBookmark.url.startsWith('https://') && this.editingBookmark.url !== 'about:blank') {
				this.editingBookmark.url = 'https://' + this.editingBookmark.url
			}

			if (this.isNewBookmark) {
				this.bookmarks.push({ ...this.editingBookmark })
			} else {
				this.bookmarks[this.editingBookmarkIndex] = { ...this.editingBookmark }
			}

			await this.saveBookmarks()
			this.closeBookmarkModal()
		},

		async deleteBookmark() {
			if (this.editingBookmarkIndex >= 0) {
				this.bookmarks.splice(this.editingBookmarkIndex, 1)
				await this.saveBookmarks()
			}
			this.closeBookmarkModal()
		},

		navigateToBookmark(url) {
			this.currentUrl = url
			this.navigate()
		},

		// 북마크 드래그 앤 드롭 기능
		dragStartBookmark(index, event) {
			this.draggedBookmarkIndex = index
			event.dataTransfer.effectAllowed = 'move'
		},

		dropBookmark(index, event) {
			if (this.draggedBookmarkIndex !== null && this.draggedBookmarkIndex !== index) {
				// 북마크 순서 변경
				const draggedBookmark = this.bookmarks[this.draggedBookmarkIndex]
				this.bookmarks.splice(this.draggedBookmarkIndex, 1)
				this.bookmarks.splice(index, 0, draggedBookmark)

				// 변경사항 저장
				this.saveBookmarks()
				this.draggedBookmarkIndex = null
			}
		},

		// 북마크 우클릭 메뉴
		showBookmarkContextMenu(index, event) {
			window.electronAPI.send('show-bookmark-context-menu', {
				x: event.clientX,
				y: event.clientY,
				bookmarkIndex: index,
			})
		},

		// 탭 컨텍스트 메뉴
		showTabContextMenu(index, event) {
			window.electronAPI.send('show-tab-context-menu', {
				x: event.clientX,
				y: event.clientY,
				tabIndex: index,
			})
		},

		// 클립보드에 복사
		copyToClipboard(text) {
			try {
				window.electronAPI.invoke('write-to-clipboard', text)
				console.log('Text copied to clipboard')
			} catch (err) {
				console.error('Failed to copy text: ', err)
			}
		},

		// 이미지 저장
		async saveImage(url) {
			try {
				const result = await window.electronAPI.invoke('save-file', {
					url: url,
					defaultPath: 'image.jpg',
				})
				if (result.success) {
					console.log('Image saved to:', result.path)
				} else {
					console.error('Failed to save image:', result.reason)
				}
			} catch (error) {
				console.error('Error saving image:', error)
			}
		},

		// 텍스트 검색
		searchGoogle(text) {
			// 검색 엔진으로 검색
			const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`
			this.addNewTab()
			this.currentUrl = searchUrl
			this.navigate()
		},

		// 검색 관련 메서드
		showPageSearch() {
			this.showSearch = true
			this.$nextTick(() => {
				if (this.$refs.searchInput) {
					this.$refs.searchInput.focus()
				}
			})
		},
		closeSearch() {
			this.showSearch = false
			this.searchText = ''
			this.searchResults = { activeMatchOrdinal: 0, matches: 0 }

			const webview = this.getWebview()
			if (webview) webview.stopFindInPage('clearSelection')
		},

		findInPage() {
			if (!this.searchText) return

			const webview = this.getWebview()
			if (webview) {
				// 이전에 등록된 이벤트 리스너가 있다면 제거
				if (this.foundInPageListener) webview.removeEventListener('found-in-page', this.foundInPageListener)

				// 새 이벤트 리스너 생성 및 저장
				this.foundInPageListener = (e) => {
					this.searchResults = {
						activeMatchOrdinal: e.result.activeMatchOrdinal,
						matches: e.result.matches,
					}
				}

				webview.addEventListener('found-in-page', this.foundInPageListener)
				webview.findInPage(this.searchText)
			}
		},
		findNext() {
			if (!this.searchText) return
			const webview = this.getWebview()
			if (webview) webview.findInPage(this.searchText, { forward: true, findNext: true })
		},

		findPrevious() {
			if (!this.searchText) return
			const webview = this.getWebview()
			if (webview) webview.findInPage(this.searchText, { forward: false, findNext: true })
		},

		showSettings() {
			console.log('설정 메뉴 표시')
		},

		showMenu() {
			console.log('추가 메뉴 표시')
		},

		// 설정 로드 메서드
		async loadSettings() {
			try {
				const settings = await window.electronAPI.invoke('get-config-section', 'settings')
				if (settings) this.showBookmarkBar = settings.showBookmarkBar || false
			} catch (error) {
				console.error('설정 로드 오류:', error)
			}
		},

		// 설정 저장 메서드
		async saveSettings() {
			try {
				const settings = {
					showBookmarkBar: this.showBookmarkBar,
				}
				await window.electronAPI.invoke('save-config-section', 'settings', settings)
			} catch (error) {
				console.error('설정 저장 오류:', error)
			}
		},

		handleResize() {
			// 창 크기 변경 시 필요한 업데이트 수행
			// tabWidth computed 속성이 자동으로 재계산됨
		},
	},
	async mounted() {
		// 설정 로드
		await this.loadSettings()

		// 북마크 로드
		await this.loadBookmarks()

		// 첫 번째 탭 생성
		const homePage = (await window.electronAPI.invoke('get-config-value', 'settings', 'defaultHomePage')) || 'about:blank'
		this.addNewTab(homePage)

		// 북마크 컨텍스트 메뉴 이벤트 리스너
		window.electronAPI.on('toggle-bookmark-bar', this.toggleBookmarkBar)

		// 웹뷰 개발자 도구 이벤트 리스너
		window.electronAPI.on('toggle-webview-devtools', (tabIndex) => {
			// tabIndex가 제공되면 해당 탭의 웹뷰 사용, 아니면 현재 탭 사용
			const index = typeof tabIndex === 'number' ? tabIndex : this.currentTabIndex
			const webview = this.getWebview(index)
			if (webview) {
				if (webview.isDevToolsOpened()) webview.closeDevTools()
				else webview.openDevTools()
			}
		})

		// 북마크 컨텍스트 메뉴 이벤트 리스너
		window.electronAPI.on('bookmark-context-menu-action', (action, index) => {
			switch (action) {
				case 'edit':
					this.openEditBookmarkModal(index)
					break
				case 'delete':
					this.editingBookmarkIndex = index
					this.deleteBookmark()
					break
				case 'open-in-new-tab':
					const url = this.bookmarks[index].url
					this.addNewTab()
					this.currentUrl = url
					this.navigate()
					break
			}
		})

		window.electronAPI.on('add-bookmark', this.addBookmark)

		// 탭 관련 이벤트 처리
		window.electronAPI.on('create-new-tab', (url) => {
			this.addNewTab()
			if (url) {
				this.currentUrl = url
				this.navigate()
			}
		})

		window.electronAPI.on('navigate-to-url', (url) => {
			this.currentUrl = url
			this.navigate()
		})

		window.electronAPI.on('close-current-tab', () => {
			this.closeTab(this.currentTabIndex)
		})

		// 탭 드래그 앤 드롭 이벤트 리스너
		window.electronAPI.on('show-page-search', this.showPageSearch())

		// 탭 컨텍스트 메뉴 이벤트 리스너
		window.electronAPI.on('refresh-tab', (index) => {
			if (index === this.currentTabIndex) {
				this.navigatorCtrl('refresh')
			} else {
				const webview = this.getWebview(index)
				if (webview) {
					webview.reload()
				}
			}
		})

		window.electronAPI.on('close-tab', (index) => {
			this.closeTab(index)
		})

		// 컨텍스트 메뉴 액션 이벤트 리스너
		window.electronAPI.on('copy-to-clipboard', (text) => {
			this.copyToClipboard(text)
		})

		window.electronAPI.on('open-link-in-new-tab', (url) => {
			this.addNewTab()
			this.currentUrl = url
			this.navigate()
		})

		window.electronAPI.on('save-image', (url) => {
			this.saveImage(url)
		})
		window.electronAPI.on('search-text', (text) => {
			this.searchGoogle(text)
		})

		window.electronAPI.on('navigatorCtrl', (action) => {
			if (action == 'goBack') this.navigatorCtrl('goBack')
			if (action == 'goForward') this.navigatorCtrl('goForward')
			if (action == 'refresh') this.navigatorCtrl('refresh')
		})

		// 창 크기 변경 감지
		window.addEventListener('resize', this.handleResize)
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.handleResize)
	},

	computed: {
		// 현재 탭의 URL
		currentTabUrl() {
			return this.tabs[this.currentTabIndex]?.url || ''
		},
		tabWidth() {
			// 브라우저 너비에서 추가 버튼과 종료 버튼 너비를 제외한 공간
			const availableWidth = window.innerWidth - 100
			// 최소 60px, 최대 150px 사이에서 탭 너비 계산 (기존 100px, 200px에서 축소)
			const calculatedWidth = Math.min(150, Math.max(60, availableWidth / this.tabs.length))
			return `${calculatedWidth}px`
		},
	},
}
</script>
