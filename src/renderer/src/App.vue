<template>
	<div class="browser-container">
		<!-- 탭 영역 -->
		<div class="browser-tabs">
			<div v-for="(tab, index) in tabs" :key="index" @click="switchTab(index)" :class="['tab', { active: currentTabIndex === index }]" :style="{ borderTop: `3px solid ${tab.color}` }" draggable="true" @dragstart="dragStart(index, $event)" @dragover.prevent @drop="drop(index, $event)">
				<span class="tab-title">{{ tab.title || '새 탭' }}</span>
				<button @click.stop="closeTab(index)" class="close-tab">×</button>
			</div>
			<button @click="addNewTab" class="add-tab">+</button>
		</div>

		<!-- 주소창 및 네비게이션 영역 -->
		<div class="browser-toolbar">
			<div class="navigation-buttons">
				<button @click="goBack" :disabled="!canGoBack" class="nav-btn">◀</button>
				<button @click="goForward" :disabled="!canGoForward" class="nav-btn">▶</button>
				<button @click="refresh" class="nav-btn">↻</button>
				<button @click="goHome" class="nav-btn">🏠</button>
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
					<div v-for="(bookmark, index) in bookmarks" :key="index" class="bookmark-item" draggable="true" @dragstart="dragStartBookmark(index, $event)" @dragover.prevent @drop="dropBookmark(index, $event)" @contextmenu.prevent="showBookmarkContextMenu(index, $event)">
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

		<!-- 웹뷰 영역 -->
		<div class="webview-container">
			<webview v-for="(tab, index) in tabs" :key="index" :id="`webview-${index}`" :src="tab.url" :style="{ display: currentTabIndex === index ? 'flex' : 'none' }" class="webview" webpreferences="nodeIntegration=false, contextIsolation=true" @did-start-loading="startLoading(index)" @did-stop-loading="stopLoading(index)" @did-navigate="updateUrl($event, index)" @page-title-updated="updateTitle($event, index)"></webview>
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
			tabs: [
				{
					url: 'https://www.g2b.go.kr/',
					title: '새 탭',
					loading: false,
					color: this.getRandomColor(),
				},
			],
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
		}
	},
	methods: {
		navigate() {
			let url = this.currentUrl
			if (url && !url.startsWith('http://') && !url.startsWith('https://') && url !== 'about:blank') {
				url = 'https://' + url
			}
			this.tabs[this.currentTabIndex].url = url
			const webview = document.querySelector(`#webview-${this.currentTabIndex}`)
			if (webview) {
				webview.src = url
			}
		},
		goBack() {
			const webview = document.querySelector(`#webview-${this.currentTabIndex}`)
			if (webview && webview.canGoBack()) {
				webview.goBack()
			}
		},
		goForward() {
			const webview = document.querySelector(`#webview-${this.currentTabIndex}`)
			if (webview && webview.canGoForward()) {
				webview.goForward()
			}
		},
		refresh() {
			const webview = document.querySelector(`#webview-${this.currentTabIndex}`)
			if (webview) {
				webview.reload()
			}
		},
		goHome() {
			this.currentUrl = ''
			this.tabs[this.currentTabIndex].url = 'about:blank'
			const webview = document.querySelector(`#webview-${this.currentTabIndex}`)
			if (webview) {
				webview.src = 'about:blank'
			}
		},
		addNewTab() {
			this.tabs.push({
				url: 'about:blank',
				title: '새 탭',
				loading: false,
				color: this.getRandomColor(),
			})
			this.currentTabIndex = this.tabs.length - 1
			this.currentUrl = ''
		},
		closeTab(index) {
			if (this.tabs.length > 1) {
				this.tabs.splice(index, 1)
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
			const webview = document.querySelector(`#webview-${index}`)
			if (webview) {
				this.canGoBack = webview.canGoBack()
				this.canGoForward = webview.canGoForward()
			}
		},
		startLoading(index) {
			this.tabs[index].loading = true
		},
		stopLoading(index) {
			this.tabs[index].loading = false

			const webview = document.querySelector(`#webview-${index}`)
			if (webview && index === this.currentTabIndex) {
				this.canGoBack = webview.canGoBack()
				this.canGoForward = webview.canGoForward()
			}
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
			const webview = document.querySelector(`#webview-${this.currentTabIndex}`)
			if (webview && this.zoomLevel < 200) {
				this.zoomLevel += 10
				webview.setZoomFactor(this.zoomLevel / 100)
			}
		},
		decreaseZoom() {
			const webview = document.querySelector(`#webview-${this.currentTabIndex}`)
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

		toggleBookmarkBar() {
			this.showBookmarkBar = !this.showBookmarkBar
		},

		async addBookmark() {
			// 현재 URL이 비어있거나 about:blank인 경우 추가하지 않음
			if (!this.currentUrl || this.currentUrl === 'about:blank') {
				return
			}

			// 북마크 바가 숨겨져 있으면 표시
			if (!this.showBookmarkBar) {
				this.showBookmarkBar = true
			}

			// 현재 URL이 이미 북마크에 있는지 확인
			const existingIndex = this.bookmarks.findIndex((b) => b.url === this.currentUrl)

			if (existingIndex !== -1) {
				// 이미 있는 북마크면 편집 모달 표시
				this.openEditBookmarkModal(existingIndex)
			} else {
				// 새 북마크 추가 모달 표시
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
			if (!this.editingBookmark.title.trim()) {
				this.editingBookmark.title = '제목 없음'
			}

			if (!this.editingBookmark.url.trim()) {
				this.editingBookmark.url = 'about:blank'
			} else if (!this.editingBookmark.url.startsWith('http://') && !this.editingBookmark.url.startsWith('https://') && this.editingBookmark.url !== 'about:blank') {
				this.editingBookmark.url = 'https://' + this.editingBookmark.url
			}

			if (this.isNewBookmark) {
				// 새 북마크 추가
				this.bookmarks.push({ ...this.editingBookmark })
			} else {
				// 기존 북마크 수정
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

		showSettings() {
			// 설정 메뉴 표시 기능 구현
			console.log('설정 메뉴 표시')
		},

		showMenu() {
			// 추가 메뉴 표시 기능 구현
			console.log('추가 메뉴 표시')
		},
	},
	async mounted() {
		// 북마크 로드
		await this.loadBookmarks()

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

		// 메뉴에서 북마크 관련 이벤트 처리
		window.electronAPI.on('toggle-bookmark-bar', () => {
			this.toggleBookmarkBar()
		})

		window.electronAPI.on('add-bookmark', () => {
			this.addBookmark()
		})

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

		// 웹뷰 이벤트 리스너 설정
		setTimeout(() => {
			const webview = document.querySelector('#webview-0')
			if (webview) {
				webview.addEventListener('dom-ready', () => {
					this.canGoBack = webview.canGoBack()
					this.canGoForward = webview.canGoForward()
				})
			}
		}, 1000)
	},
}
</script>

<style>
html,
body {
	height: 100%;
	overflow: hidden;
	margin: 0;
	padding: 0;
}

.browser-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f0f0f0;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	overflow: hidden;
}

.browser-tabs {
	display: flex;
	background-color: #4285f4; /* 구글 파란색으로 변경 */
	padding: 0 8px;
	height: 40px;
	flex-wrap: nowrap;
	overflow-x: auto;
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
}

.browser-tabs::-webkit-scrollbar {
	display: none; /* Chrome, Safari, Opera */
}

.tab {
	display: flex;
	align-items: center;
	padding: 0 15px;
	min-width: 120px;
	max-width: 200px;
	background-color: #fff;
	margin: 5px 2px 0;
	border-radius: 8px 8px 0 0;
	cursor: pointer;
	border: 1px solid #ddd;
	border-bottom: none;
	position: relative;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	height: 35px;
	flex-shrink: 0;
}

.tab.active {
	background-color: #fff;
	z-index: 1;
	font-weight: 500;
}

.tab-title {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 13px;
}

.close-tab {
	background: none;
	border: none;
	font-size: 16px;
	margin-left: 5px;
	cursor: pointer;
	padding: 0 5px;
	border-radius: 50%;
}

.close-tab:hover {
	background-color: rgba(0, 0, 0, 0.1);
}

.add-tab {
	padding: 8px 12px;
	background-color: transparent;
	border: none;
	margin: 5px 0 0;
	cursor: pointer;
	font-size: 18px;
	color: #fff;
	flex-shrink: 0;
}

.browser-toolbar {
	display: flex;
	align-items: center;
	padding: 8px;
	background-color: #f8f8f8;
	border-bottom: 1px solid #ddd;
	flex-shrink: 0;
}

.navigation-buttons {
	display: flex;
	margin-right: 10px;
	flex-shrink: 0;
}

.nav-btn,
.action-btn,
.zoom-btn {
	background-color: transparent;
	border: none;
	border-radius: 4px;
	padding: 6px 10px;
	margin: 0 2px;
	cursor: pointer;
	color: #555;
}

.nav-btn:hover,
.action-btn:hover,
.zoom-btn:hover {
	background-color: #e0e0e0;
}

.nav-btn:disabled {
	color: #ccc;
	cursor: not-allowed;
}

.action-btn.active {
	background-color: #e0e0e0;
	color: #4285f4;
}

.address-bar {
	flex: 1;
	display: flex;
	margin: 0 10px;
	min-width: 0;
}

.url-input {
	flex: 1;
	padding: 8px 12px;
	border: 1px solid #ddd;
	border-radius: 20px;
	font-size: 14px;
	outline: none;
	min-width: 0;
}

.url-input:focus {
	border-color: #4285f4;
	box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.go-btn {
	margin-left: 5px;
	padding: 8px 15px;
	background-color: #4285f4;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	flex-shrink: 0;
}

.browser-actions {
	display: flex;
	flex-shrink: 0;
}

/* 북마크 바 스타일 */
.bookmark-bar {
	display: flex;
	background-color: #f8f8f8;
	border-bottom: 1px solid #ddd;
	padding: 6px 8px;
	overflow-x: auto;
	scrollbar-width: none;
	-ms-overflow-style: none;
}

.bookmark-bar::-webkit-scrollbar {
	display: none;
}

.bookmark-items {
	display: flex;
	flex-wrap: nowrap;
	width: 100%;
}

.bookmark-item {
	margin: 0 5px;
	white-space: nowrap;
	flex-shrink: 0;
}

.bookmark-view {
	display: flex;
	align-items: center;
}

.bookmark-link {
	display: flex;
	align-items: center;
	padding: 6px 10px;
	background-color: transparent;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	color: #555;
	font-size: 13px;
	max-width: 200px;
	overflow: hidden;
	text-overflow: ellipsis;
}

.bookmark-link:hover {
	background-color: #e0e0e0;
}

.bookmark-favicon {
	margin-right: 5px;
	font-size: 14px;
}

.bookmark-title {
	overflow: hidden;
	text-overflow: ellipsis;
}

.bookmark-edit-btn {
	background: none;
	border: none;
	font-size: 14px;
	cursor: pointer;
	padding: 4px;
	border-radius: 50%;
	visibility: hidden;
}

.bookmark-item:hover .bookmark-edit-btn {
	visibility: visible;
}

.bookmark-edit {
	display: flex;
	flex-direction: column;
	background-color: white;
	border: 1px solid #ddd;
	border-radius: 4px;
	padding: 10px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	position: absolute;
	z-index: 10;
	width: 300px;
}

.bookmark-input {
	margin-bottom: 8px;
	padding: 8px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 13px;
}

.bookmark-edit-actions {
	display: flex;
	justify-content: space-between;
}

.bookmark-btn {
	padding: 6px 12px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 13px;
}

.save-btn {
	background-color: #4285f4;
	color: white;
}

.cancel-btn {
	background-color: #f0f0f0;
	color: #555;
}

.delete-btn {
	background-color: #ea4335;
	color: white;
}

.webview-container {
	flex: 1;
	background-color: #fff;
	overflow: hidden;
}

.webview {
	width: 100%;
	height: 100%;
	border: none;
}

.status-bar {
	display: flex;
	justify-content: space-between;
	padding: 5px 10px;
	background-color: #f8f8f8;
	border-top: 1px solid #ddd;
	font-size: 12px;
	color: #666;
	flex-shrink: 0;
}

.loading-status {
	display: flex;
	align-items: center;
}

.zoom-controls {
	display: flex;
	align-items: center;
	gap: 5px;
}

/* 북마크 바 스타일 수정 */
.bookmark-bar {
	display: flex;
	background-color: #f8f8f8;
	border-bottom: 1px solid #ddd;
	padding: 6px 8px;
	overflow-x: auto;
	scrollbar-width: none;
	-ms-overflow-style: none;
}

.bookmark-bar::-webkit-scrollbar {
	display: none;
}

.bookmark-items {
	display: flex;
	flex-wrap: nowrap;
	width: 100%;
}

.bookmark-item {
	margin: 0 2px;
	white-space: nowrap;
	flex-shrink: 0;
}

.bookmark-empty {
	display: flex;
	align-items: center;
	color: #666;
	font-size: 13px;
	padding: 0 10px;
}

.bookmark-add-btn {
	margin-left: 10px;
	padding: 4px 8px;
	background-color: #4285f4;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 12px;
}

.bookmark-link {
	display: flex;
	align-items: center;
	padding: 6px 10px;
	background-color: transparent;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	color: #555;
	font-size: 13px;
	max-width: 200px;
	overflow: hidden;
	text-overflow: ellipsis;
}

.bookmark-link:hover {
	background-color: #e0e0e0;
}

.bookmark-favicon {
	margin-right: 5px;
	font-size: 14px;
}

.bookmark-title {
	overflow: hidden;
	text-overflow: ellipsis;
}

/* 북마크 모달 스타일 */
.bookmark-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.bookmark-modal-content {
	background-color: white;
	border-radius: 8px;
	width: 400px;
	max-width: 90%;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	overflow: hidden;
}

.bookmark-modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px;
	border-bottom: 1px solid #eee;
}

.bookmark-modal-header h3 {
	margin: 0;
	font-size: 18px;
	color: #333;
}

.modal-close-btn {
	background: none;
	border: none;
	font-size: 20px;
	cursor: pointer;
	color: #666;
}

.bookmark-modal-body {
	padding: 16px;
}

.form-group {
	margin-bottom: 16px;
}

.form-group label {
	display: block;
	margin-bottom: 8px;
	font-size: 14px;
	color: #555;
}

.bookmark-input {
	width: 100%;
	padding: 8px 12px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 14px;
	box-sizing: border-box;
}

.bookmark-input:focus {
	border-color: #4285f4;
	outline: none;
	box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.bookmark-modal-footer {
	display: flex;
	justify-content: space-between;
	padding: 16px;
	border-top: 1px solid #eee;
}

.modal-actions {
	display: flex;
	gap: 8px;
}

.bookmark-btn {
	padding: 8px 16px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 14px;
}

.save-btn {
	background-color: #4285f4;
	color: white;
}

.cancel-btn {
	background-color: #f0f0f0;
	color: #555;
}

.delete-btn {
	background-color: #ea4335;
	color: white;
}
</style>

