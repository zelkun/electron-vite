// src/main/index.js
import { app, shell } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { join } from 'path';
import { setMainMenu, setPopupMenu } from './menu';
import { setupTray } from './tray';
import { setupUpdater } from './updater';
import { setupIpcHandlers } from './ipcHandlers';
import { isDev } from './config';
import { setupCommandLine } from './commandLine';
import { createBrowserWindow, getAllWindowsCnt } from './BrowserWindowUtils.js';
import { webviewOpt } from './windowOptions';
import { loadBlockedUrls, getBlockedUrls } from './blocklistManager.js';
import log from 'electron-log/main';

let mainWindow = null;

function createWindow() {
	log.info(`## createWindow`);
	// 메인 브라우저 윈도우 생성
	mainWindow = createBrowserWindow('main');

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

	/**
	 * 여기 안타고 app.on 에서 타는듯
	 */
	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: 'deny' };
	});

	// HMR for renderer base on electron-vite cli
	if (isDev && process.env['ELECTRON_RENDERER_URL']) {
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
	setupCommandLine(); // 보안관련 설정 해제

	const gotTheLock = app.requestSingleInstanceLock();
	if (!gotTheLock) {
		log.info('Another instance is running. Exiting this instance.');
		app.quit();
	} else {
		app.on('second-instance', (event, commandLine, workingDirectory) => {
			log.info('Second instance detected. Focusing the main window.');
			if (mainWindow) {
				if (mainWindow.isMinimized()) mainWindow.restore();
				mainWindow.focus();
			}
		});

		// 이중실행 방지를 위해 위치 이동
		electronApp.setAppUserModelId('com.electron-vite');

		// 최적화 설정
		app.on('browser-window-created', (_, window) => {
			optimizer.watchWindowShortcuts(window);
		});

		createWindow(); // 메인 윈도우 생성
		setupTray(mainWindow); // 트레이 설정
		setMainMenu(mainWindow); // 메뉴 설정
		setupUpdater(); // 업데이터 설정
		loadBlockedUrls(); // 팝업차단 목록

		app.on('activate', function () {
			if (getAllWindowsCnt() === 0) createWindow();
		});
	}
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
		const blockedUrls = getBlockedUrls();
		const isBlocked = blockedUrls.some((url) => handle.url.includes(url));
		if (isBlocked) {
			// 차단된 팝업 알림을 줘야 할까?
			log.debug(`##### blocked popup: ${handle.url}`);
			return { action: 'deny' };
		}

		/** popup test */
		const popupWindow = createBrowserWindow('popup');

		// popup에만 적용되는 메뉴
		setPopupMenu(popupWindow);
		popupWindow.once('ready-to-show', () => {
			popupWindow.show(); // 이 콜백에서만 show!
		});
		popupWindow.loadURL(`file://${join(__dirname, '../renderer/popup.html')}?url=${encodeURIComponent(handle.url)}`);

		return { action: 'deny' };
	});

	contents.on('will-attach-webview', (event, webPreferences, params) => {
		log.debug(`#### will-attach-webview`);

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
	log.debug('## window-all-closed');
	// if (process.platform !== 'darwin')
	app.quit();
});

app.on('will-quit', (evt) => {
	log.debug('## will-quit');
});
