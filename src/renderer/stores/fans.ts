import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export interface Fans {
  roomId: number // 房间号
  name: string // 主播名称
  level: number // 粉丝牌等级
  rank: number // 粉丝牌排名
  intimacy: string // 亲密度
  today: number // 今日亲密度
}

export interface SendGift {
  roomId: number // 房间号
  number: number // 礼物数量
  giftId: number // 礼物id
  percentage: number // 亲密度百分比
  count?: number // 实际荧光棒数量
}

export interface Config {
  boot: boolean // 开机自启
  close: boolean // 自动关闭
  type: '自动执行' | '定时执行' | '手动执行' // 执行模式 '自动执行', '定时执行', '手动执行'
  time: '跟随执行模式' | '自定义' // 执行时机 '跟随执行模式', '自定义'
  timeValue: (1 | 2 | 3 | 4 | 5 | 6 | 0)[] // 执行时机(星期)
  cron: string // cron表达式, 执行模式为定时执行时有效
  model: 1 | 2 // 荧光棒分配逻辑 1: 百分比 2: 指定数量
  send: sendConfig
}
export type sendConfig = Record<string, SendGift>

export const useFans = defineStore('fans', () => {
  const fansList = ref<Fans[]>([])
  const loading = ref<boolean>(false)
  const getFansList = () => {
    return new Promise<Fans[]>((resolve, reject) => {
      loading.value = true
      axios.get('https://www.douyu.com/member/cp/getFansBadgeList').then((res) => {
        const table = res.data.match(/fans-badge-list">([\S\s]*?)<\/table>/)[1]
        const list = table.match(/<tr([\s\S]*?)<\/tr>/g)
        list?.shift()
        const fans: Fans[] = list?.map((item: any) => {
          const tds = item.match(/<td([\s\S]*?)<\/td>/g)
          const res: Fans = {
            name: String(item.match(/data-anchor_name=\"([\S\s]+?)\"/)[1]),
            roomId: Number(item.match(/data-fans-room=\"(\d+)\"/)[1]),
            level: Number(item.match(/data-fans-level=\"(\d+)\"/)[1]),
            rank: Number(item.match(/data-fans-rank=\"(\d+)\"/)[1]),
            intimacy: String(tds[2].replace(/<([\s\S]*?)>/g, '').trim()),
            today: Number(tds[3].replace(/<([\s\S]*?)>/g, '').trim()),
          }
          return res
        })
        fansList.value = fans.sort((a, b) => b.level - a.level)
        resolve(fansList.value)
      }).catch((err) => {
        reject(err)
      }).finally(() => {
        loading.value = false
      })
    })
  }
  return {
    fansList,
    loading,
    getFansList,
  }
})
