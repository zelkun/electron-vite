// src/preload/webviewPreload.js
import { ipcRenderer, contextBridge } from 'electron';

console.log(`Webview preload script loaded successfully! ${window.location.href}`);

// webview에서 사용할 API 노출
contextBridge.exposeInMainWorld('webviewAPI', {
	// 단방향 메시지 전송
	send: (channel, ...args) => {
		ipcRenderer.send(channel, ...args);
	},

	// 양방향 통신 (Promise 반환)
	invoke: (channel, ...args) => {
		return ipcRenderer.invoke(channel, ...args);
	},

	// 이벤트 리스너 등록
	on: (channel, callback) => {
		const subscription = (event, ...args) => callback(...args);
		ipcRenderer.on(channel, subscription);
		return () => {
			ipcRenderer.removeListener(channel, subscription);
		};
	},

	// 일회성 이벤트 리스너
	once: (channel, callback) => {
		ipcRenderer.once(channel, (event, ...args) => callback(...args));
	},

	// 호스트에 직접 메시지 전송 (렌더러 프로세스에서 사용)
	sendToHost: (channel, ...args) => {
		ipcRenderer.sendToHost(channel, ...args);
	},

	// 호스트에서 메시지 수신 (렌더러 프로세스에서 사용)
	// callback은 메시지 수신 시 호출됨
	receiveFromHost: (channel, callback) => {
		const subscription = (event, ...args) => callback(...args);
		ipcRenderer.on(channel, subscription);
		return () => {
			ipcRenderer.removeListener(channel, subscription);
		};
	},
});

window.addEventListener('contextmenu', (e) => {
	e.preventDefault();
	const opt = {
		x: e.clientX,
		y: e.clientY,
		linkURL: e.target.closest('a')?.href || '',
		srcURL: e.target.closest('img')?.src || '',
		isEditable: e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA',
		selectionText: window.getSelection().toString(),
	};
	ipcRenderer.sendToHost('show-webview-context-menu', opt);
});

window.addEventListener('mouseup', (e) => {
	// 마우스 버튼 클릭 시 이벤트 리스너
	e.preventDefault(); // 기본 동작 방지
	e.stopPropagation(); // 이벤트 전파 방지
	e.stopImmediatePropagation(); // 즉시 전파 방지

	console.log('Mouse button pressed:', e.button); // 실제 버튼 번호 확인용

	// 마우스 뒤로 가기 버튼 (일반적으로 버튼 3 또는 8)
	if (e.button === 3 || e.button === 8) {
		ipcRenderer.sendToHost('webview-navigation', 'goBack');
	}
	// 마우스 앞으로 가기 버튼 (일반적으로 버튼 4 또는 9)
	else if (e.button === 4 || e.button === 9) {
		ipcRenderer.sendToHost('webview-navigation', 'goForward');
	}
});
