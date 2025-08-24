<!-- src/renderer/src/components/settings/Settings.vue -->
<template>
	<div class="settings-wrapper">
		<div class="settings-container">
			<!-- 좌측 네비게이션 -->
			<nav class="settings-nav">
				<div v-for="category in categories" :key="category.id" :class="['nav-item', { active: activeCategory === category.id }]" @click="activeCategory = category.id">
					{{ category.label }}
				</div>
			</nav>

			<!-- 우측 컨텐츠 영역 -->
			<div class="settings-content">
				<component :is="activeComponent" @update-setting="handleSettingUpdate" />
			</div>

			<!-- 닫기 버튼 -->
			<button class="setting-close-btn" @click="$emit('close')">×</button>
		</div>
	</div>
</template>

<script>
import GeneralSettings from './GeneralSettings.vue';
import AppearanceSettings from './AppearanceSettings.vue';
import ShortcutsSettings from './shortcutsSettings.vue'; // 추가

export default {
	components: { GeneralSettings, AppearanceSettings, ShortcutsSettings },

	// Settings.vue 데이터 수정
	data() {
		return {
			activeCategory: 'general',
			categories: [
				{ id: 'general', label: '일반', component: 'GeneralSettings' },
				{ id: 'appearance', label: '모양', component: 'AppearanceSettings' },
				{ id: 'shortcuts', label: '단축키', component: 'ShortcutsSettings' },
			],
		};
	},

	computed: {
		activeComponent() {
			return this.categories.find((c) => c.id === this.activeCategory).component;
		},
	},

	methods: {
		handleSettingUpdate({ key, value }) {
			this.$emit('update-setting', { key, value });
		},
	},
};
</script>
