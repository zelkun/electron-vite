<!-- src/renderer/src/components/Settings/GeneralSettings.vue -->
<template>
	<div class="setting-item">
		<label>시작 페이지</label>
		<input v-model="homePage" @change="updateSetting('homePage', homePage)" placeholder="예: about:blank 또는 https://example.com" />
	</div>

	<div class="setting-item">
		<label>시작 시 동작</label>
		<select v-model="startupAction" @change="updateSetting('startupAction', startupAction)">
			<option value="newTab">새 탭 열기</option>
			<option value="homePage">홈페이지 열기</option>
			<option value="lastSession">이전 세션 복원</option>
		</select>
	</div>
</template>

<script>
export default {
	async mounted() {
		this.homePage = (await window.electronAPI.invoke('get-config-value', 'settings', 'homePage')) || 'about:blank'; // 기본값 설정
		this.startupAction = (await window.electronAPI.invoke('get-config-value', 'settings', 'startupAction')) || 'newTab'; // 기본값 설정
	},
};
</script>
