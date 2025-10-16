import { BrowserWindow } from 'electron';
import { BrowserWinOpt, webviewOpt, popWindowOpt } from './windowOptions';
import log from 'electron-log/main';

export const createBrowserWindow = (windowType = 'main') => {
	log.debug(`## BrowserWindow: ${windowType}`);
	let options = null;
	if (windowType === 'main') options = BrowserWinOpt;
	else if (windowType === 'webview') options = webviewOpt;
	else if (windowType === 'popup') options = popWindowOpt;

	const mainWindow = new BrowserWindow(options);
	mainWindow.windowType = windowType;
	return mainWindow;
};

export const getFocusedWindow = () => {
	log.debug(`## getFocusedWindow`);
	return BrowserWindow.getFocusedWindow();
};

export const getMainWindow = () => {
	log.debug(`## getMainWindow`);
	const allWindows = BrowserWindow.getAllWindows();
	return allWindows.find((win) => win.windowType === 'main') || null;
};

export const getBrowserWindowFromSender = (sender) => {
	log.debug(`## getBrowserWindowFromSender`);
	return BrowserWindow.fromWebContents(sender);
};

export const getAllWindowsCnt = () => {
	log.debug(`## getAllWindowsCnt`);
	return BrowserWindow.getAllWindows().length;
};
