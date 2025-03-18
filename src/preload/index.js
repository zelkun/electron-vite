import { contextBridge, ipcRenderer } from 'electron'

console.log(`preload script loaded successfully!`)
// alert('preload script loaded successfully!')

// 메인 윈도우에서 사용할 API 노출 - 직접 호출 방식으로 간소화
contextBridge.exposeInMainWorld('electronAPI', {
	// 단방향 메시지 전송
	send: (channel, ...args) => {
		ipcRenderer.send(channel, ...args)
	},

	// 양방향 통신 (Promise 반환)
	invoke: (channel, ...args) => {
		return ipcRenderer.invoke(channel, ...args)
	},

	// 이벤트 리스너 등록
	on: (channel, callback) => {
		const subscription = (event, ...args) => callback(...args)
		ipcRenderer.on(channel, subscription)
		return () => {
			ipcRenderer.removeListener(channel, subscription)
		}
	},

	// 일회성 이벤트 리스너
	once: (channel, callback) => {
		ipcRenderer.once(channel, (event, ...args) => callback(...args))
	},
})

