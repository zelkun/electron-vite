<!-- src/renderer/src/components/settings/GeneralSettings.vue -->
<template>
	<div class="settings-section">
		<h2>시작 시 설정</h2>
		<div class="setting-item">
			<label>앱 시작 시 동작</label>
			<div>
				<label>
					<input v-model="startupAction" type="radio" value="newTab" @change="savestartupAction" />
					새 탭 페이지 열기
				</label>
				<label>
					<input v-model="startupAction" type="radio" value="homePage" @change="savestartupAction" />
					홈페이지 열기
				</label>
			</div>
		</div>
		<div v-if="startupAction === 'homePage'" class="setting-item">
			<label>홈페이지 주소</label>
			<input v-model="homePage" placeholder="https://example.com" @change="saveHomePage" />
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			startupAction: 'newTab',
			homePage: '',
		};
	},
	async mounted() {
		this.startupAction = (await window.electronAPI.invoke('get-config-value', 'settings', 'startupAction')) || 'newTab';
		this.homePage = (await window.electronAPI.invoke('get-config-value', 'settings', 'homePage')) || '';
	},
	methods: {
		async savestartupAction() {
			await window.electronAPI.invoke('save-setting', 'startupAction', this.startupAction);
			this.$emit('update-setting', { key: 'startupAction', value: this.startupAction });
		},
		async saveHomePage() {
			await window.electronAPI.invoke('save-setting', 'homePage', this.homePage);
			this.$emit('update-setting', { key: 'homePage', value: this.homePage });
		},
	},
};
</script>
