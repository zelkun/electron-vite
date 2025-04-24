// src/main/ipcHandlers.js
import { BrowserWindow, ipcMain, clipboard, dialog } from 'electron';
import { getConfigSection, saveConfigSection, getConfigValue, setConfigValue } from './config';
import fs from 'fs';
import log from 'electron-log/main';

export function setupIpcHandlers() {
	const mainWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];

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
			log.error('Error saving file:', error);
			return { success: false, reason: error.message };
		}
	});

	// 창 제어 이벤트 핸들러
	ipcMain.on('window-control-action', (evt, payload) => {
		const currentWindow = BrowserWindow.fromWebContents(evt.sender);
		if (payload === 'close-window') currentWindow?.close();
		if (payload === 'minimize-window') currentWindow?.minimize();
		if (payload === 'maximize-window') {
			if (currentWindow?.isMaximized()) currentWindow?.unmaximize();
			else currentWindow?.maximize();
		}
		if (payload === 'fullscreen') {
			if (currentWindow?.isFullScreen()) currentWindow?.setFullScreen(false);
			else currentWindow?.setFullScreen(true);
		}
	});
}
