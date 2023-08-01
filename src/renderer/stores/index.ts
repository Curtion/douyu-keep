import { defineStore } from 'pinia'
import { ref } from 'vue'

// interface User {
//   name: Ref<string>
// }

export const useLogin = defineStore('user', () => {
  const reload = () => {
    fetch('https://www.douyu.com/member/cp/cp_rpc_ajax', {
      mode: 'no-cors',
    }).then((res) => {
      console.log(res)
    })
  }
  reload()
  const name = ref('ok')
  return {
    name,
    reload,
  }
})
