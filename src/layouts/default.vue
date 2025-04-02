<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import type { ConfigProviderThemeVars } from 'wot-design-uni'
import { useAppStore } from '@/store'

const toast = useToast()
const appStore = useAppStore()
const props = withDefaults(
  defineProps<{
    navbarConfig?: any
    /** navbar是否透明背景 */
    transparentNavbar?: boolean
    /** 是否使用左侧区域默认点击事件 */
    defaultClickLeft?: boolean
  }>(),
  {
    transparentNavbar: true,
    defaultClickLeft: false,
  },
)
const emits = defineEmits<{
  (e: 'click-left'): void
}>()

/** 页面是否在顶部,滚动条高度为0 */
const isTop = ref(true)
/** 最后一次滚动的top值 */
const lastScrollTop = ref(0)
const pages = getCurrentPages()

const themeVars = computed((): ConfigProviderThemeVars => {
  return appStore.isDark ? {} : {}
})

const customStyle = computed(() => {
  const bgColor = appStore.isDark ? '#000' : '#fff'
  const bg = isTop.value && props.transparentNavbar ? 'transparent' : bgColor
  return `background-color: ${bg}`
})

/** overlay 动态样式 */
const overlayCustomStyle = computed(() => {
  const bgColor = appStore.isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255,255,255, 0.2)'
  return `background-color: ${bgColor}`
})

/** 列表滚动 */
const handleScroll = (e: any) => {
  const currentScrollTop = e.detail.scrollTop
  if (currentScrollTop < lastScrollTop.value && isTop.value) {
    // 当往上滑的时候，isTop为true，说明已经到顶部
  } else {
    isTop.value = e.detail.scrollTop === 0
  }
  lastScrollTop.value = e.detail.scrollTop
}

/** 滚动到顶部 */
const scrollToUpper = () => {
  nextTick(() => {
    isTop.value = true
  })
}

/** 点击navbar左侧按钮 */
const navBarClickLeft = () => {
  if (props.defaultClickLeft) {
    if (pages.length > 1) {
      uni.navigateBack()
    } else {
      uni.redirectTo({
        url: '/pages/index/index',
      })
    }
  } else {
    emits('click-left')
  }
}

onShow(() => {
  // 更新导航栏颜色
  const timer = setTimeout(() => {
    appStore.setNavbarTheme()
    clearTimeout(timer)
  }, 0)
})

defineExpose({
  toast,
})
</script>

<template>
  <wd-config-provider fixed :themeVars="themeVars" :theme="appStore.theme">
    <scroll-view
      class="default-layout"
      :scroll-y="true"
      :show-scrollbar="false"
      @scroll="handleScroll"
      @scrolltoupper="scrollToUpper"
    >
      <wd-navbar
        safeAreaInsetTop
        fixed
        placeholder
        :customStyle="customStyle"
        :bordered="false"
        v-bind="navbarConfig"
        @click-left="navBarClickLeft"
      >
        <!-- 左侧插槽 -->
        <template v-if="$slots.navbarLeft" #left>
          <slot name="navbarLeft"></slot>
        </template>
        <template v-else-if="defaultClickLeft" #left>
          <wd-icon :name="pages.length > 1 ? 'arrow-left' : 'home'" size="44rpx"></wd-icon>
        </template>
        <template v-else #left>
          <image class="logo" src="@/static/logo.png" />
        </template>

        <!-- 中间插槽 -->
        <template v-if="$slots.navbarTitle" #title>
          <slot name="navbarTitle"></slot>
        </template>

        <!-- 右侧内容 -->
        <template v-if="$slots.navbarRight" #right>
          <slot name="navbarRight"></slot>
        </template>
      </wd-navbar>
      <slot />
    </scroll-view>
    <wd-toast />

    <!-- 全局loading -->
    <wd-overlay
      lockScroll
      :show="appStore.loading"
      :z-index="999"
      :customStyle="overlayCustomStyle"
    >
      <view class="loading-wrapper">
        <wd-loading color="#2aae67" size="80rpx" />
      </view>
    </wd-overlay>
  </wd-config-provider>
</template>

<style lang="scss" scoped>
.default-layout {
  width: 100%;
  height: 100vh;

  .logo {
    flex-shrink: 0;
    width: 52rpx;
    height: 52rpx;
  }

  &:deep(::-webkit-scrollbar) {
    display: block;
    width: 0 !important;
    height: 0 !important;
    overflow: auto !important;
    -webkit-appearance: auto !important;
    background: transparent;
  }
}

.loading-wrapper {
  @apply wh-full flex-center;
}
</style>
