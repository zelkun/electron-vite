<!-- src/renderer/src/components/settings/AppearanceSettings.vue -->
<template>
	<div class="settings-section">
		<h2>테마 모드</h2>
		<div class="setting-item">
			<label>테마 모드</label>
			<select v-model="theme" @change="saveTheme">
				<option value="system">시스템 설정 따름</option>
				<option value="light">라이트 모드</option>
				<option value="dark">다크 모드</option>
			</select>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			theme: 'system',
		};
	},
	async mounted() {
		this.theme = await window.electronAPI.invoke('get-config-value', 'settings', 'theme');
	},
	methods: {
		saveTheme() {
			this.$emit('update-setting', {
				key: 'theme',
				value: this.theme,
			});
			document.documentElement.setAttribute('data-theme', this.theme);
		},
	},
};
</script>
