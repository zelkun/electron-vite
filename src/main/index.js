import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { setupTray } from './tray'
import { createMenu } from './menu'
import { setupUpdater } from './updater'
import { loadBookmarks, saveBookmarks } from './bookmarks'

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

	ipcMain.on('add-bookmark', (event, url, title) => {
		const bookmarksData = loadBookmarks()
		bookmarksData.push({ url, title })
		saveBookmarks(bookmarksData)
	})
	ipcMain.on('load-bookmarks', (event) => {
		const bookmarksData = loadBookmarks()
		event.sender.send('bookmarks-loaded', bookmarksData)
	})
	ipcMain.on('save-bookmarks', (event, bookmarks) => {
		saveBookmarks(bookmarks)
		event.sender.send('bookmarks-updated', bookmarks) // 북마크가 갱신되었음을 렌더러 프로세스에 알림
	})
	ipcMain.on('delete-bookmark', (event, index) => {
		const bookmarksData = loadBookmarks()
		bookmarksData.splice(index, 1)
		saveBookmarks(bookmarksData)
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
	createMenu(mainWindow)

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

