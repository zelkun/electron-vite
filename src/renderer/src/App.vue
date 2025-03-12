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
				<button @click="toggleBookmarks" class="action-btn">📚</button>
				<button @click="showSettings" class="action-btn">⚙️</button>
				<button @click="showMenu" class="action-btn">⋮</button>
			</div>
		</div>

		<!-- 북마크 리스트 -->
		<div v-if="showBookmarksList" class="bookmarks-list">
			<ul class="chrome-bookmarks-list">
				<li v-for="(bookmark, index) in bookmarks" :key="index" class="chrome-bookmark-item">
					<div class="chrome-bookmark-icon"></div>
					<div class="chrome-bookmark-info">
						<span class="chrome-bookmark-title">{{ bookmark.title }}</span>
						<span class="chrome-bookmark-url">{{ bookmark.url }}</span>
					</div>
					<div class="chrome-bookmark-actions">
						<button @click="editBookmark(index)">수정</button>
						<button @click="deleteBookmark(index)">삭제</button>
					</div>
				</li>
			</ul>
			<button v-if="!bookmarks.length" @click="addBookmark" class="add-bookmark-btn">북마크 추가</button>
		</div>
		<!-- 북마크 에디터 -->
		<div v-if="editingBookmark" class="edit-bookmark-form chrome-edit-form">
			<div class="chrome-edit-form-header">
				<span>수정</span>
				<button @click="cancelEditing">✕</button>
			</div>
			<div class="chrome-edit-form-body">
				<label for="title">제목:</label>
				<input v-model="editedBookmark.title" id="title" type="text" />
				<label for="url">URL:</label>
				<input v-model="editedBookmark.url" id="url" type="text" />
			</div>
			<div class="chrome-edit-form-footer">
				<button @click="saveEditedBookmark">저장</button>
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
const electronAPI = window.electronAPI ? window.electronAPI : null

export default {
	data() {
		return {
			tabs: [
				{
					url: 'https://www.g2b.go.kr',
					title: '시작페이지',
					loading: false,
					color: this.getRandomColor(),
				},
			],
			currentTabIndex: 0,
			currentUrl: 'https://www.g2b.go.kr',
			canGoBack: false,
			canGoForward: false,
			zoomLevel: 100,
			draggedTabIndex: null,
			showBookmarksList: false,
			bookmarks: [],
			editingBookmark: false,
			editedBookmarkIndex: null,
			editedBookmark: {
				title: '',
				url: '',
			},
			isAddingBookmark: false,
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
		showSettings() {
			// 설정 메뉴 표시 기능 구현
			console.log('설정 메뉴 표시')
		},
		showMenu() {
			// 추가 메뉴 표시 기능 구현
			console.log('추가 메뉴 표시')
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

		addBookmark() {
			window.electronAPI.send('add-bookmark', this.currentUrl, this.tabs[this.currentTabIndex].title || '새 북마크')
			this.editedBookmark.title = this.tabs[this.currentTabIndex].title || '새 북마크'
			this.editedBookmark.url = this.currentUrl
			this.editingBookmark = true
			this.toggleBookmarks() // 북마크 리스트 갱신
		},
		saveEditedBookmark() {
			if (!this.editedBookmark) {
				this.editedBookmark = {
					title: '',
					url: '',
				}
			}
			if (this.isAddingBookmark) {
				window.electronAPI.send('add-bookmark', this.editedBookmark.url, this.editedBookmark.title)
				this.isAddingBookmark = false
			} else {
				const bookmarks = JSON.parse(JSON.stringify(this.bookmarks))
				if (this.editedBookmarkIndex !== null) {
					bookmarks[this.editedBookmarkIndex].title = this.editedBookmark.title
					bookmarks[this.editedBookmarkIndex].url = this.editedBookmark.url
				}
				window.electronAPI.send('save-bookmarks', bookmarks)
			}
			this.editingBookmark = false
			this.toggleBookmarks() // 북마크 리스트 갱신
		},
		toggleBookmarks() {
			if (!this.showBookmarksList) {
				window.electronAPI.send('load-bookmarks')
				window.electronAPI.on('bookmarks-loaded', (bookmarks) => {
					this.bookmarks = bookmarks
				})
			}
			this.showBookmarksList = !this.showBookmarksList
		},

		editBookmark(index) {
			this.editedBookmarkIndex = index
			this.editedBookmark.title = this.bookmarks[index].title
			this.editedBookmark.url = this.bookmarks[index].url
			this.editingBookmark = true
		},

		deleteBookmark(index) {
			const bookmarks = JSON.parse(JSON.stringify(this.bookmarks)) // 직렬화 가능한 형태로 변환
			bookmarks.splice(index, 1)
			window.electronAPI.send('save-bookmarks', bookmarks)
			this.bookmarks = bookmarks
		},
		cancelEditing() {
			this.editingBookmark = false
		},
	},
	mounted() {
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

		window.electronAPI.on('bookmarks-updated', (bookmarks) => {
			this.bookmarks = bookmarks
		})
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

<style scoped > .chrome-bookmarks-list {
	list-style: none;
	padding: 0;
	margin: 0;
}

.chrome-bookmark-item {
	display: flex;
	align-items: center;
	padding: 8px;
	border-bottom: 1px solid #ddd;
}

.chrome-bookmark-icon {
	width: 16px;
	height: 16px;
	background-color: #ccc;
	border-radius: 50%;
	margin-right: 8px;
}

.chrome-bookmark-info {
	flex: 1;
}

.chrome-bookmark-title {
	font-weight: bold;
	font-size: 14px;
}

.chrome-bookmark-url {
	font-size: 12px;
	color: #666;
}

.chrome-bookmark-actions {
	margin-left: 8px;
}

.chrome-bookmark-actions button {
	padding: 4px 8px;
	border: none;
	border-radius: 4px;
	background-color: #f0f0f0;
	cursor: pointer;
}

.chrome-bookmark-actions button:hover {
	background-color: #e0e0e0;
}

<style scoped > .chrome-edit-form {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: #fff;
	padding: 20px;
	border: 1px solid #ddd;
	border-radius: 10px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	width: 400px;
}

.chrome-edit-form-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
}

.chrome-edit-form-header span {
	font-weight: bold;
}

.chrome-edit-form-header button {
	background: none;
	border: none;
	font-size: 18px;
	cursor: pointer;
}

.chrome-edit-form-body {
	margin-bottom: 20px;
}

.chrome-edit-form-body label {
	display: block;
	margin-bottom: 5px;
}

.chrome-edit-form-body input {
	width: 100%;
	padding: 10px;
	margin-bottom: 15px;
	border: 1px solid #ccc;
	border-radius: 5px;
}

.chrome-edit-form-footer {
	text-align: right;
}

.chrome-edit-form-footer button {
	padding: 10px 20px;
	background-color: #4285f4;
	color: white;
	border: none;
	border-radius: 5px;
	cursor: pointer;
}

.chrome-edit-form-footer button:hover {
	background-color: #3b7bff;
}

.add-bookmark-btn {
	padding: 10px;
	border: none;
	border-radius: 5px;
	background-color: #f0f0f0;
	cursor: pointer;
}

.add-bookmark-btn:hover {
	background-color: #e0e0e0;
}
</style>

