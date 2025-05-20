<template>
	<div class="setting-item">
		<label>시작 페이지</label>
		<input v-model="homePage" placeholder="예: about:blank 또는 https://example.com" @input="updateSetting('homePage', homePage)" />
	</div>

	<div class="setting-item">
		<label>시작 시 동작</label>
		<select :key="startupAction" v-model="startupAction" @change="updateSetting('startupAction', startupAction)">
			<option value="newTab">새 탭 열기</option>
			<option value="homePage">홈페이지 열기</option>
			<option value="lastSession">이전 세션 복원</option>
		</select>
	</div>
</template>

<script>
export default {
	data() {
		return {
			homePage: 'about:blank',
			startupAction: 'newTab',
		};
	},
	async mounted() {
		this.homePage = (await window.electronAPI.invoke('get-config-value', 'settings', 'homePage')) || 'about:blank';
		this.startupAction = (await window.electronAPI.invoke('get-config-value', 'settings', 'startupAction')) || 'newTab';
	},
	methods: {
		updateSetting(key, value) {
			this.$emit('update-setting', { key, value });
		},
	},
};
</script>
