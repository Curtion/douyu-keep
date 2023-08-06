<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useFans, useLogin } from '~/stores'

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
            名称
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
          v-for="item in fansList"
          :key="item.roomId"
        >
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
</template>

<style scoped lang="scss">
.scrollbar-container {
  height: 100%;
  overflow-y: auto;
}
</style>
