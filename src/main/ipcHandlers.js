// src/main/ipcHandlers.js
import { BrowserWindow, ipcMain, clipboard, dialog } from 'electron';
import { getConfigSection, saveConfigSection, getConfigValue, setConfigValue, defaultConfig, saveConfig, loadConfig } from './config';
import { setMainMenu } from './menu';
import { getBlockedUrls, saveBlockedUrls, loadBlockedUrls } from './blocklistManager.js';
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

	/**
	 * settings 관련 IPC 핸들러
	 */
	ipcMain.handle('export-settings', () => {
		return JSON.stringify(loadConfig());
	});
	ipcMain.handle('import-settings', (_, data) => {
		const config = JSON.parse(data);
		return saveConfig(config);
	});

	ipcMain.on('reload-menu', (evt, payload) => {
		const currentWindow = BrowserWindow.fromWebContents(evt.sender);
		setMainMenu(currentWindow);
	});

	ipcMain.handle('save-setting', async (_, key, value) => {
		try {
			const success = await setConfigValue('settings', key, value);
			if (!success) throw new Error('설정 저장 실패');
			return { status: 'success' };
		} catch (error) {
			log.error('설정 저장 오류:', error);
			return { status: 'error', message: error.message };
		}
	});
	ipcMain.handle('reset-settings', async () => {
		const win = BrowserWindow.getFocusedWindow();
		const result = await dialog.showMessageBox(win, {
			type: 'warning',
			buttons: ['초기화', '취소'],
			title: '설정 초기화',
			detail: '※ 북마크는 유지됩니다.',
		});

		if (result.response === 0) {
			try {
				const currentConfig = loadConfig();
				return saveConfigSection('settings', {
					...defaultConfig.settings,
					bookmarks: currentConfig.bookmarks || [],
				});
			} catch (error) {
				log.error('설정 초기화 실패:', error);
				return false;
			}
		}
		return false;
	});

	ipcMain.handle('get-blocked-urls', () => {
		console.log(`## get-blocked-urls`);
		return getBlockedUrls();
	});

	ipcMain.handle('save-blocked-urls', async (_, urls) => {
		console.log(`## save-blocked-urls`, urls);
		const success = await saveBlockedUrls(urls);
		if (success) {
			// 변경된 blocklist 캐시 재로딩
			loadBlockedUrls();
		}
		return success;
	});
}
