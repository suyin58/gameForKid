<template>
  <view>
    <router-view />
  </view>
</template>

<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  // 应用启动时的初始化
})

onShow(() => {
  console.log('App Show')
  // 应用从后台进入前台显示
})

onHide(() => {
  console.log('App Hide')
  // 应用从前台进入后台
})
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>
