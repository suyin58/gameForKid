<template>
  <view class="page">
    <view class="page-content">
      <view class="form-section">
        <text class="form-section__title">描述你想做的游戏</text>

        <voice-input
          v-model="gameDescription"
          :show-examples="true"
          @input="handleDescriptionInput"
        />
      </view>

      <view class="action-section">
        <button
          class="btn btn-primary btn-lg btn-block"
          :disabled="!canGenerate"
          @tap="handleGenerate"
        >
          🎮 生成游戏
        </button>
      </view>

      <!-- 生成动画 -->
      <view v-if="generating" class="generating-overlay">
        <loading-animation text="AI正在为你创作游戏..." />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore, useUserStore } from '@/store'
import { useAppStore } from '@/store/modules/app'
import { aiApi } from '@/services'
import { validators } from '@/utils'

const gameStore = useGameStore()
const userStore = useUserStore()
const appStore = useAppStore()

const gameDescription = ref('')
const generating = ref(false)

const canGenerate = computed(() => {
  const result = validators.gameDescription(gameDescription.value)
  return result.valid
})

const handleDescriptionInput = (value) => {
  gameDescription.value = value
}

const handleGenerate = async () => {
  if (!canGenerate.value) {
    appStore.showToast('请描述你想做的游戏')
    return
  }

  try {
    generating.value = true

    // 调用AI生成API
    const res = await aiApi.generateGame({
      description: gameDescription.value
    })

    if (res.code === 0 && res.data) {
      // 保存生成的游戏
      const game = await gameStore.createGame({
        description: gameDescription.value,
        code: res.data.code,
        title: res.data.title || '我的游戏',
        type: res.data.type || 'casual'
      })

      if (game) {
        appStore.showToast('生成成功！')

        // 跳转到试玩页
        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/play/index?id=${game._id}`
          })
        }, 500)
      }
    } else {
      appStore.showToast(res.message || '生成失败')
    }
  } catch (error) {
    console.error('生成游戏失败:', error)
    appStore.showToast('生成失败，请重试')
  } finally {
    generating.value = false
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--bg-color);
}

.page-content {
  padding: var(--spacing-md);
}

.form-section {
  margin-bottom: var(--spacing-lg);
}

.form-section__title {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.action-section {
  margin-top: var(--spacing-xl);
}

.generating-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.btn:disabled {
  opacity: 0.5;
}
</style>
