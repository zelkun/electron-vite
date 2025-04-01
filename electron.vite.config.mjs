import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()],
	},
	/*
	preload: {
		plugins: [externalizeDepsPlugin()],
	},
	*/
	preload: {
		build: {
			rollupOptions: {
				input: {
					index: resolve('src/preload/index.js'),
					webviewPreload: resolve('src/preload/webviewPreload.js'),
					popPreload: resolve('src/preload/popPreload.js'),
				},
			},
		},
	},
	renderer: {
		resolve: {
			alias: {
				'@renderer': resolve('src/renderer/src'),
			},
		},
		// plugins: [vue()],
		plugins: [
			vue({
				template: {
					compilerOptions: {
						isCustomElement: (tag) => tag === 'webview',
					},
				},
			}),
		],
	},
});
