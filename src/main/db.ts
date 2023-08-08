// import type { Config } from '../renderer/stores/fans'
import { app } from 'electron'
import Store from 'electron-store'

const store = new Store()

console.log(app.getPath('userData'))

export default {
  get: (key: string) => {
    return store.get(key)
  },
  set: (key: string, value: any) => {
    store.set(key, value)
  },
  delete: (key: string) => {
    store.delete(key)
  },
}
