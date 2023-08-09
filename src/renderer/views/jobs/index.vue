<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import startJob from '~/run'
import { getConfig } from '~/run/utils'
import { useCronStatus, useFans, useLog, useLogin } from '~/stores'

const dialog = ref(false)

const log = useLog()
const { title, text, runing } = storeToRefs(log)

const cronjob = useCronStatus()
const { isCronRuning } = storeToRefs(cronjob)

const router = useRouter()
const route = useRoute()
const login = useLogin()
const fans = useFans()
const { fansList, loading } = storeToRefs(fans)
const { user } = storeToRefs(login)

const warn = reactive({
  show: false,
  timeout: 10000,
  text: '',
  color: 'blue-grey',
})

async function init(manual = false) {
  if (fansList.value.length === 0) {
    fans.getFansList()
  }
  try {
    if (route.params?.from === '/' || manual) {
      await startJob(manual)
      await refresh()
    }
  } catch (error: any) {
    warn.show = true
    warn.text = error.toString()
  }
}
init()

async function startCron() {
  if (isCronRuning.value) {
    return
  }
  try {
    const { cron, type } = await getConfig()
    if (cron && type === '定时执行') {
      window.node.handleStartJob(() => {
        init(true)
      })
      await window.electron.ipcRenderer.invoke('timer', { cron })
      isCronRuning.value = true
    }
  } catch (error: any) {
    warn.show = true
    warn.text = error.toString()
  }
}
startCron()

async function refresh() {
  await login.getUser(true)
  await fans.getFansList()
}

async function switchLogin() {
  dialog.value = false
  try {
    await window.electron.ipcRenderer.invoke('login')
  } catch (error) {
    console.log(error)
  }
  login.getUser(true).then(() => {
    fans.getFansList()
  }).catch(() => {
    router.push('/login')
  })
}
</script>

<template>
  <header class="m-1 flex justify-between">
    <div flex flex-gap-1>
      <v-btn variant="tonal" size="small" @click="refresh">
        刷新
      </v-btn>
      <v-btn variant="tonal" size="small" @click="init(true)">
        开始任务
      </v-btn>
      <v-btn variant="tonal" size="small" @click="dialog = true">
        切换账号
      </v-btn>
    </div>
    <div flex flex-gap-1 items-center flex-gap-2>
      <span v-if="user.giftNumber === -1" opacity-60 c-red>-</span>
      <span v-else-if="user.giftNumber !== 0" opacity-60>剩余荧光棒: <span c-blue>{{ user.giftNumber }}</span>个</span>
      <span v-else-if="user.giftNumber === 0" opacity-60 c-green>任务完成</span>
      <span c-amber>账号: {{ user.phone }}</span>
      <img :src="user.level" alt="用户等级" w-40px h-16px>
    </div>
  </header>
  <div v-if="loading" h-full flex justify-center items-center>
    <v-progress-circular
      indeterminate
      color="primary"
    />
  </div>
  <div v-else class="scrollbar-container">
    <v-alert
      v-model="runing"
      :title="title"
      :text="text"
      border="start"
      border-color="deep-purple accent-4"
      elevation="1"
    />
    <v-table>
      <thead>
        <tr>
          <th class="text-left">
            序号
          </th>
          <th class="text-left">
            主播名称
          </th>
          <th class="text-left">
            房间号
          </th>
          <th class="text-left">
            粉丝牌等级
          </th>
          <th class="text-left">
            粉丝牌排名
          </th>
          <th class="text-left">
            今日亲密度
          </th>
          <th class="text-left">
            亲密度
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in fansList"
          :key="item.roomId"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.roomId }}</td>
          <td>{{ item.level }}</td>
          <td>{{ item.rank }}</td>
          <td>{{ item.today }}</td>
          <td>{{ item.intimacy }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="50%"
    >
      <v-card>
        <v-card-text>
          在新窗口中退出并登录新账号, 登录成功后关闭窗口即可
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="dialog = false">
            取消
          </v-btn>
          <v-btn color="primary" @click="switchLogin">
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <v-snackbar
    v-model="warn.show"
    :timeout="warn.timeout"
    :color="warn.color"
    rounded="pill"
  >
    {{ warn.text }}
    <template #actions>
      <v-btn
        color="blue"
        variant="text"
        @click="warn.show = false"
      >
        关闭
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped lang="scss">
.scrollbar-container {
  height: calc(100vh - 32px);
  overflow-y: auto;
}
</style>
