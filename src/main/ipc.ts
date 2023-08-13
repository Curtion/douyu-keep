import process from 'node:process'
import { BrowserWindow, app, ipcMain, session } from 'electron'
import cronParse from 'cron-parser'
import { CronJob } from 'cron'
import AutoLaunch from 'auto-launch'

import db from './db'

let job: CronJob | undefined

export default function init(callback: () => void) {
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
        const data: Date[] = []
        for (let i = 0; i < 3; i++) {
          data.push(interval.next().toDate())
        }
        resolve(data)
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

  ipcMain.handle('close', () => {
    return new Promise<void>((resolve, reject) => {
      try {
        app.exit()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  })

  ipcMain.handle('timer', (_, { cron, stop = false }) => {
    return new Promise<void>((resolve, reject) => {
      try {
        if (stop) {
          if (job) {
            job.stop()
            job = undefined
            return resolve()
          }
          return resolve()
        }
        if (job) {
          job.stop()
          job = undefined
        }
        job = new CronJob(
          cron,
          callback,
          null,
          false,
          'Asia/Shanghai',
        )
        job.start()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  })

  ipcMain.handle('boot', (_, status) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const douyuAutoLauncher = new AutoLaunch({
          name: 'douyu-keep',
          path: process.execPath,
        })
        if (status) {
          douyuAutoLauncher.isEnabled()
            .then((isEnabled) => {
              if (isEnabled) {
                resolve()
              } else {
                douyuAutoLauncher.enable().then(resolve).catch(reject)
              }
            }).catch(reject)
        } else {
          douyuAutoLauncher.isEnabled()
            .then((isEnabled) => {
              if (isEnabled) {
                douyuAutoLauncher.disable().then(resolve).catch(reject)
              } else {
                resolve()
              }
            }).catch(reject)
        }
      } catch (error) {
        reject(error)
      }
    })
  })
}
