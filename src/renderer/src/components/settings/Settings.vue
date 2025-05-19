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

<style scoped>
.settings-wrapper {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.settings-container {
	background: white;
	width: 800px;
	height: 600px;
	border-radius: 8px;
	display: flex;
	position: relative;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.settings-nav {
	width: 200px;
	border-right: 1px solid #e0e0e0;
	padding: 20px;
	background: #f8f9fa;
}

.nav-item {
	padding: 12px;
	margin: 4px 0;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s;
}

.nav-item.active {
	background: #e8f0fe;
	color: #1967d2;
}

.settings-content {
	flex: 1;
	padding: 24px;
	overflow-y: auto;
}

.close-btn {
	position: absolute;
	top: 12px;
	right: 12px;
	background: none;
	border: none;
	font-size: 24px;
	cursor: pointer;
	padding: 4px;
	color: #5f6368;
}
</style>
