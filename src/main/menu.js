import { Menu, app, shell } from 'electron'

export function createMenu(mainWindow) {
	const template = [
		{
			label: '파일',
			submenu: [
				{
					label: '새 탭',
					accelerator: 'CmdOrCtrl+T',
					click: () => {
						mainWindow.webContents.send('create-new-tab', 'https://www.google.com')
					},
				},
				{
					label: '새 창',
					accelerator: 'CmdOrCtrl+N',
					click: () => {
						app.emit('activate')
					},
				},
				{ type: 'separator' },
				{
					label: '종료',
					accelerator: 'CmdOrCtrl+Q',
					click: () => {
						app.quit()
					},
				},
			],
		},
		{
			label: '편집',
			submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }],
		},
		{
			label: '보기',
			submenu: [{ role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }],
		},
		{
			label: '도움말',
			submenu: [
				{
					label: '웹사이트 방문',
					click: async () => {
						await shell.openExternal('https://electronjs.org')
					},
				},
				{
					label: '업데이트 확인',
					click: () => {
						mainWindow.webContents.send('check-for-updates')
					},
				},
				{
					label: '정보',
					click: () => {
						// 정보 창 표시
						const { dialog } = require('electron')
						dialog.showMessageBox(mainWindow, {
							title: 'Electron Vite Browser',
							message: 'Electron Vite Browser',
							detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode.js: ${process.versions.node}`,
						})
					},
				},
			],
		},
	]

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)

	return menu
}
