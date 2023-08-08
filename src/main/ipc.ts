import process from 'node:process'
import { BrowserWindow, ipcMain } from 'electron'
import db from './db'

export default function init() {
  ipcMain.handle('login', (_event, _message) => {
    return new Promise<void>((resolve) => {
      const win = new BrowserWindow({
        width: 1200,
        height: 800,
        resizable: false,
        webPreferences: {
          webSecurity: false,
        },
      })
      win.loadURL('https://www.douyu.com/directory', {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188',
      })
      if (process.env.NODE_ENV === 'development') {
        win.webContents.openDevTools({ mode: 'detach' })
      }
      win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': ['*'],
            'Access-Control-Allow-Origin': ['*'],
          },
        })
      })
      win.on('closed', () => {
        resolve()
      })
    })
  })

  ipcMain.handle('db', (_event, { type, key, value }) => {
    return new Promise<any>((resolve, reject) => {
      if (type === 'get') {
        resolve(db.get(key))
      } else if (type === 'set') {
        db.set(key, value)
        resolve(undefined)
      } else if (type === 'delete') {
        db.delete(key)
        resolve(undefined)
      } else {
        reject(new Error('未知的消息'))
      }
    })
  })
}
