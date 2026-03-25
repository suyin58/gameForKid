<template>
  <view class="loading-animation">
    <view class="loading-animation__spinner">
      <view
        v-for="index in 8"
        :key="index"
        class="loading-animation__dot"
        :style="{ animationDelay: `${index * 0.1}s` }"
      ></view>
    </view>
    <text v-if="text" class="loading-animation__text">{{ text }}</text>
  </view>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  text: {
    type: String,
    default: '加载中...'
  }
})
</script>

<style lang="scss" scoped>
.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.loading-animation__spinner {
  position: relative;
  width: 120rpx;
  height: 120rpx;
}

.loading-animation__dot {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  background: var(--primary-color);
  border-radius: 50%;
  animation: dot-spin 1.6s infinite ease-in-out;

  $count: 8;
  $angle: 360deg / $count;

  @for $i from 1 through $count {
    &:nth-child(#{$i}) {
      $rotation: $angle * ($i - 1);
      transform: rotate($rotation) translateX(60rpx) rotate(-$rotation);
    }
  }
}

@keyframes dot-spin {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.loading-animation__text {
  margin-top: var(--spacing-md);
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}
</style>
