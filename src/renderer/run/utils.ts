import axios from 'axios'
import type { Config, SendGift } from '~/stores/fans'

export async function getGiftNumber() {
  const { data } = await axios.get('https://www.douyu.com/japi/prop/backpack/web/v1?rid=4120796')
  if (data.data?.list?.length > 0) {
    return data.data?.list.find((item: any) => item.id === 268)?.count
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
