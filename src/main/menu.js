import { Menu, ipcMain, BrowserWindow } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'path'

function fnIpcCall(channel, ...args) {
	const activeWindow = BrowserWindow.getFocusedWindow()
	if (activeWindow) activeWindow.webContents.send(channel, ...args)
}

export function setupMenu(mainWindow) {
	// 애플리케이션 메인 메뉴 설정
	const template = [
		{
			label: '파일',
			submenu: [
				{
					label: '새 탭',
					accelerator: 'CommandOrControl+T',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('create-new-tab')
					},
				},
				{
					label: '새 창',
					accelerator: 'CommandOrControl+Shift+N',
					click: (menuItem, focusedWindow, keyEvt) => {
						const newWindow = new BrowserWindow({
							width: 1200,
							height: 800,
							webPreferences: {
								preload: join(__dirname, '../preload/index.js'),
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
					accelerator: 'CommandOrControl+W',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('close-current-tab')
					},
				},
				{ type: 'separator' },
				{
					label: '종료',
					accelerator: 'CommandOrControl+Q',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.close()
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
					accelerator: 'CommandOrControl+F',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('show-page-search')
					},
				},
			],
		},
		{
			label: '보기',
			submenu: [
				// { role: 'reload' },
				{
					label: '새로고침',
					accelerator: 'CommandOrControl+R',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('refresh-page')
					},
				},
				{ role: 'forceReload' },
				// 개발 환경에서만 개발자 도구 메뉴 표시
				...(is.dev
					? [
							{ role: 'toggleDevTools', accelerator: 'F12' },
							{
								label: '웹뷰 개발자 도구',
								role: 'toggleWebviewDevTools',
								accelerator: 'CommandOrControl+F12',
								click: (menuItem, focusedWindow, keyEvt) => {
									if (focusedWindow) focusedWindow.webContents.send('toggle-webview-devtools')
								},
							},
							{ type: 'separator' },
						]
					: []),
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
					accelerator: 'CommandOrControl+B',
					type: 'checkbox',
					checked: true,
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('toggle-bookmark-bar')
					},
				},
				{
					label: '현재 페이지 북마크에 추가',
					accelerator: 'CommandOrControl+D',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('add-bookmark')
					},
				},
			],
		},
		{
			label: '도움말',
			submenu: [
				{
					label: '정보',
					click: (menuItem, focusedWindow, keyEvt) => {
						// 정보 창 표시 로직
					},
				},
			],
		},
	]

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)

	// 북마크 컨텍스트 메뉴 설정
	ipcMain.on('show-bookmark-context-menu', (evt, data) => {
		const { x, y, bookmarkIndex } = data
		const sender = evt.sender
		const currentWindow = BrowserWindow.fromWebContents(sender)

		const bookmarkContextMenu = Menu.buildFromTemplate([
			{
				label: '새 탭에서 열기',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('bookmark-context-menu-action', 'open-in-new-tab', bookmarkIndex)
				},
			},
			{ type: 'separator' },
			{
				label: '편집',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('bookmark-context-menu-action', 'edit', bookmarkIndex)
				},
			},
			{
				label: '삭제',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('bookmark-context-menu-action', 'delete', bookmarkIndex)
				},
			},
		])
		bookmarkContextMenu.popup({ window: currentWindow, x, y })
	})

	// 탭 컨텍스트 메뉴 설정
	ipcMain.on('show-tab-context-menu', (evt, data) => {
		console.log('%csrc\main\menu.js:189 {show-tab-context-menu} data', 'color: #007acc;', data)
		const { x, y, tabIndex } = data
		const sender = evt.sender
		const currentWindow = BrowserWindow.fromWebContents(sender)

		const menuItems = [
			{
				label: '새 탭',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('create-new-tab')
				},
			},
			{ type: 'separator' },
			{
				label: '탭 새로고침',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('refresh-tab', tabIndex)
				},
			},
			{
				label: '탭 닫기',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('close-tab', tabIndex)
				},
			},

			,
		]
		if (is.dev) {
			menuItems.push(
				{ type: 'separator' },
				{
					label: '개발자 도구 열기',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('toggle-webview-devtools', tabIndex)
					},
				},
			)
		}

		const tabContextMenu = Menu.buildFromTemplate(menuItems)
		tabContextMenu.popup({ window: currentWindow, x, y })
	})

	// 웹뷰 컨텍스트 메뉴 설정
	ipcMain.on('show-webview-context-menu', (evt, data) => {
		console.log('%csrc\main\menu.js:235 {show-webview-context-menu} data', 'color: #007acc;', data)
		const { x, y, linkURL, srcURL, isEditable, selectionText } = data

		const menuItems = []
		const sender = evt.sender
		const currentWindow = BrowserWindow.fromWebContents(sender)

		// 링크가 있는 경우
		if (linkURL) {
			menuItems.push(
				{
					label: '새 탭에서 링크 열기',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('open-link-in-new-tab', linkURL)
					},
				},
				{
					label: '링크 주소 복사',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('copy-to-clipboard', linkURL)
					},
				},
				{ type: 'separator' },
			)
		}

		// 이미지가 있는 경우
		if (srcURL) {
			menuItems.push(
				{
					label: '이미지 새 탭에서 열기',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('open-link-in-new-tab', srcURL)
					},
				},
				{
					label: '이미지 주소 복사',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('copy-to-clipboard', srcURL)
					},
				},
				{
					label: '이미지 저장',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('save-image', srcURL)
					},
				},
				{ type: 'separator' },
			)
		}

		// 텍스트 선택이 있는 경우
		if (selectionText) {
			menuItems.push(
				{
					label: '복사',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('copy-to-clipboard', selectionText)
					},
				},
				{
					label: '검색',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('search-text', selectionText)
					},
				},
				{ type: 'separator' },
			)
		}

		// 편집 가능한 요소인 경우
		if (isEditable) {
			menuItems.push(
				{ label: '실행 취소', role: 'undo' },
				{ label: '다시 실행', role: 'redo' },
				{ type: 'separator' },
				{ label: '잘라내기', role: 'cut' },
				{ label: '복사', role: 'copy' },
				{ label: '붙여넣기', role: 'paste' },
				{ label: '모두 선택', role: 'selectAll' },
				{ type: 'separator' },
			)
		}

		// 기본 메뉴 항목
		menuItems.push(
			{
				label: '뒤로 가기',
				enabled: mainWindow.webContents.canGoBack(),
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('go-back')
				},
			},
			{
				label: '앞으로 가기',
				enabled: mainWindow.webContents.canGoForward(),
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('go-forward')
				},
			},
			{
				label: '새로고침',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('refresh-page')
				},
			},
		)
		if (is.dev) {
			menuItems.push(
				{ type: 'separator' },
				{
					label: '개발자 도구',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('toggle-webview-devtools')
					},
				},
			)
		}
		const contextMenu = Menu.buildFromTemplate(menuItems)
		contextMenu.popup({ window: currentWindow, x, y })
	})
}
