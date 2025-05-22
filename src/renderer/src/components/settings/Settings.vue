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
			<button class="close-btn" @click="$emit('close')">×</button>
		</div>
	</div>
</template>

<script>
import GeneralSettings from './GeneralSettings.vue';
import AppearanceSettings from './AppearanceSettings.vue';
import PrivacySettings from './PrivacySettings.vue';

export default {
	components: { GeneralSettings, AppearanceSettings, PrivacySettings },

	data() {
		return {
			activeCategory: 'general',
			categories: [
				{ id: 'general', label: '일반', component: 'GeneralSettings' },
				{ id: 'appearance', label: '모양', component: 'AppearanceSettings' },
				{ id: 'privacy', label: '개인정보', component: 'PrivacySettings' },
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
