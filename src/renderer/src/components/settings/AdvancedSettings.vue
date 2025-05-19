<!-- src/renderer/src/components/settings/AdvancedSettings.vue -->
<template>
	<div class="setting-item">
		<label>프록시 서버</label>
		<input v-model="proxyConfig" @blur="saveProxy" placeholder="ex: 192.168.0.1:8080" />
	</div>
</template>

<script>
export default {
	data() {
		return {
			proxyConfig: '',
		};
	},
	async mounted() {
		this.proxyConfig = await window.electronAPI.invoke('get-config-value', 'settings', 'proxy');
	},
	methods: {
		async saveProxy() {
			if (this.validateProxy(this.proxyConfig)) {
				await window.electronAPI.invoke('save-setting', 'proxy', this.proxyConfig);
				// 메인 프로세스에서 실제 프록시 적용
				window.electronAPI.send('apply-proxy', this.proxyConfig);
			}
		},
		validateProxy(value) {
			return /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/.test(value);
		},
	},
};
</script>
