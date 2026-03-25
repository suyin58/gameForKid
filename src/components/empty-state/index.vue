<template>
  <view class="empty-state">
    <view class="empty-state__icon">
      <text class="empty-state__emoji">{{ icon }}</text>
    </view>
    <text class="empty-state__text">{{ text }}</text>
    <view v-if="buttonText" class="empty-state__action">
      <button class="btn btn-primary" @tap="handleAction">
        {{ buttonText }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: '📭'
  },
  text: {
    type: String,
    default: '暂无数据'
  },
  buttonText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['action'])

const handleAction = () => {
  emit('action')
}
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-md);
  min-height: 600rpx;
}

.empty-state__icon {
  margin-bottom: var(--spacing-md);
}

.empty-state__emoji {
  font-size: 160rpx;
  opacity: 0.6;
}

.empty-state__text {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.empty-state__action {
  margin-top: var(--spacing-sm);
}
</style>
