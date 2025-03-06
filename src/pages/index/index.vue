<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  layout: false,
  style: {
    navigationStyle: 'custom',
  },
}
</route>
<script lang="ts" setup>
import useShare from '@/hooks/useShare'
const { onShareAppMessage, onShareTimeline } = useShare()

const navbarConfig = {
  customStyle: 'background-color: transparent !important;',
}

onLoad((options) => {
  console.log('首页参数', options)
})

onShow(() => {})

onHide(() => {})

onUnmounted(() => {})

/** 点击navbar左侧按钮 */
const navbarClickLeft = () => {
  uni.navigateTo({
    url: '/pages-sub/pages/index/index',
  })
}
</script>
<template>
  <uni-layout name="default" :navbarConfig="navbarConfig" @clickLeft="navbarClickLeft">
    <template #navbarLeft>
      <wd-icon name="format-vertical-align-left" size="44rpx"></wd-icon>
    </template>

    <view class="home-page">首页</view>
  </uni-layout>
</template>

<style scoped lang="scss">
.home-page {
  @apply w-full relative;
  padding: 0 var(--base-page-padding);

  :deep(.back-button) {
    width: 100%;
    margin-top: 160rpx;
  }
}
</style>
