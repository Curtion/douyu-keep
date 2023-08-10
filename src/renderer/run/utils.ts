import axios from 'axios'
import type { Config, SendGift, sendConfig } from '~/stores/fans'

export async function getGiftNumber() {
  const { data } = await axios.get('https://www.douyu.com/japi/prop/backpack/web/v1?rid=4120796')
  if (data.data?.list?.length > 0) {
    return data.data?.list.find((item: any) => item.id === 268)?.count ?? 0
  } else {
    return 0
  }
}

export function sleep(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export async function sendGift(args: sendArgs, Job: SendGift) {
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

export async function getDyAndSid() {
  const data: sendArgs = await window.electron.ipcRenderer.invoke('getDyAndSid')
  return data
}

export async function getDid(roomid: string) {
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

export async function getConfig() {
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

export async function computeGiftCountOfNumber(number: number, send: sendConfig) {
  const cfgCountNumber = Object.values(send).reduce((a, b) => a + (b.number === -1 ? 0 : b.number), 0)
  if (cfgCountNumber > number) {
    return Promise.reject(new Error(`荧光棒数量不足,请重新配置. 当前${number}个, 需求${cfgCountNumber}个`))
  }
  const sendSort = Object.values(send).sort((a, b) => b.number - a.number)
  for (let i = 0; i < sendSort.length; i++) {
    const item = sendSort[i]
    if (i === sendSort.length - 1) {
      const count = number - sendSort.reduce((a, b) => a + (b.count || 0), 0)
      item.count = count
    } else {
      item.count = item.number
    }
  }
  const newSend = sendSort.reduce((a, b) => {
    return {
      ...a,
      [b.roomId]: b,
    }
  }, {} as sendConfig)
  return newSend
}

export async function computeGiftCountOfPercentage(number: number, send: sendConfig) {
  const sendSort = Object.values(send).sort((a, b) => a.percentage - b.percentage)
  for (let i = 0; i < sendSort.length; i++) {
    const item = sendSort[i]
    if (i === sendSort.length - 1) {
      const count = number - sendSort.reduce((a, b) => a + (b.count || 0), 0)
      item.count = count
    } else {
      if (item.percentage === 0) {
        item.count = 0
        continue
      }
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
  const cfgCountNumber = Object.values(newSend).reduce((a, b) => a + (b.number <= -1 ? 1 : b.number), 0)
  if (cfgCountNumber > number) {
    return Promise.reject(new Error(`荧光棒数量不足,请重新配置. 当前${number}个, 需求${cfgCountNumber}个`))
  }
  return newSend
}
