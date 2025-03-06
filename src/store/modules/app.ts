import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore(
  'AppStore',
  () => {
    const theme = ref<'light' | 'dark'>('light')
    /** 全局loading 状态 */
    const loading = ref(false)

    /**  是否黑夜模式 */
    const isDark = computed(() => theme.value === 'dark')

    /** 切换loading状态 */
    const toggleLoading = (status?: boolean) => {
      loading.value = status ?? !loading.value
    }

    /** 切换主题 */
    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
      setNavbarTheme()
    }

    const setNavbarTheme = () => {
      // 设置页面导航条颜色
      const config = isDark.value
        ? {
            frontColor: '#ffffff',
            backgroundColor: '#000000',
          }
        : {
            frontColor: '#000000',
            backgroundColor: '#ffffff',
          }

      uni.setNavigationBarColor({
        ...config,
        animation: {
          duration: 0,
          timingFunc: 'easeIn',
        },
      })
    }

    return {
      theme,
      isDark,
      loading,
      toggleTheme,
      setNavbarTheme,
      toggleLoading,
    }
  },
  {
    persist: true,
  },
)
