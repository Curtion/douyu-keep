import { join } from 'node:path'
import process from 'node:process'
import { BrowserWindow, app, session } from 'electron'
import ipc from './ipc'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 500,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
    resizable: false,
    icon: join(__dirname, '../', '../', 'icon.png'),
  })
  ipc(() => {
    mainWindow.webContents.send('startJob')
  })
  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2]
    mainWindow.loadURL(`http://localhost:${rendererPort}`, {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188',
    })
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'))
  }
  mainWindow.setMenuBarVisibility(false)
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    session.defaultSession.cookies.get({ url: 'https://www.douyu.com' })
      .then((cookies) => {
        const cookiesStr = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(';')
        callback({
          requestHeaders: {
            ...details.requestHeaders,
            Origin: '*',
            Referer: 'https://www.douyu.com/',
            Cookie: cookiesStr,
          },
        })
      }).catch((error) => {
        console.log(error)
        callback({
          requestHeaders: {
            ...details.requestHeaders,
            Origin: '*',
            Referer: 'https://www.douyu.com/',
          },
        })
      })
  },
  )
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
      },
    })
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
