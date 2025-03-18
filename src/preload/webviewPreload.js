const { ipcRenderer, contextBridge } = require('electron')

console.log('Webview preload script loaded successfully!')
// alert('webview preload script loaded successfully!')

// webview에서 사용할 API 노출
contextBridge.exposeInMainWorld('webviewAPI', {
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

window.addEventListener('contextmenu', (e) => {
	e.preventDefault()
	try {
		ipcRenderer.send('show-webview-context-menu', {
			x: e.clientX,
			y: e.clientY,
			linkURL: e.target.closest('a')?.href || '',
			srcURL: e.target.closest('img')?.src || '',
			isEditable: e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA',
			selectionText: window.getSelection().toString(),
		})
	} catch (error) {
		console.error('Failed to send IPC message:', error)
	}
})
