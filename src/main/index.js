import { app, shell, BrowserWindow, ipcMain, session, clipboard, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// import icon from '../../resources/icon.png?asset'
import { setupMenu } from './menu'
import { setupTray } from './tray'
import { setupUpdater } from './updater'
import { getConfigSection, saveConfigSection, getConfigValue, setConfigValue } from './config'
import fs from 'fs'

let mainWindow = null

// webview-preload.js 경로 설정 - 빌드 환경에 따라 경로 조정
const webviewPreloadPath = join(__dirname, is.dev ? '../../src/preload/webviewPreload.js' : '../preload/webviewPreload.js')

console.log(`webviewPreloadPath: ${webviewPreloadPath}`)

function createWindow() {
	// 메인 브라우저 윈도우 생성
	mainWindow = new BrowserWindow({
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
		icon: join(__dirname, '../../resources/icon.png?asset'),
		titleBarStyle: is.dev ? 'hiddenInset' : 'hidden',
		autoHideMenuBar: true,
		backgroundColor: 'white',
		//		...(process.platform === 'linux' ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
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
	})

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
		mainWindow.show()
	})

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url)
		return { action: 'deny' }
	})

	// HMR for renderer base on electron-vite cli
	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
	}

	// 웹뷰 생성 시 preload 스크립트 설정
	// will-attach-webview 에서 webview preload 관리함으로 주석처리
	// mainWindow.webContents.on('will-attach-webview', (e, webPreferences) => {
	// 	webPreferences.preload = webviewPreloadPath
	// })

	// 설정 관련 IPC 핸들러 설정
	ipcMain.handle('get-config-section', (_, section) => {
		return getConfigSection(section)
	})

	ipcMain.handle('save-config-section', (_, section, data) => {
		return saveConfigSection(section, data)
	})

	ipcMain.handle('get-config-value', (_, section, key) => {
		return getConfigValue(section, key)
	})

	ipcMain.handle('set-config-value', (_, section, key, value) => {
		return setConfigValue(section, key, value)
	})

	// 북마크 관련 IPC 핸들러 (이전 방식과 호환성 유지)
	ipcMain.handle('get-bookmarks', () => {
		return getConfigSection('bookmarks')
	})

	ipcMain.handle('save-bookmarks', (_, bookmarks) => {
		return saveConfigSection('bookmarks', bookmarks)
	})
}

// 앱이 준비되면 윈도우 생성
app.whenReady().then(() => {
	electronApp.setAppUserModelId('com.electron-vite')

	// 최적화 설정
	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window)
	})

	// 메인 윈도우 생성
	createWindow()

	// 트레이 설정
	setupTray(mainWindow)

	// 메뉴 설정
	setupMenu(mainWindow)

	// 업데이터 설정
	setupUpdater()

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

// 웹뷰 생성 시 preload 스크립트 설정
app.on('web-contents-created', (_, contents) => {
	// console.log(`## Web contents created`, contents.getType())

	// popup 창을 띄울 때의 설정
	/*
		contents.setWindowOpenHandler((details) => {
			shell.openExternal(details.url)

			return {
				action: 'allow',
				overrideBrowserWindowOptions: {
					resizable: true,
					center: true,
					alwaysOnTop: false,
					show: true,
					movable: true,
					focusable: true,
					autoHideMenuBar: true,
					webPreferences: {
						preload: webviewPreloadPath,
						webviewTag: true,
						contextIsolation: true,
						nodeIntegration: false,
						sandbox: true,
					},
					modal: true,
					parent: details.parent,
				},
			}

			return { action: 'deny' }
		})
	*/

	contents.on('will-attach-webview', (event, webPreferences, params) => {
		// console.log(`#### will-attach-webview`)
		// preload 스크립트 설정
		webPreferences.preload = webviewPreloadPath

		// 웹뷰의 CSP 설정
		// params.csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"

		// 보안 설정
		webPreferences.nodeIntegration = false
		webPreferences.contextIsolation = true

		console.log('Webview attached with preload:', webviewPreloadPath)
	})

	// 웹뷰 디버깅을 위한 콘솔 로그 캡처
	contents.on('console-message', (_, level, message, line, sourceId) => {
		const levels = ['verbose', 'info', 'warning', 'error']
		console.log(`[Webview ${levels[level]}]: ${message}`)
	})
})

// 모든 윈도우가 닫히면 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

// 탭 관련 IPC 핸들러
ipcMain.on('new-tab', (_, url) => {
	mainWindow.webContents.send('create-new-tab', url)
})

ipcMain.on('navigate', (_, url) => {
	mainWindow.webContents.send('navigate-to-url', url)
})

// 클립보드 관련 IPC 핸들러
ipcMain.handle('write-to-clipboard', (_, text) => {
	clipboard.writeText(text)
	return true
})

// 파일 저장 관련 IPC 핸들러
ipcMain.handle('save-file', async (_, options) => {
	const { url, defaultPath } = options

	try {
		const { filePath } = await dialog.showSaveDialog(mainWindow, {
			defaultPath: defaultPath || 'image.jpg',
			filters: [
				{ name: 'Images', extensions: ['jpg', 'png', 'gif'] },
				{ name: 'All Files', extensions: ['*'] },
			],
		})

		if (filePath) {
			// 파일 다운로드 로직
			const response = await fetch(url)
			const buffer = await response.arrayBuffer()
			fs.writeFileSync(filePath, Buffer.from(buffer))
			return { success: true, path: filePath }
		}

		return { success: false, reason: 'User cancelled' }
	} catch (error) {
		console.error('Error saving file:', error)
		return { success: false, reason: error.message }
	}
})

// 창 제어 이벤트 핸들러
ipcMain.on('close-window', () => {
	if (mainWindow) mainWindow.close()
})

ipcMain.on('minimize-window', () => {
	if (mainWindow) mainWindow.minimize()
})

ipcMain.on('maximize-window', () => {
	if (mainWindow) {
		if (mainWindow.isMaximized()) {
			mainWindow.unmaximize()
		} else {
			mainWindow.maximize()
		}
	}
})

ipcMain.on('quit-app', () => {
	app.quit()
})

