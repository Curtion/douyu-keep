import process from 'node:process'
import { BrowserWindow, ipcMain, session } from 'electron'
import cronParse from 'cron-parser'
import type { sendArgs } from '../shared'
import db from './db'

export default function init() {
  ipcMain.handle('login', () => {
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

  ipcMain.handle('getGift', () => {
    return new Promise<void>((resolve) => {
      const win = new BrowserWindow({
        width: 1200,
        height: 800,
        resizable: false,
        webPreferences: {
          webSecurity: false,
        },
        show: false,
      })
      win.loadURL('https://www.douyu.com/4120796', {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188',
      })
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
      setTimeout(() => {
        win.close()
      }, 10000)
    })
  })

  ipcMain.handle('db', (_, { type, key, value }) => {
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

  ipcMain.handle('cron', (_, cron) => {
    return new Promise<any>((resolve, reject) => {
      try {
        const interval = cronParse.parseExpression(cron)
        resolve(interval.next().toDate().getTime())
      } catch (error) {
        reject(error)
      }
    })
  })

  ipcMain.handle('getDyAndSid', () => {
    return new Promise<sendArgs>((resolve, reject) => {
      try {
        session.defaultSession.cookies.get({ domain: 'douyu.com' })
          .then((cookies) => {
            const sid = cookies.find(cookie => cookie.name === 'acf_uid')?.value
            const dy = cookies.find(cookie => cookie.name === 'dy_did')?.value
            if (sid && dy) {
              resolve({ sid, dy })
            } else {
              reject(new Error('Cookie中没有找到sid和dy'))
            }
          }).catch((error) => {
            reject(error)
          })
      } catch (error) {
        reject(error)
      }
    })
  })
}
