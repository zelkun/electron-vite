const { ipcRenderer, contextBridge } = require('electron')

console.log('Webview preload script loaded successfully!')
// alert('webview preload script loaded successfully!')

// webview에서 사용할 API 노출
contextBridge.exposeInMainWorld('webviewAPI', {
	send: (channel, ...args) => {
		ipcRenderer.send(channel, ...args)
	},
	on: (channel, callback) => {
		ipcRenderer.on(channel, (event, ...args) => callback(...args))
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
