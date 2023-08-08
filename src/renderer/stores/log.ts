import { defineStore } from 'pinia'
import { reactive, toRefs } from 'vue'

export interface Log {
  title: string
  text: string
  runing: boolean
}

export const useLog = defineStore('log', () => {
  const log = reactive<Log>({
    title: '执行日志',
    text: 'Loading...',
    runing: false,
  })
  return toRefs(log)
})
