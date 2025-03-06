import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCacheStore = defineStore(
  'CacheStore',
  () => {
    const textCache = ref()

    return {
      textCache,
    }
  },
  {
    persist: true,
  },
)
