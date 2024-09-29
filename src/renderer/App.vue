<script setup lang="ts">
import { getConfig } from './run/utils'

async function init() {
  // 迁移time配置
  const config = await getConfig()
  if (!config.time) {
    config.time = '跟随执行模式'
    await window.electron.ipcRenderer.invoke('db', {
      type: 'set',
      key: 'config',
      value: JSON.stringify(config),
    })
  }

  if (!config.timeValue) {
    config.timeValue = []
    await window.electron.ipcRenderer.invoke('db', {
      type: 'set',
      key: 'config',
      value: JSON.stringify(config),
    })
  }
}
init()
</script>

<template>
  <router-view />
</template>
