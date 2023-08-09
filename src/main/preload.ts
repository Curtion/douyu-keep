import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer,
})
contextBridge.exposeInMainWorld('node', {
  handleStartJob: (callback: () => void) => ipcRenderer.on('startJob', callback),
})
