// electron.vite.config.mjs
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
		publicDir: resolve('src/renderer/public'), // 정적 자산 디렉토리 설정
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
		build: {
			rollupOptions: {
				input: {
					main: resolve('src/renderer/index.html'),
					popup: resolve('src/renderer/popup.html'), // 팝업 추가
				},
			},
		},
	},
});
