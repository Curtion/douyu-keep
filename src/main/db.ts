// import { join } from 'node:path'
import { app } from 'electron'

// import Store from 'electron-store'
// import type { Config } from '../renderer/stores/fans'

// const file = join(app.getAppPath(), 'db.json')
// const adapter = new JSONFile<Config>(file)
// const defaultData = {
//   boot: false, // 开机自启
//   close: false, // 自动关闭
//   type: '自动执行', // 执行模式
//   cron: '', // cron表达式, 执行模式为定时执行时有效
//   model: 1, // 荧光棒分配逻辑 1: 百分比 2: 指定数量
//   send: {},
// }
// const db = new Low<Config>(adapter, defaultData)
export default function () {
  console.log(app.getPath('userData'))
}
