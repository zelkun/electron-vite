import { app, shell, BrowserWindow, ipcMain, session, clipboard, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { setupMenu } from './menu';
import { setupTray } from './tray';
import { setupUpdater } from './updater';
import { getConfigSection, saveConfigSection, getConfigValue, setConfigValue } from './config';
import fs from 'fs';
import { BrowserWinOpt, webviewOpt, popWindowOpt, preloadPaths } from './windowOptions';

let mainWindow = null;

app.commandLine.appendSwitch('ignore-certificate-errors'); // 인증서 오류 무시 (개발용)
app.commandLine.appendSwitch('disable-web-security'); // 웹 보안 비활성화 (개발용)
// 인증서 오류 발생 시 무시 (개발용)
app.on('certificate-error', (evt, webContents, url, err, cert, callback, isMainFrame) => {
	evt.preventDefault();
	callback(true);
});

function createWindow() {
	// 메인 브라우저 윈도우 생성
	mainWindow = new BrowserWindow(BrowserWinOpt);

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

	// 설정 관련 IPC 핸들러 설정
	ipcMain.handle('get-config-section', (_, section) => {
		return getConfigSection(section);
	});

	ipcMain.handle('save-config-section', (_, section, data) => {
		return saveConfigSection(section, data);
	});

	ipcMain.handle('get-config-value', (_, section, key) => {
		return getConfigValue(section, key);
	});

	ipcMain.handle('set-config-value', (_, section, key, value) => {
		return setConfigValue(section, key, value);
	});

	// 북마크 관련 IPC 핸들러 (이전 방식과 호환성 유지)
	ipcMain.handle('get-bookmarks', () => {
		return getConfigSection('bookmarks');
	});

	ipcMain.handle('save-bookmarks', (_, bookmarks) => {
		return saveConfigSection('bookmarks', bookmarks);
	});
}

// 앱이 준비되면 윈도우 생성
app.whenReady().then(() => {
	electronApp.setAppUserModelId('com.electron-vite');

	// 최적화 설정
	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	// 메인 윈도우 생성
	createWindow();

	// 트레이 설정
	setupTray(mainWindow);

	// 메뉴 설정
	setupMenu(mainWindow);

	// 업데이터 설정
	setupUpdater();

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// 웹뷰 생성 시 preload 스크립트 설정
app.on('web-contents-created', (_, contents) => {
	// console.log(`## Web contents created`, contents.getType())

	contents.on('did-create-window', (window, details) => {
		// console.log(`#### did-create-window url: ${details.url}\nframeName: ${JSON.stringify(details.frameName, '\t', 4)}\n, options: ${JSON.stringify(details.options, '\t', 4)}\n, referrer: ${JSON.stringify(details.referrer, '\t', 4)}\n, postBody: ${JSON.stringify(details.postBody, '\t', 4)}\n, disposition: ${details.disposition}`,);
		window.webContents.on('ready-to-show', () => {
			window.show();
		});
	});

	contents.setWindowOpenHandler((handle) => {
		console.log(`#### setWindowOpenHandler url: ${handle.url}`);

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
		// console.log(`#### will-attach-webview`)

		// webPreferences 설정복사
		Object.assign(webPreferences, webviewOpt.webPreferences);
		// webPreferences.preload = preloadPaths.webview;

		// 웹뷰의 CSP 설정
		// params.csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
	});

	// 웹뷰 디버깅을 위한 콘솔 로그 캡처
	contents.on('console-message', (evt, level, message, line, sourceId) => {
		const levels = ['verbose', 'info', 'warning', 'error'];
		console.log(`[${contents.getType()} ${levels[level]}:${line}:${sourceId}]: ${message}`);
	});
});

// 모든 윈도우가 닫히면 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
	// if (process.platform !== 'darwin')
	app.quit();
});

// 클립보드 관련 IPC 핸들러
ipcMain.handle('write-to-clipboard', (_, text) => {
	clipboard.writeText(text);
	return true;
});

// 파일 저장 관련 IPC 핸들러
ipcMain.handle('save-file', async (_, options) => {
	const { url, defaultPath } = options;

	try {
		const { filePath } = await dialog.showSaveDialog(mainWindow, {
			defaultPath: defaultPath || 'image.jpg',
			filters: [
				{ name: 'Images', extensions: ['jpg', 'png', 'gif'] },
				{ name: 'All Files', extensions: ['*'] },
			],
		});

		if (filePath) {
			// 파일 다운로드 로직
			const response = await fetch(url);
			const buffer = await response.arrayBuffer();
			fs.writeFileSync(filePath, Buffer.from(buffer));
			return { success: true, path: filePath };
		}

		return { success: false, reason: 'User cancelled' };
	} catch (error) {
		console.error('Error saving file:', error);
		return { success: false, reason: error.message };
	}
});

// 창 제어 이벤트 핸들러
ipcMain.on('window-control-action', (evt, payload) => {
	const currentWindow = BrowserWindow.fromWebContents(evt.sender);
	if (payload.action === 'close-window') currentWindow?.close();
	if (payload.action === 'minimize-window') currentWindow?.minimize();
	if (payload.action === 'maximize-window') {
		if (currentWindow?.isMaximized()) {
			currentWindow.unmaximize();
		} else {
			currentWindow.maximize();
		}
	}
	if (payload.action === 'fullscreen') {
		if (currentWindow?.isFullScreen()) {
			currentWindow.setFullScreen(false);
		} else {
			currentWindow.setFullScreen(true);
		}
	}
});
