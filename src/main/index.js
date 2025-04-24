// src/main/index.js
import { app, shell, BrowserWindow, ipcMain, session, clipboard, dialog } from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { join } from 'path';
import { setupMenu } from './menu';
import { setupTray } from './tray';
import { setupUpdater } from './updater';
import { setupIpcHandlers } from './ipcHandlers';
import { isDev } from './config';
import { setupCommandLine, parseCommandLineArgs, hasSwitch, getSwitchValue } from './commandLine';
import { BrowserWinOpt, webviewOpt, popWindowOpt, preloadPaths } from './windowOptions';
import log from 'electron-log/main';

setupCommandLine(); // 보안관련 설정 해제

let mainWindow = null;

function createWindow() {
	log.info(`## createWindow`);
	// 메인 브라우저 윈도우 생성
	mainWindow = new BrowserWindow(BrowserWinOpt);
	mainWindow.windowType = 'main'; // 윈도우 타입 설정 (메인 윈도우)

	/* CSP 설정 예시
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"],
			},
		})
	})
	*/

	mainWindow.on('ready-to-show', () => {
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: 'deny' };
	});

	// HMR for renderer base on electron-vite cli
	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
	}

	setupIpcHandlers(); // IPC 핸들러 설정
	mainWindow.webContents.on('console-message', (evt, level, message, line, sourceId) => {
		const levels = ['verbose', 'info', 'warning', 'error'];
		log.debug(`[${mainWindow.windowType} ${levels[level]}:${line}:${sourceId}]: ${message}`);
	});
}

// 앱이 준비되면 윈도우 생성
app.whenReady().then(() => {
	electronApp.setAppUserModelId('com.electron-vite');

	// 최적화 설정
	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	createWindow(); // 메인 윈도우 생성
	setupTray(mainWindow); // 트레이 설정
	setupMenu(mainWindow); // 메뉴 설정
	setupUpdater(); // 업데이터 설정

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// 웹뷰 생성 시 preload 스크립트 설정
app.on('web-contents-created', (_, contents) => {
	log.debug(`## Web contents created`, contents.getType());

	contents.on('did-create-window', (window, details) => {
		// log.debug(`#### did-create-window url: ${details.url}\nframeName: ${JSON.stringify(details.frameName, '\t', 4)}\n, options: ${JSON.stringify(details.options, '\t', 4)}\n, referrer: ${JSON.stringify(details.referrer, '\t', 4)}\n, postBody: ${JSON.stringify(details.postBody, '\t', 4)}\n, disposition: ${details.disposition}`,);
		window.webContents.on('ready-to-show', () => {
			window.show();
		});
	});

	contents.setWindowOpenHandler((handle) => {
		log.debug(`#### setWindowOpenHandler url: ${handle.url}`);

		// shell.openExternal(handle.url); // 웹뷰가 아닌 일반 브라우저 창을 열 때의 설정

		// 차단할 URL 목록
		const blockedUrls = [];
		const isBlocked = blockedUrls.some((url) => handle.url.includes(url));
		if (isBlocked) {
			window.close(); // 차단된 URL인 경우 창을 닫음
			return { action: 'deny' };
		}

		return {
			action: 'allow',
			overrideBrowserWindowOptions: popWindowOpt,
		};
	});

	contents.on('will-attach-webview', (event, webPreferences, params) => {
		// log.debug(`#### will-attach-webview`)

		// webPreferences 설정복사
		Object.assign(webPreferences, webviewOpt.webPreferences);
		// webPreferences.preload = preloadPaths.webview;

		// 웹뷰의 CSP 설정
		// params.csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
	});

	// 웹뷰 디버깅을 위한 콘솔 로그 캡처
	contents.on('console-message', (evt, level, message, line, sourceId) => {
		const levels = ['verbose', 'info', 'warning', 'error'];
		log.debug(`[${contents.getType()} ${levels[level]}:${line}:${sourceId}]: ${message}`);
	});
});

// 모든 윈도우가 닫히면 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
	// if (process.platform !== 'darwin')
	app.quit();
});
