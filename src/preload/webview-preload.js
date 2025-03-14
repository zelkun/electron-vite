const { ipcRenderer, contextBridge } = require('electron')

// webview에서 사용할 API 노출
contextBridge.exposeInMainWorld('webviewAPI', {
	ping: () => {
		ipcRenderer.send('webview-ping')
		return 'ping sent from webview'
	},
	send: (channel, ...args) => {
		ipcRenderer.send(channel, ...args)
	},
	on: (channel, callback) => {
		ipcRenderer.on(channel, (event, ...args) => callback(...args))
	},
})

console.log('Webview preload script loaded successfully!')
