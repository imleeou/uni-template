<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5">
{
  layout: false,
  style: {
    navigationStyle: 'custom',
  },
}
</route>
<script lang="ts" setup>
import useShare from '@/hooks/useShare'
import { useAppStore } from '@/store'

const { onShareAppMessage } = useShare()
const appStore = useAppStore()

const navbarConfig = {
  customStyle: 'background-color: transparent !important;',
}
const init = async () => {
  appStore.toggleLoading(true)
  try {
    console.log('子包init')
  } catch (error) {
    console.log('init error', error)
  } finally {
    appStore.toggleLoading(false)
  }
}
init()
</script>
<template>
  <uni-layout defaultClickLeft name="default" :navbarConfig="navbarConfig">
    <template #navbarLeft>
      <wd-icon name="arrow-left" size="44rpx"></wd-icon>
    </template>
    <view class="page">子包</view>
  </uni-layout>
</template>

<style scoped lang="scss"></style>
