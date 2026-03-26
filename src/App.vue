<template>
  <view class="app">
    <view class="app-container">
      <!-- 页面内容 -->
    </view>
  </view>
</template>

<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/* 全局样式将在 styles/global.scss 中定义 */
@import '@/styles/global.scss';
</style>
