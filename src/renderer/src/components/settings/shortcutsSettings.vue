<!-- src/renderer/src/components/Settings/ShortcutsSettings.vue -->
<template>
	<div class="settings-section">
		<h2>단축키 설정</h2>
		<div class="setting-item" v-for="(shortcut, key) in shortcuts" :key="key">
			<label>{{ shortcut.label }}</label>
			<input type="text" v-model="shortcut.value" @change="saveShortcut(key, shortcut.value)" placeholder="예: Ctrl+Shift+N" />
			<button @click="resetShortcut(key)">초기화</button>
		</div>
		<div class="setting-item">
			<button @click="applyShortcuts">단축키 적용</button>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			shortcuts: {
				newTab: { label: '새 탭', value: '' },
				closeTab: { label: '탭 닫기', value: '' },
				search: { label: '검색', value: '' },
			},
		};
	},
	computed: {
		defaultShortcuts() {
			return {
				newTab: 'Ctrl+T',
				closeTab: 'Ctrl+W',
				search: 'Ctrl+F',
			};
		},
	},
	async mounted() {
		// 기존 단축키 값을 불러옴
		for (const key in this.shortcuts) {
			this.shortcuts[key].value = (await window.electronAPI.invoke('get-config-value', 'shortcuts', key)) || this.defaultShortcuts[key];
		}
	},
	methods: {
		async saveShortcut(key, value) {
			await window.electronAPI.invoke('save-setting', `shortcuts.${key}`, value);
			window.electronAPI.send('reload-menu'); // 단축키 변경 시 메뉴 갱신 요청
		},
		resetShortcut(key) {
			this.shortcuts[key].value = this.defaultShortcuts[key];
			this.saveShortcut(key, this.defaultShortcuts[key]);
		},
		async applyShortcuts() {
			await window.electronAPI.invoke('apply-shortcuts', this.getShortcutsConfig());
			alert('단축키가 적용되었습니다.');
		},
		getShortcutsConfig() {
			const config = {};
			for (const key in this.shortcuts) {
				config[key] = this.shortcuts[key].value;
			}
			return config;
		},
	},
};
</script>
