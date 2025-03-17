import { Menu, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

export function setupMenu(mainWindow) {
	// 애플리케이션 메인 메뉴 설정
	const template = [
		{
			label: '파일',
			submenu: [
				{
					label: '새 탭',
					accelerator: 'CmdOrCtrl+T',
					click: () => {
						mainWindow.webContents.send('create-new-tab')
					},
				},
				{
					label: '새 창',
					accelerator: 'CmdOrCtrl+N',
					click: () => {
						// 새 창 생성 로직
						const { BrowserWindow } = require('electron')
						const path = require('path')
						const newWindow = new BrowserWindow({
							width: 1200,
							height: 800,
							webPreferences: {
								preload: path.join(__dirname, '../preload/index.js'),
								sandbox: false,
								webviewTag: true,
								nodeIntegration: false,
								contextIsolation: true,
							},
						})

						if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
							newWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
						} else {
							newWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
						}
					},
				},
				{
					label: '탭 닫기',
					accelerator: 'CmdOrCtrl+W',
					click: () => {
						mainWindow.webContents.send('close-current-tab')
					},
				},
				{ type: 'separator' },
				{
					label: '종료',
					accelerator: 'CmdOrCtrl+Q',
					click: () => {
						mainWindow.close()
					},
				},
			],
		},
		{
			label: '편집',
			submenu: [
				{ role: 'undo' },
				{ role: 'redo' },
				{ type: 'separator' },
				{ role: 'cut' },
				{ role: 'copy' },
				{ role: 'paste' },
				{ role: 'delete' },
				{ type: 'separator' },
				{ role: 'selectAll' },
				{ type: 'separator' },
				{
					label: '페이지 내 검색',
					accelerator: 'CmdOrCtrl+F',
					click: () => {
						mainWindow.webContents.send('show-page-search')
					},
				},
			],
		},
		{
			label: '보기',
			submenu: [
				{ role: 'reload' },
				{ role: 'forceReload' },
				{ role: 'toggleDevTools', accelerator: 'F12' },
				{
					label: '웹뷰 개발자 도구',
					accelerator: 'CmdOrCtrl+F12',
					click: () => {
						mainWindow.webContents.send('toggle-webview-devtools')
					},
				},
				{ type: 'separator' },
				{ role: 'resetZoom' },
				{ role: 'zoomIn' },
				{ role: 'zoomOut' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' },
			],
		},
		{
			label: '북마크',
			submenu: [
				{
					label: '북마크 표시줄 보기',
					accelerator: 'CmdOrCtrl+B',
					type: 'checkbox',
					checked: true,
					click: () => {
						mainWindow.webContents.send('toggle-bookmark-bar')
					},
				},
				{
					label: '현재 페이지 북마크에 추가',
					accelerator: 'CmdOrCtrl+D',
					click: () => {
						mainWindow.webContents.send('add-bookmark')
					},
				},
			],
		},
		{
			label: '도움말',
			submenu: [
				{
					label: '정보',
					click: () => {
						// 정보 창 표시 로직
					},
				},
			],
		},
	]

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)

	// 북마크 컨텍스트 메뉴 설정
	ipcMain.on('show-bookmark-context-menu', (event, data) => {
		const { x, y, bookmarkIndex } = data

		const bookmarkContextMenu = Menu.buildFromTemplate([
			{
				label: '새 탭에서 열기',
				click: () => {
					mainWindow.webContents.send('bookmark-context-menu-action', 'open-in-new-tab', bookmarkIndex)
				},
			},
			{ type: 'separator' },
			{
				label: '편집',
				click: () => {
					mainWindow.webContents.send('bookmark-context-menu-action', 'edit', bookmarkIndex)
				},
			},
			{
				label: '삭제',
				click: () => {
					mainWindow.webContents.send('bookmark-context-menu-action', 'delete', bookmarkIndex)
				},
			},
		])

		bookmarkContextMenu.popup({ window: mainWindow, x, y })
	})

	// 탭 컨텍스트 메뉴 설정
	ipcMain.on('show-tab-context-menu', (event, data) => {
		const { x, y, tabIndex } = data

		const tabContextMenu = Menu.buildFromTemplate([
			{
				label: '새 탭',
				click: () => {
					mainWindow.webContents.send('create-new-tab')
				},
			},
			{ type: 'separator' },
			{
				label: '탭 새로고침',
				click: () => {
					mainWindow.webContents.send('refresh-tab', tabIndex)
				},
			},
			{
				label: '탭 닫기',
				click: () => {
					mainWindow.webContents.send('close-tab', tabIndex)
				},
			},
			{ type: 'separator' },
			{
				label: '개발자 도구 열기',
				click: () => {
					mainWindow.webContents.send('open-tab-devtools', tabIndex)
				},
			},
		])

		tabContextMenu.popup({ window: mainWindow, x, y })
	})
}
