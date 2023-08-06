<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLogin } from '~/stores'

const { getUser } = useLogin()
const router = useRouter()

async function login() {
  await window.electron.ipcRenderer.invoke('login')
  await getUser()
  router.push('/')
}
</script>

<template>
  <div
    class="flex items-center justify-center w-full h-full text-xl "
  >
    <button class="text-black hover:underline" @click="login">
      登录斗鱼账号
    </button>
  </div>
</template>
