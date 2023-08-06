import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  isLogin: boolean
  phone: string
  level: string
}

export const useLogin = defineStore('user', () => {
  const user = ref<User>({
    isLogin: false,
    phone: '',
    level: '',
  })
  const getUser = (force = false) => {
    return new Promise<User>((resolve, reject) => {
      if (user.value.isLogin && !force) {
        return resolve(user.value)
      }
      axios.get('https://www.douyu.com/member/cp/cp_rpc_ajax').then((res) => {
        if (typeof res.data === 'object') {
          user.value.isLogin = true
          user.value.phone = res.data.info?.mobile_phone?.slice(-11)
          user.value.level = res.data.exp_info?.current?.pic_url
          resolve(user.value)
        } else {
          user.value.isLogin = false
          reject(new Error('当前未登录!'))
        }
      }).catch((err) => {
        user.value.isLogin = false
        reject(err)
      })
    })
  }
  return {
    user,
    getUser,
  }
})
