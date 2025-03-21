import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'

import { getConfigValue } from './config'

let tray = null

export function setupTray(mainWindow) {
	// 트레이 아이콘 경로 설정
	const iconPath = join(__dirname, '../../resources/icon.png')
	const icon = nativeImage.createFromPath(iconPath)

	const homePage = getConfigValue('settings', 'defaultHomePage') || 'about:blank'

	// 트레이 생성
	tray = new Tray(icon)

	// 트레이 메뉴 설정
	const contextMenu = Menu.buildFromTemplate([
		{
			label: '열기',
			click: () => {
				mainWindow.show()
			},
		},
		{
			label: '새 창',
			click: () => {
				mainWindow.webContents.send('create-new-tab', homePage)
			},
		},
		{ type: 'separator' },
		{
			label: '종료',
			click: () => {
				app.quit()
			},
		},
	])

	tray.setToolTip('Electron Vite Browser')
	tray.setContextMenu(contextMenu)

	// 트레이 클릭 시 창 표시/숨김 토글
	tray.on('click', () => {
		if (mainWindow.isVisible()) {
			mainWindow.hide()
		} else {
			mainWindow.show()
		}
	})

	return tray
}
