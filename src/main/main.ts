import { join } from 'node:path'
import process from 'node:process'
import { BrowserWindow, app, ipcMain, session } from 'electron'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 500,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  })

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2]
    mainWindow.loadURL(`http://localhost:${rendererPort}`)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'))
  }
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({
        requestHeaders: {
          Origin: '*',
          Referer: 'https://www.douyu.com/',
          ...details.requestHeaders,
        },
      })
    },
  )

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        'Access-Control-Allow-Origin': ['*'],
        ...details.responseHeaders,
      },
    })
  })
}

app.whenReady().then(() => {
  createWindow()

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\''],
      },
    })
  })

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

ipcMain.handle('login', (_event, _message) => {
  return new Promise<void>((resolve) => {
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        webSecurity: false,
      },
      resizable: false,
    })
    win.loadURL('https://www.douyu.com/directory')
    win.webContents.openDevTools({ mode: 'detach' })
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          'Content-Security-Policy': ['script-src \'unsafe-inline\' \'script-src-elem\' \'self\' https://www.douyu.com'],
          ...details.responseHeaders,
        },
      })
    })
    win.on('closed', () => {
      resolve()
    })
  })
})
