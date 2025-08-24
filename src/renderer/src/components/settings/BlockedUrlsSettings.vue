<!-- src/renderer/src/components/settings/BlockedUrlsSettings.vue -->
<template>
	<div class="settings-section">
		<h2>차단 URL 관리</h2>
		<input v-model="searchKeyword" placeholder="검색어를 입력하세요" @input="handleSearch" class="url-search-input" />

		<ul class="blocked-url-list">
			<li v-for="(url, idx) in filteredUrls" :key="idx" class="blocked-url-item">
				<input v-model="editableUrls[idx]" class="url-edit-input" />
				<button @click="removeUrl(idx)">삭제</button>
			</li>
		</ul>

		<div class="add-url-container">
			<input v-model="newUrl" placeholder="새 URL 입력" class="url-add-input" @keyup.enter="addUrl" />
			<button @click="addUrl" :disabled="!isValidUrl(newUrl)">추가</button>
		</div>

		<button @click="saveUrls">저장</button>
	</div>
</template>

<script>
export default {
	data() {
		return {
			urls: [],
			filteredUrls: [],
			editableUrls: [],
			newUrl: '',
			searchKeyword: '',
		};
	},
	async mounted() {
		this.urls = await window.electronAPI.invoke('get-blocked-urls');
		this.editableUrls = [...this.urls];
		this.filteredUrls = [...this.urls];
	},
	methods: {
		handleSearch() {
			const keyword = this.searchKeyword.toLowerCase();
			this.filteredUrls = this.editableUrls.filter((url) => url.toLowerCase().includes(keyword));
		},
		isValidUrl(value) {
			return value.trim().length > 0;
		},
		addUrl() {
			if (this.newUrl.trim() === '') return;
			this.editableUrls.push(this.newUrl.trim());
			this.filteredUrls = [...this.editableUrls];
			this.newUrl = '';
		},
		removeUrl(idx) {
			this.editableUrls.splice(idx, 1);
			this.filteredUrls = [...this.editableUrls];
		},
		async saveUrls() {
			try {
				const sanitizedUrls = JSON.parse(JSON.stringify(this.editableUrls));
				const success = await window.electronAPI.invoke('save-blocked-urls', sanitizedUrls);
				if (success) {
					this.urls = [...sanitizedUrls];
					alert('변경사항이 저장되었습니다.');
				} else {
					alert('저장에 실패했습니다.');
				}
			} catch (error) {
				console.error('저장 중 오류:', error);
				alert('저장 중 문제가 발생했습니다. 콘솔 로그 확인 바랍니다.');
			}
		},
	},
};
</script>

<style scoped>
.settings-section {
	padding: 16px 24px;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
	margin-bottom: 20px;
	font-weight: 600;
	font-size: 1.5rem;
	color: var(--text-color);
}

.url-search-input {
	width: 100%;
	padding: 10px 12px;
	font-size: 1rem;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	margin-bottom: 20px;
	box-sizing: border-box;
	transition: border-color 0.2s ease-in-out;
}

.url-search-input:focus {
	border-color: #4285f4;
	outline: none;
	box-shadow: 0 0 4px rgba(66, 133, 244, 0.6);
}

.blocked-url-list {
	max-height: 320px;
	overflow-y: auto;
	padding: 0;
	margin-bottom: 20px;
	list-style: none;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	background-color: var(--modal-bg);
}

.blocked-url-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px 15px;
	border-bottom: 1px solid var(--border-color);
	font-size: 1rem;
}

.blocked-url-item:last-child {
	border-bottom: none;
}

.url-edit-input {
	flex-grow: 1;
	padding: 8px 10px;
	font-size: 1rem;
	border: 1px solid var(--border-color);
	border-radius: 4px;
	box-sizing: border-box;
	transition: border-color 0.2s ease-in-out;
}

.url-edit-input:focus {
	border-color: #4285f4;
	outline: none;
	box-shadow: 0 0 4px rgba(66, 133, 244, 0.6);
}

.blocked-url-item button {
	background: #ea4335;
	color: white;
	border: none;
	border-radius: 4px;
	padding: 6px 14px;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.3s ease;
}

.blocked-url-item button:hover {
	background: #c53030;
}

.add-url-container {
	display: flex;
	gap: 10px;
	margin-bottom: 20px;
}

.url-add-input {
	flex-grow: 1;
	padding: 10px 12px;
	font-size: 1rem;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	box-sizing: border-box;
	transition: border-color 0.2s ease-in-out;
}

.url-add-input:focus {
	border-color: #4285f4;
	outline: none;
	box-shadow: 0 0 6px rgba(66, 133, 244, 0.7);
}

button[disabled],
button:disabled {
	background-color: var(--border-color);
	cursor: not-allowed;
	color: #999;
}

button {
	background-color: #4285f4;
	color: white;
	border: none;
	padding: 10px 22px;
	border-radius: 6px;
	font-size: 1rem;
	cursor: pointer;
	font-weight: 600;
	transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
	background-color: #2a69d1;
}
</style>
