import { contextBridge, ipcRenderer } from 'electron'

//* 렌더러 프로세스에서 사용할 API 노출
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
})

