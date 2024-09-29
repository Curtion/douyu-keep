<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useFans } from '~/stores'
import type { Config, sendConfig } from '~/stores/fans'

const fans = useFans()
const { fansList } = storeToRefs(fans)

const defaultConfig: Config = {
  boot: false,
  close: false,
  type: '自动执行',
  time: '跟随执行模式',
  timeValue: [],
  cron: '',
  model: 1,
  send: fansList.value.reduce((prev, curr) => {
    prev[curr.roomId] = {
      percentage: 0,
      number: 0,
      giftId: 268,
      roomId: curr.roomId,
    }
    return prev
  }, {} as sendConfig),
}
const config = ref<Config>(defaultConfig)

const warn = reactive({
  show: false,
  timeout: 3000,
  text: '',
  color: 'error',
})

const cronNext = ref<Date[]>([])
watch(() => config.value.cron, async (val) => {
  try {
    cronNext.value = await window.electron.ipcRenderer.invoke('cron', val) as Date[]
  } catch (error) {
    cronNext.value = []
  }
})

async function handleConfigReset() {
  init()
}

async function handleConfigSave() {
  try {
    await validCron()
  } catch (error: any) {
    warn.show = true
    warn.color = 'error'
    warn.text = error.toString()
    return
  }
  try {
    await validNumber()
  } catch (error: any) {
    warn.show = true
    warn.color = 'error'
    warn.text = error.toString()
    return
  }
  try {
    await validPercentage()
  } catch (error: any) {
    warn.show = true
    warn.color = 'error'
    warn.text = error.toString()
    return
  }
  try {
    await window.electron.ipcRenderer.invoke('boot', config.value.boot)
  } catch (error) {
    warn.show = true
    warn.text = `开机自启设置失败${error}`
    warn.color = 'error'
    return
  }
  if (config.value.type === '定时执行') {
    try {
      await window.electron.ipcRenderer.invoke('timer', { cron: config.value.cron, stop: false })
    } catch (error) {
      warn.show = true
      warn.text = `定时执行设置失败${error}`
      warn.color = 'error'
      return
    }
  } else {
    try {
      await window.electron.ipcRenderer.invoke('timer', { cron: '', stop: true })
    } catch (error) {
      warn.show = true
      warn.text = `定时执行设置失败${error}`
      warn.color = 'error'
      return
    }
  }
  await window.electron.ipcRenderer.invoke('db', {
    type: 'set',
    key: 'config',
    value: JSON.stringify(config.value),
  })
  warn.show = true
  warn.text = '保存成功'
  warn.color = 'success'
}

// 校验cron表达式
async function validCron() {
  if (config.value.type === '定时执行') {
    if (config.value.cron === '') {
      return Promise.reject(new Error('cron表达式不能为空'))
    }
    return await window.electron.ipcRenderer.invoke('cron', config.value.cron)
  }
}

// 校验荧光棒数量
async function validNumber() {
  if (config.value.model === 2) {
    const status = Object.values(config.value.send).find((item) => {
      return item.number < -1 || Number.isNaN(Number(item.number))
    })
    if (status) {
      return Promise.reject(new Error(`荧光棒数量[${status.number}]填写不正确`))
    }
    if (Object.values(config.value.send).filter(item => item.number === -1).length > 1) {
      return Promise.reject(new Error('荧光棒数量只能有一个-1'))
    }
  }
  return Promise.resolve()
}

// 校验荧光棒百分比
async function validPercentage() {
  if (config.value.model === 1) {
    const status = Object.values(config.value.send).find((item) => {
      return item.percentage < 0 || item.percentage > 100 || Number.isNaN(Number(item.percentage))
    })
    if (status) {
      return Promise.reject(new Error(`荧光棒百分比[${status.percentage}]填写不正确`))
    }
    if (Object.values(config.value.send).reduce((prev, curr) => {
      return prev + curr.percentage
    }, 0) !== 100) {
      return Promise.reject(new Error('荧光棒百分比之和必须等于100'))
    }
  }
  return Promise.resolve()
}

async function init() {
  const cfg = await window.electron.ipcRenderer.invoke('db', {
    type: 'get',
    key: 'config',
  })
  if (cfg !== undefined) {
    const jsonCfg: Config = JSON.parse(cfg)
    const send: sendConfig = {}
    // 合并配置
    for (const item of fansList.value) {
      if (item.roomId in jsonCfg.send) {
        send[item.roomId] = jsonCfg.send[item.roomId]
      } else {
        send[item.roomId] = {
          percentage: 0,
          number: 0,
          giftId: 268,
          roomId: item.roomId,
        }
      }
    }
    config.value = {
      ...jsonCfg,
      send,
    }
  }
}
init()
</script>

<template>
  <div class="scrollbar-container p-2">
    <v-row>
      <v-col cols="6">
        <div flex items-center>
          <label for="boot">开机自启</label>
          <v-checkbox
            id="boot"
            v-model="config.boot"
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
            v-model="config.close"
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
        v-model:model-value="config.type"
        label="执行模式"
        :items="['自动执行', '定时执行', '手动执行']"
        variant="outlined"
        hide-details
      />
      <v-tooltip text="自动执行:软件启动时自动执行。定时执行:满足定时条件执行。手动执行: 需要手动点击执行。">
        <template #activator="{ props }">
          <div v-bind="props" class="i-carbon-help" />
        </template>
      </v-tooltip>
    </div>
    <v-text-field
      v-if="config.type === '定时执行'"
      v-model:model-value="config.cron"
      clearable
      label="请输入cron表达式"
      hide-details
    />
    <v-card
      v-if="config.type === '定时执行' && config.cron"
      subtitle="最近3次执行时间"
      variant="tonal"
      my-3
    >
      <template #text>
        <div v-for="item in cronNext" :key="item.toString()">
          {{ dayjs(item).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
      </template>
    </v-card>
    <span v-if="config.type === '定时执行'">
      <div>在线生成表达式: https://cron.qqe2.com</div>
      <div opacity-60 text-sm>(你不应该使用?号表达式, 尝试修改?为*)</div>
    </span>
    <v-divider class="border-opacity-75 my-3" color="success" />
    <div flex items-center flex-gap-2 mb-3>
      <v-select
        v-model:model-value="config.time"
        label="赠送时机"
        :items="['跟随执行模式', '自定义']"
        variant="outlined"
        hide-details
      />
      <v-tooltip text="跟随执行模式:每次执行任务时会进行赠送。自定义:任务执行时仅领取不赠送,会在满足自定义条件下再进行赠送。">
        <template #activator="{ props }">
          <div v-bind="props" class="i-carbon-help" />
        </template>
      </v-tooltip>
    </div>
    <div
      v-if="config.time === '自定义'"
      flex items-center flex-gap-2 mb-3
    >
      <v-select
        v-model:model-value="config.timeValue"
        label="自定义赠送时机"
        :items="[
          { title: '星期一', value: 1 },
          { title: '星期二', value: 2 },
          { title: '星期三', value: 3 },
          { title: '星期四', value: 4 },
          { title: '星期五', value: 5 },
          { title: '星期六', value: 6 },
          { title: '星期日', value: 0 },
        ]"
        multiple
        variant="outlined"
        hide-details
      />
      <v-tooltip text="选择星期">
        <template #activator="{ props }">
          <div v-bind="props" class="i-carbon-help" />
        </template>
      </v-tooltip>
    </div>
    <v-divider class="border-opacity-75 my-3" color="success" />
    <v-radio-group
      v-model="config.model"
      label="荧光棒分配逻辑"
      inline
      hide-details
      items-center
    >
      <v-radio label="百分比" :value="1" />
      <v-radio label="指定数量" :value="2" />
      <v-tooltip text="指定数量时填写-1表示剩余总数">
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
            赠送数量({{ config.model === 1 ? '%' : '个' }})
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
              v-if="config.model === 1"
              v-model.number="config.send[item.roomId].percentage"
              label="赠送数量"
              hide-details
            />
            <v-text-field
              v-if="config.model === 2"
              v-model.number="config.send[item.roomId].number"
              label="赠送数量"
              hide-details
            />
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-divider class="border-opacity-75 my-3" color="success" />
    <div flex flex-gap-2 justify-end>
      <v-btn @click="handleConfigReset">
        重置
      </v-btn>
      <v-btn color="blue" @click="handleConfigSave">
        保 存
      </v-btn>
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
  </div>
</template>

<style scoped lang="scss">
.scrollbar-container {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
