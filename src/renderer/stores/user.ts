import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getGiftNumber } from '~/run/utils'

export interface User {
  isLogin: boolean
  phone: string
  level: string
  giftNumber: number
}

export const useLogin = defineStore('user', () => {
  const user = ref<User>({
    isLogin: false,
    phone: '',
    level: '',
    giftNumber: -1,
  })
  const getUser = async (force = false) => {
    if (user.value.isLogin && !force) {
      return Promise.resolve(user.value)
    }
    try {
      const number = await getGiftNumber()
      const info = await axios.get('https://www.douyu.com/member/cp/cp_rpc_ajax')
      if (typeof info.data === 'object') {
        user.value.isLogin = true
        user.value.phone = info.data.info?.mobile_phone?.slice(-11)
        user.value.level = info.data.exp_info?.current?.pic_url
        user.value.giftNumber = number
        Promise.resolve(user.value)
      } else {
        user.value.isLogin = false
        Promise.reject(new Error('当前未登录!'))
      }
    } catch (error) {
      user.value.isLogin = false
      Promise.reject(error)
    }
  }
  return {
    user,
    getUser,
  }
})
