import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { join } from 'path';
import icon from '../../resources/icon.png?asset';

const preloadPath = join(__dirname, '../preload/index.js');
const webviewPreloadPath = join(__dirname, is.dev ? '../../src/preload/webviewPreload.js' : '../preload/webviewPreload.js');
const popPreloadPath = join(__dirname, is.dev ? '../../src/preload/popPreload.js' : '../preload/popPreload.js');

export const preloadPaths = {
	main: preloadPath,
	webview: webviewPreloadPath,
	pop: popPreloadPath,
};

export const BrowserWindowOptions = {
	kiosk: false,
	fullscreen: false,
	resizable: true,
	center: true,
	alwaysOnTop: false,
	width: 1200,
	height: 800,
	minWidth: 800,
	minHeight: 600,
	show: false,
	movable: true,
	focusable: true,
	titleBarStyle: is.dev ? 'hiddenInset' : 'hidden',
	autoHideMenuBar: true,
	backgroundColor: 'white',
	// ...(process.platform === 'linux' ? { icon } : {}),
	// icon: join(__dirname, '../../resources/icon.png?asset'),
	icon: icon,
	webPreferences: {
		preload: preloadPath,
		webviewTag: true, // 웹뷰 태그 활성화
		nodeIntegration: false, // 노드 통합 활성화
		contextIsolation: true, // contextBridge 사용을 위해 true로 설정
		nodeIntegrationInWorker: false,
		nodeIntegrationInSubFrames: false,
		sandbox: false,
		javascript: true,
		webSecurity: false,
		textAreasAreResizable: true,
		plugins: true,
		allowRunningInsecureContent: false,
	},
};

export const webviewOptions = {
	...BrowserWindowOptions,
	webPreferences: {
		...BrowserWindowOptions.webPreferences,
		preload: webviewPreloadPath,
	},
};

export const popWindowOptions = {
	...BrowserWindowOptions,
	webPreferences: {
		...BrowserWindowOptions.webPreferences,
		preload: popPreloadPath,
	},
};
