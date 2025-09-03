// src/preload/popPreload.js
import { ipcRenderer, contextBridge } from 'electron';

console.log('pop preload script loaded successfully!');

contextBridge.exposeInMainWorld('popupAPI', {
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
