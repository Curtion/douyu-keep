<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const menus = [
  {
    name: '首页',
    path: '/jobs',
    icon: 'i-carbon-home',
  },
  {
    name: '配置',
    path: '/config',
    icon: 'i-carbon-settings',
  },
  {
    name: '关于我',
    path: '/about',
    icon: 'i-carbon-user',
  },
]
</script>

<template>
  <div class="flex h-full">
    <nav class="h-full b-r-1 border-gray-300 p-4 flex flex-col">
      <router-link
        v-for="menu in menus"
        :key="menu.path"
        :to="menu.path"
        class="my-2 hover:text-blue-500 flex items-center"
        :class="{ 'text-blue-500': route.path === menu.path }"
      >
        <div class="mr-1" :class="menu.icon" />
        {{ menu.name }}
      </router-link>
    </nav>
    <div class="flex-1 h-full">
      <router-view />
    </div>
  </div>
</template>
