import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
	send: (channel, ...args) => {
		ipcRenderer.send(channel, ...args)
	},
	invoke: (channel, ...args) => {
		return ipcRenderer.invoke(channel, ...args)
	},
	on: (channel, func) => {
		const subscription = (_event, ...args) => func(...args)
		ipcRenderer.on(channel, subscription)
		/*
    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
    */
	},
	once: (channel, func) => {
		ipcRenderer.once(channel, (_event, ...args) => func(...args))
	},
	getWebviewPreloadPath: () => {
		return ipcRenderer.invoke('get-webview-preload-path')
	},

	// 설정 관련 메서드 추가
	getConfigSection: (section) => {
		return ipcRenderer.invoke('get-config-section', section)
	},
	saveConfigSection: (section, data) => {
		return ipcRenderer.invoke('save-config-section', section, data)
	},
	getConfigValue: (section, key) => {
		return ipcRenderer.invoke('get-config-value', section, key)
	},
	setConfigValue: (section, key, value) => {
		return ipcRenderer.invoke('set-config-value', section, key, value)
	},
})

