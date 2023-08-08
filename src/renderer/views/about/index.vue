<script setup lang="ts">
import alipay from '~/assets/alipay.jpg'
</script>

<template>
  <div p-3 class="scrollbar-container">
    <div opacity-70>
      GitHub: https://github.com/Curtion/douyu-keep
    </div>
    <div opacity-70>
      作者: Curtion
    </div>
    <div opacity-70>
      赞助: 如果您觉得本软件对您有帮助，可以通过以下方式进行赞助.
    </div>
    <div w-full opacity-100>
      <img :src="alipay" alt="支付宝" width="300">
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
