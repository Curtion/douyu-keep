import { storeToRefs } from 'pinia'
import { computeGiftCountOfNumber, computeGiftCountOfPercentage, getConfig, getDid, getDyAndSid, getGiftNumber, sendGift, sleep } from './utils'
import type { sendConfig } from '~/stores/fans'
import { useLog } from '~/stores'

const log = useLog()

const { text, runing } = storeToRefs(log)

export default async function startJob(manual: boolean) {
  if (runing.value) {
    text.value = '任务正在执行中...'
    return
  }
  const { type } = await getConfig()
  if (type === '自动执行' || manual) {
    await start()
  }
}

async function start() {
  runing.value = true
  text.value = '即将开始任务'
  let index = 0
  const timer = setInterval(() => {
    index++
    text.value = `正在领取荧光棒${index}秒...`
  }, 1000)
  try {
    await window.electron.ipcRenderer.invoke('getGift')
  } catch (error) {
    clearInterval(timer)
    text.value = `领取荧光棒失败${error}`
    setTimeout(() => {
      runing.value = false
    }, 10000)
    return
  }
  clearInterval(timer)
  text.value = '领取荧光棒成功'
  let number = 0
  try {
    number = await getGiftNumber()
  } catch (error) {
    text.value = `获取荧光棒数量失败${error}`
    setTimeout(() => {
      runing.value = false
    }, 10000)
    return
  }
  if (number === 0) {
    text.value = '荧光棒数量为0, 结束任务'
    setTimeout(() => {
      runing.value = false
    }, 10000)
    return
  }
  text.value = `荧光棒数量为${number}`
  sleep(2000)
  const { send, model, close } = await getConfig()
  let Jobs: sendConfig = {}
  if (model === 1) {
    // 百分比赠送
    try {
      const sendNumber = await computeGiftCountOfPercentage(number, send)
      Jobs = sendNumber
    } catch (error: any) {
      text.value = error.toString()
      setTimeout(() => {
        runing.value = false
      }, 10000)
      return
    }
  } else if (model === 2) {
    // 指定数量赠送
    try {
      const sendNumber = await computeGiftCountOfNumber(number, send)
      Jobs = sendNumber
    } catch (error: any) {
      text.value = error.toString()
      setTimeout(() => {
        runing.value = false
      }, 10000)
      return
    }
  }
  text.value = '开始获取必要参数dy和sid'
  let args: sendArgs = {}
  try {
    args = await getDyAndSid()
  } catch (error) {
    text.value = `结束任务:获取参数失败${error}`
    setTimeout(() => {
      runing.value = false
    }, 10000)
    return
  }
  for (const item of Object.values(Jobs)) {
    try {
      if (item.count === 0) {
        continue
      }
      text.value = `即将赠送${item.roomId}房间${item.count}个荧光棒`
      const did = await getDid(item.roomId.toString())
      args.did = did
      await sendGift(args, item)
      text.value = `赠送${item.roomId}房间${item.count}个荧光棒成功`
    } catch (error) {
      text.value = `${item.roomId}房间赠送失败${error}`
    }
    await sleep(2000)
  }
  text.value = '任务执行完毕'
  setTimeout(async () => {
    runing.value = false
    if (close) {
      window.electron.ipcRenderer.invoke('close')
    }
  }, 2000)
}
