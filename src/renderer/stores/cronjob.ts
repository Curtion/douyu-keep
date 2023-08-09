import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCronStatus = defineStore('cronStatus', () => {
  const isCronRuning = ref(false)
  return {
    isCronRuning,
  }
})
