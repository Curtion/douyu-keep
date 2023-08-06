<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLogin } from '~/stores'

const dialog = ref(false)

const { getUser } = useLogin()
const router = useRouter()

async function login() {
  dialog.value = false
  await window.electron.ipcRenderer.invoke('login')
  await getUser()
  router.push('/')
}
</script>

<template>
  <div
    class="flex items-center justify-center w-full h-full text-xl "
  >
    <button class="text-black hover:underline" @click="dialog = true">
      登录斗鱼账号
    </button>
  </div>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="50%"
    >
      <v-card>
        <v-card-text>
          在新窗口中登录账号, 登录成功后关闭窗口即可
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="login">
            确认
          </v-btn>
          <v-btn color="primary" @click="dialog = false">
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
