import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { setupMenu } from './menu'
import { setupTray } from './tray'
import { setupUpdater } from './updater'
import { getConfigSection, saveConfigSection, getConfigValue, setConfigValue } from './config'

let mainWindow = null

function createWindow() {
	// 메인 브라우저 윈도우 생성
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		show: false,
		autoHideMenuBar: false,
		...(process.platform === 'linux' ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			sandbox: false,
			webviewTag: true, // 웹뷰 태그 활성화
			nodeIntegration: false,
			contextIsolation: true, // contextBridge 사용을 위해 true로 설정
		},
	})
	// webview-preload.js 경로 설정
	const webviewPreloadPath = join(__dirname, '../preload/webview-preload.js')

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

	// webview preload 경로 전달
	ipcMain.handle('get-webview-preload-path', () => {
		return webviewPreloadPath
	})

	// webview ping-pong 테스트
	ipcMain.on('webview-ping', (event) => {
		console.log('Received ping from webview')
		event.sender.send('webview-pong', 'pong from main process')
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

ipcMain.on('webview-ping', (event) => {
	event.sender.send('webview-pong', 'pong from main process')
})

