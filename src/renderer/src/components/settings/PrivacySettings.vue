<!-- src/renderer/src/components/Settings/PrivacySettings.vue-->
<template>
	<div class="settings-section">
		<h2>개인정보 및 보안</h2>
		<div class="setting-item">
			<label>
				<input type="checkbox" v-model="acceptCookies" @change="updateSetting('acceptCookies', acceptCookies)" />
				쿠키 허용
			</label>
		</div>
		<div class="setting-item">
			<label>
				<input type="checkbox" v-model="saveHistory" @change="updateSetting('saveHistory', saveHistory)" />
				방문 기록 저장
			</label>
		</div>
		<div class="setting-item">
			<button @click="clearHistory">방문 기록 삭제</button>
			<button @click="clearCookies">쿠키 삭제</button>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			acceptCookies: true,
			saveHistory: true,
		};
	},
	async mounted() {
		this.acceptCookies = (await window.electronAPI.invoke('get-config-value', 'settings', 'acceptCookies')) ?? true;
		this.saveHistory = (await window.electronAPI.invoke('get-config-value', 'settings', 'saveHistory')) ?? true;
	},
	methods: {
		updateSetting(key, value) {
			this.$emit('update-setting', { key, value });
		},
		async clearHistory() {
			// Electron 세션 기록 삭제
			await window.electronAPI.invoke('clear-history');
			alert('방문 기록이 삭제되었습니다.');
		},
		async clearCookies() {
			await window.electronAPI.invoke('clear-cookies');
			alert('쿠키가 삭제되었습니다.');
		},
	},
};
</script>
