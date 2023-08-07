<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { reactive, ref } from 'vue'
import { useFans } from '~/stores'
import type { SendGift } from '~/stores/fans'

type sendConfig = Record<string, SendGift>

const boot = ref(false) // 开机自启
const close = ref(false) // 自动关闭
const run = reactive({
  type: '自动执行',
  cron: '',
  model: 1,
})

const fans = useFans()
const { fansList } = storeToRefs(fans)
const send = ref<sendConfig>({
  ...fansList.value.reduce((prev, curr) => {
    prev[curr.roomId] = {
      percentage: 0,
      number: 0,
      giftId: 268,
      roomId: curr.roomId,
    }
    return prev
  }, {} as sendConfig),
})
</script>

<template>
  <div class="scrollbar-container p-2">
    <v-row>
      <v-col cols="6">
        <div flex items-center>
          <label for="boot">开机自启</label>
          <v-checkbox
            id="boot"
            v-model="boot"
            color="success"
            hide-details
            class="flex-initial"
          />
        </div>
      </v-col>
      <v-col cols="6">
        <div flex items-center>
          <label for="close">自动关闭</label>
          <v-checkbox
            id="close"
            v-model="close"
            color="success"
            hide-details
            class="flex-initial"
          />
          <v-tooltip text="任务完成后是否自动关闭软件">
            <template #activator="{ props }">
              <div v-bind="props" class="i-carbon-help" />
            </template>
          </v-tooltip>
        </div>
      </v-col>
    </v-row>
    <v-divider class="border-opacity-75 my-3" color="success" />
    <div flex items-center flex-gap-2 mb-3>
      <v-select
        v-model:model-value="run.type"
        label="执行模式"
        :items="['自动执行', '定时执行', '手动执行']"
        variant="outlined"
        hide-details
      />
      <v-tooltip text="手动执行: 需要手动点击执行。自动执行:软件启动时自动执行。定时执行:满足定时条件执行">
        <template #activator="{ props }">
          <div v-bind="props" class="i-carbon-help" />
        </template>
      </v-tooltip>
    </div>
    <v-text-field
      v-if="run.type === '定时执行'"
      v-model:model-value="run.cron"
      clearable
      label="请输入cron表达式"
    />
    <span v-if="run.type === '定时执行'">
      在线生成表达式: http://cron.ciding.cc/
    </span>
    <v-divider class="border-opacity-75 my-3" color="success" />
    <v-radio-group
      v-model="run.model"
      label="荧光棒分配逻辑"
      inline
      hide-details
      items-center
    >
      <v-radio label="百分比" :value="1" />
      <v-radio label="指定数量" :value="2" />
      <v-tooltip text="填写-1表示剩余总数">
        <template #activator="{ props }">
          <div ml-3 v-bind="props" class="i-carbon-help" />
        </template>
      </v-tooltip>
    </v-radio-group>
    <v-divider class="border-opacity-75 my-3" color="success" />
    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-left">
            序号
          </th>
          <th class="text-left">
            主播名称
          </th>
          <th class="text-left">
            粉丝牌等级
          </th>
          <th class="text-left">
            粉丝牌排名
          </th>
          <th class="text-left">
            亲密度
          </th>
          <th class="text-center">
            数量({{ run.model === 1 ? '%' : '个' }})
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
          <td>{{ item.level }}</td>
          <td>{{ item.rank }}</td>
          <td>{{ item.intimacy }}</td>
          <td w-35>
            <v-text-field
              v-if="run.model === 1"
              v-model="send[item.roomId].percentage"
              label="赠送数量"
              hide-details
            />
            <v-text-field
              v-if="run.model === 2"
              v-model="send[item.roomId].number"
              label="赠送数量"
              hide-details
            />
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-divider class="border-opacity-75 my-3" color="success" />
    <div flex flex-gap-2 justify-end>
      <v-btn>
        重置
      </v-btn>
      <v-btn color="blue">
        保 存
      </v-btn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scrollbar-container {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
