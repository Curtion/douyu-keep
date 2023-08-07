<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFans, useLogin } from '~/stores'

const dialog = ref(false)

const router = useRouter()
const login = useLogin()
const fans = useFans()
const { fansList, loading } = storeToRefs(fans)
const { user } = storeToRefs(login)

if (fansList.value.length === 0) {
  fans.getFansList()
}

function refresh() {
  login.getUser(true)
  fans.getFansList()
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
      <v-btn variant="tonal" size="small">
        开始任务
      </v-btn>
      <v-btn variant="tonal" size="small" @click="dialog = true">
        切换账号
      </v-btn>
    </div>
    <div flex flex-gap-1 items-center>
      <span c-blue>账号: {{ user.phone }}</span>
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
</template>

<style scoped lang="scss">
.scrollbar-container {
  height: 100%;
  overflow-y: auto;
}
</style>
