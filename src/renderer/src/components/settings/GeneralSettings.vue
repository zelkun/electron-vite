<!-- src/renderer/src/components/settings/GeneralSettings.vue -->
<template>
	<div class="settings-section">
		<h2>시작 시 설정</h2>
		<div class="setting-item">
			<label>앱 시작 시 동작</label>
			<div>
				<label>
					<input v-model="startupAction" type="radio" value="newTab" @change="saveStartupAction" />
					새 탭 페이지 열기
				</label>
				<label>
					<input v-model="startupAction" type="radio" value="homePage" @change="saveStartupAction" />
					홈페이지 열기
				</label>
			</div>
		</div>
		<div v-if="startupAction === 'homePage'" class="setting-item">
			<label>홈페이지 주소</label>
			<input v-model="homePage" placeholder="https://example.com" @change="saveHomePage" />
		</div>

		<!-- 북마크 리스트 추가 -->
		<div v-if="startupAction === 'homePage'" class="setting-item bookmark-list-container">
			<label>북마크에서 선택</label>
			<ul class="bookmark-select-list">
				<li v-for="(bookmark, idx) in bookmarks" :key="idx" :class="{ selected: bookmark.url === homePage }" @click="selectBookmark(bookmark.url)">
					{{ bookmark.title || bookmark.url }}
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			startupAction: 'newTab',
			homePage: '',
			bookmarks: [],
		};
	},
	async mounted() {
		this.startupAction = (await window.electronAPI.invoke('get-config-value', 'settings', 'startupAction')) || 'newTab';
		this.homePage = (await window.electronAPI.invoke('get-config-value', 'settings', 'homePage')) || '';
		try {
			this.bookmarks = (await window.electronAPI.invoke('get-bookmarks')) || [];
		} catch (e) {
			this.bookmarks = [];
		}
	},
	methods: {
		async saveStartupAction() {
			await window.electronAPI.invoke('save-setting', 'startupAction', this.startupAction);
			this.$emit('update-setting', { key: 'startupAction', value: this.startupAction });
		},
		async saveHomePage() {
			await window.electronAPI.invoke('save-setting', 'homePage', this.homePage);
			this.$emit('update-setting', { key: 'homePage', value: this.homePage });
		},
		selectBookmark(url) {
			this.homePage = url;
			this.saveHomePage();
		},
	},
};
</script>
<style>
.bookmark-list-container {
	margin-top: 0px;
}

.bookmark-select-list {
	max-height: 50vh; /* 화면 높이의 50%까지 최대 높이 제한 */
	overflow-y: auto; /* 수직 스크롤 자동 표시 */
	border: 1px solid var(--border-color);
	border-radius: 6px;
	background-color: var(--modal-bg);
	padding: 0;
	list-style: none;
}

.bookmark-select-list li {
	padding: 10px 15px;
	cursor: pointer;
	border-bottom: 1px solid var(--border-color);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	transition: background 0.2s;
}

.bookmark-select-list li:last-child {
	border-bottom: none;
}

.bookmark-select-list li.selected {
	background-color: var(--action-hover);
	font-weight: bold;
}

.bookmark-select-list li:hover {
	background-color: var(--bookmark-link-hover);
}
</style>
