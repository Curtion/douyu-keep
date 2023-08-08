// 1. 进入首页时执行
// 2. 检查执行模式
//     2.1 如果是自动执行则进入3步骤
//     2.2 如果是手动执行则跳过后续逻辑
//     2.3 如果是定时执行则创建定时任务(单例)
// 3. 领取荧光棒
// 4. 获取荧光棒数量,如果为0则跳过后续逻辑
// 5. 获取赠送荧光棒所需的参数
// 6. 判断是百分比还是指定数量赠送,并计算出数量.如果是百分比则向下取整,但是最小为1, 最后一个人会收到剩余的所有荧光棒
// 7. 开始赠送
// 8. 再次执行任务.

import type { Config } from '~/stores/fans'

export default async function startJob(manual: boolean) {
  const { type } = await getConfig()
  if (type === '手动执行') {
    return
  }
  if (type === '自动执行' || manual) {
    // TODO: 执行逻辑
  }
  if (type === '定时执行') {
    // TODO: 创建定时任务
  }
}

async function getConfig() {
  const cfg = await window.electron.ipcRenderer.invoke('db', {
    type: 'get',
    key: 'config',
  })
  try {
    return JSON.parse(cfg) as Config
  } catch (error) {
    throw new Error('请先配置任务!')
  }
}
