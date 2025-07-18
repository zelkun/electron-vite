// src/main/menu.js
/* eslint-disable no-unused-vars */
import { Menu, ipcMain, BrowserWindow } from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { BrowserWinOpt, webviewOpt, popWindowOpt, preloadPaths } from './windowOptions';
import { isDev, getShortcut } from './config';
import log from 'electron-log/main';
import { join } from 'path';

function fnIpcCall(channel, ...args) {
	const activeWindow = BrowserWindow.getFocusedWindow();
	if (activeWindow) activeWindow.webContents.send(channel, ...args);
}

export function setupMenu(mainWindow) {
	// 애플리케이션 메인 메뉴 설정
	const template = [
		{
			label: '파일',
			submenu: [
				{
					label: '새 탭',
					accelerator: getShortcut('newTab', 'CommandOrControl + T'),
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('create-new-tab');
					},
				},
				{
					label: '새 창',
					accelerator: getShortcut('newWindow', 'CommandOrControl + Shift + N'),
					click: (menuItem, focusedWindow, keyEvt) => {
						const newWindow = new BrowserWindow(BrowserWinOpt);
						newWindow.windowType = 'main'; // 윈도우 타입 설정 (메인 윈도우)

						if (isDev && process.env['ELECTRON_RENDERER_URL']) {
							newWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
						} else {
							newWindow.loadFile(join(__dirname, '../renderer/index.html'));
						}
						newWindow.on('ready-to-show', newWindow.show);
					},
				},
				{
					label: '탭 닫기',
					accelerator: getShortcut('closeTab', 'CommandOrControl + W'),
					click: (menuItem, focusedWindow, keyEvt) => {
						// BrowserWindow 생성시 windowType을 설정함
						if (focusedWindow?.windowType === 'main') focusedWindow.webContents.send('close-current-tab');
						else focusedWindow.close(); // popup 윈도우인 경우 닫기
					},
				},
				{ type: 'separator' },
				{
					label: '종료',
					accelerator: getShortcut('exit', 'CommandOrControl + Q'),
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.close();
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
					accelerator: getShortcut('search', 'CommandOrControl + F'),
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('show-page-search');
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
					accelerator: getShortcut('reload', 'CommandOrControl + R'),
					click: (menuItem, focusedWindow, keyEvt) => {
						// BrowserWindow 생성시 windowType을 설정함
						if (focusedWindow?.windowType === 'main') focusedWindow.webContents.send('refresh-tab');
						else focusedWindow?.webContents.reload(true); // popup 윈도우인 경우 강제 새로고침
					},
				},
				{ role: 'forceReload' },
				{ role: 'toggleDevTools', accelerator: 'F12' },
				{
					label: '웹뷰 개발자 도구',
					role: 'toggleWebviewDevTools',
					accelerator: getShortcut('toggleWebviewDevTools', 'CommandOrControl + F12'),
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('toggle-webview-devtools');
					},
				},
				{ type: 'separator' },
				{
					// role: 'resetZoom',
					label: '원래 크기로',
					accelerator: getShortcut('resetZoom', 'CommandOrControl + 0'),
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('zoomCtrl', 'reset');
					},
				},
				{
					label: '원래 크기로',
					accelerator: getShortcut('resetZoom1', 'CommandOrControl + num0'),
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('zoomCtrl', 'reset');
					},
				},
				{
					// role: 'zoomIn',
					label: '확대',
					accelerator: getShortcut('zoomIn', 'CommandOrControl + plus'),
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('zoomCtrl', 'increase');
					},
				},
				{
					label: '확대',
					accelerator: getShortcut('zoomIn1', 'CommandOrControl + numadd'),
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('zoomCtrl', 'increase');
					},
				},
				{
					label: '확대',
					visible: false,
					accelerator: getShortcut('zoomIn2', 'CommandOrControl + ='),
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('zoomCtrl', 'increase');
					},
				},
				{
					// role: 'zoomOut',
					label: '축소',
					accelerator: getShortcut('zoomOut', 'CommandOrControl + -'),
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('zoomCtrl', 'decrease');
					},
				},
				{
					// role: 'zoomOut',
					label: '축소',
					visible: false,
					accelerator: getShortcut('zoomOut1', 'CommandOrControl + numsub'),
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('zoomCtrl', 'decrease');
					},
				},
				{ type: 'separator' },
				{ role: 'togglefullscreen' },
			],
		},
		{
			label: '북마크',
			submenu: [
				{
					label: '북마크 표시줄 보기',
					accelerator: getShortcut('bookmarkView', 'CommandOrControl + B'),
					type: 'checkbox',
					checked: true,
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('toggle-bookmark-bar');
					},
				},
				{
					label: '현재 페이지 북마크에 추가',
					accelerator: getShortcut('bookmarkAdd', 'CommandOrControl + D'),
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('add-bookmark');
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
	];

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

	// 북마크 컨텍스트 메뉴 설정
	ipcMain.on('show-bookmark-context-menu', (evt, data) => {
		log.debug('{show-bookmark-context-menu} data', data);
		const { x, y, bookmarkIndex } = data;
		const sender = evt.sender;
		const currentWindow = BrowserWindow.fromWebContents(sender);

		const bookmarkContextMenu = Menu.buildFromTemplate([
			{
				label: '새 탭에서 열기',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('bookmark-context-menu-action', 'open-in-new-tab', bookmarkIndex);
				},
			},
			{ type: 'separator' },
			{
				label: '편집',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('bookmark-context-menu-action', 'edit', bookmarkIndex);
				},
			},
			{
				label: '삭제',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('bookmark-context-menu-action', 'delete', bookmarkIndex);
				},
			},
		]);
		bookmarkContextMenu.popup({ window: currentWindow, x, y });
	});

	// 탭 컨텍스트 메뉴 설정
	ipcMain.on('show-tab-context-menu', (evt, data) => {
		log.debug('{show-tab-context-menu} data', data);
		const { x, y, tabIndex } = data;
		const sender = evt.sender;
		const currentWindow = BrowserWindow.fromWebContents(sender);

		const menuItems = [
			{
				label: '새 탭',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('create-new-tab');
				},
			},
			{ type: 'separator' },
			{
				label: '탭 새로고침',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('refresh-tab', tabIndex);
				},
			},
			{
				label: '탭 닫기',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('close-tab', tabIndex);
				},
			},
		];
		if (isDev) {
			menuItems.push(
				{ type: 'separator' },
				{
					label: '개발자 도구 열기',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('toggle-webview-devtools', tabIndex);
					},
				},
			);
		}

		const tabContextMenu = Menu.buildFromTemplate(menuItems);
		tabContextMenu.popup({ window: currentWindow, x, y });
	});

	// 웹뷰 컨텍스트 메뉴 설정
	ipcMain.on('show-webview-context-menu', (evt, data) => {
		log.debug('{show-webview-context-menu} data', data);
		const { x, y, linkURL, srcURL, isEditable, selectionText, canGoBack, canGoForward } = data;

		const menuItems = [];
		const sender = evt.sender;
		const currentWindow = BrowserWindow.fromWebContents(sender);

		// 링크가 있는 경우
		if (linkURL) {
			menuItems.push(
				{
					label: '새 탭에서 링크 열기',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('open-link-in-new-tab', linkURL);
					},
				},
				{
					label: '링크 주소 복사',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('copy-to-clipboard', linkURL);
					},
				},
				{ type: 'separator' },
			);
		}

		// 이미지가 있는 경우
		if (srcURL) {
			menuItems.push(
				{
					label: '이미지 새 탭에서 열기',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('open-link-in-new-tab', srcURL);
					},
				},
				{
					label: '이미지 주소 복사',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('copy-to-clipboard', srcURL);
					},
				},
				{
					label: '이미지 저장',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('save-image', srcURL);
					},
				},
				{ type: 'separator' },
			);
		}

		// 텍스트 선택이 있는 경우
		if (selectionText) {
			menuItems.push(
				{
					label: '복사',
					role: 'copy',
					// click: (menuItem, focusedWindow, keyEvt) => {
					// 	if (focusedWindow) focusedWindow.webContents.send('copy-to-clipboard', selectionText);
					// },
				},
				{
					label: '검색',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('search-text', selectionText);
					},
				},
				{ type: 'separator' },
			);
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
			);
		}

		// 기본 메뉴 항목
		menuItems.push(
			{
				label: '뒤로 가기',
				enabled: canGoBack,
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('navigatorCtrl', 'goBack');
				},
			},
			{
				label: '앞으로 가기',
				enabled: canGoForward,
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('navigatorCtrl', 'goForward');
				},
			},
			{
				label: '새로고침',
				click: (menuItem, focusedWindow, keyEvt) => {
					if (focusedWindow) focusedWindow.webContents.send('navigatorCtrl', 'refresh');
				},
			},
		);
		if (isDev) {
			menuItems.push(
				{ type: 'separator' },
				{
					label: '개발자 도구',
					click: (menuItem, focusedWindow, keyEvt) => {
						if (focusedWindow) focusedWindow.webContents.send('toggle-webview-devtools');
					},
				},
			);
		}
		const contextMenu = Menu.buildFromTemplate(menuItems);
		contextMenu.popup({ window: currentWindow, x, y });
	});
}
