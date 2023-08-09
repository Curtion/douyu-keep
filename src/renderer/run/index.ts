import axios from 'axios'
import { storeToRefs } from 'pinia'
import type { Config, SendGift, sendConfig } from '~/stores/fans'
import { useLog } from '~/stores'

const log = useLog()

const { text, runing } = storeToRefs(log)

export default async function startJob(manual: boolean) {
  if (runing.value) {
    text.value = '任务正在执行中...'
    return
  }
  const { type } = await getConfig()
  if (manual) {
    await start()
    return
  }
  if (type === '自动执行') {
    await start()
    return
  }
  if (type === '定时执行') {
    // TODO: 创建定时任务
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
  const number = await getGiftNumber()
  if (number === 0) {
    text.value = '荧光棒数量为0, 结束任务'
    setTimeout(() => {
      runing.value = false
    }, 10000)
    return
  }
  text.value = `荧光棒数量为${number}`
  sleep(2000)
  const { send, model } = await getConfig()
  let Jobs: sendConfig = {}
  if (model === 1) {
    // 百分比赠送
    const cfgCountNumber = Object.values(send).reduce((a, b) => a + b.percentage, 0)
    if (cfgCountNumber > 100) {
      text.value = `亲密度百分比配置错误,请重新配置. 当前${cfgCountNumber}%, 最大100%`
      setTimeout(() => {
        runing.value = false
      }, 10000)
      return
    }
    const sendSort = Object.values(send).sort((a, b) => a.percentage - b.percentage)
    for (let i = 0; i < sendSort.length; i++) {
      const item = sendSort[i]
      if (i === sendSort.length - 1) {
        item.count = number - sendSort.reduce((a, b) => a + (b.count || 0), 0)
      } else {
        const count = Math.floor((item.percentage / 100) * number)
        item.count = count === 0 ? 1 : count
      }
    }
    const newSend = sendSort.reduce((a, b) => {
      return {
        ...a,
        [b.roomId]: b,
      }
    }, {} as sendConfig)
    Jobs = newSend
  } else if (model === 2) {
    // 指定数量赠送
    const cfgCountNumber = Object.values(send).reduce((a, b) => a + (b.number === -1 ? 0 : b.number), 0)
    if (cfgCountNumber > number) {
      text.value = `荧光棒数量不足,请重新配置. 当前${number}个, 需求${cfgCountNumber}个`
      setTimeout(() => {
        runing.value = false
      }, 10000)
      return
    }
    for (const key in send) {
      if (send[key].number === -1) {
        send[key].count = number - cfgCountNumber
      } else {
        send[key].count = send[key].number
      }
    }
    Jobs = send
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
  setTimeout(() => {
    runing.value = false
  }, 10000)
}

function sleep(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

async function sendGift(args: sendArgs, Job: SendGift) {
  const data = new FormData()
  data.append('rid', String(Job.roomId))
  data.append('prop_id', String(Job.giftId))
  data.append('num', String(Job.count))
  data.append('sid', args.sid!)
  data.append('did', args.did!)
  data.append('dy', args.dy!)
  const res = await axios.post('https://www.douyu.com/member/prop/send', data)
  return JSON.stringify(res.data)
}

async function getDyAndSid() {
  const data: sendArgs = await window.electron.ipcRenderer.invoke('getDyAndSid')
  return data
}

async function getDid(roomid: string) {
  return new Promise<string>((resolve, reject) => {
    axios.get(`https://www.douyu.com/${roomid}`).then((res) => {
      const did: string = res.data.match(/owner_uid =(.*?);/)[1].trim()
      if (did !== undefined) {
        resolve(did)
      } else {
        reject(new Error('获取did失败'))
      }
    })
  })
}

export async function getGiftNumber() {
  try {
    const { data } = await axios.get('https://www.douyu.com/japi/prop/backpack/web/v1?rid=4120796')
    if (data.data?.list?.length > 0) {
      return data.data?.list.find((item: any) => item.id === 268)?.count
    } else {
      return 0
    }
  } catch (error) {
    text.value = `获取荧光棒数量失败${error}`
    return 0
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
