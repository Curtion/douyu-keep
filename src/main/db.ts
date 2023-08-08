import Store from 'electron-store'

const store = new Store()

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
