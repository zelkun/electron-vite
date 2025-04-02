import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { join } from 'path';
import icon from '../../resources/icon.png?asset';

const preloadPath = join(__dirname, '../preload/index.js');
const webviewPreloadPath = join(__dirname, '../preload/webviewPreload.js');
const popPreloadPath = join(__dirname, '../preload/popPreload.js');

export const preloadPaths = {
	main: preloadPath,
	webview: webviewPreloadPath,
	pop: popPreloadPath,
};

const defualtOpt = {
	kiosk: false,
	fullscreen: false,
	resizable: true,
	center: true,
	alwaysOnTop: false,
	show: false,
	movable: true,
	focusable: true,
	autoHideMenuBar: true,
	backgroundColor: 'white',
	webPreferences: {
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

export const BrowserWinOpt = {
	width: 1200,
	height: 800,
	minWidth: 800,
	minHeight: 600,
	titleBarStyle: is.dev ? 'hiddenInset' : 'hidden',
	// ...(process.platform === 'linux' ? { icon } : {}),
	// icon: join(__dirname, '../../resources/icon.png?asset'),
	icon: icon,
	...defualtOpt,
	webPreferences: {
		preload: preloadPath,
		...defualtOpt.webPreferences,
	},
};

export const webviewOpt = {
	...defualtOpt,
	webPreferences: {
		...defualtOpt.webPreferences,
		preload: webviewPreloadPath,
	},
};

export const popWindowOpt = {
	...defualtOpt,
	webPreferences: {
		...defualtOpt.webPreferences,
		preload: popPreloadPath,
	},
};
