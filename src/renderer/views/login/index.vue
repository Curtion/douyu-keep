<script setup lang="ts">
import { useLogin } from '~/stores'

// https://www.douyu.com/member/cp/cp_rpc_ajax
const { name, reload } = useLogin()

function reload1() {
  window.location.reload()
}

function login() {
  window.electron.ipcRenderer.invoke('login').then(() => {
    console.log('登录成功')
    reload()
  })
}
</script>

<template>
  <div>
    {{ name }}
    123456
  </div>
  <button @click="reload1">
    reload
  </button>
  <button @click="login">
    login
  </button>
</template>
