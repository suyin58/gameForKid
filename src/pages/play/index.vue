<template>
  <view class="page">
    <!-- 游戏容器 -->
    <view class="game-container">
      <game-webview
        v-if="currentGame && currentGame.code"
        :game-code="currentGame.code"
        @message="handleGameMessage"
        @error="handleGameError"
      />
    </view>

    <!-- 操作面板 -->
    <view class="action-panel">
      <view class="game-info">
        <text class="game-info__title">{{ currentGame?.title }}</text>
        <text class="game-info__time">{{ formatTime(currentGame?.createdAt) }}</text>
      </view>

      <!-- 自己的游戏 -->
      <view v-if="isMyGame" class="action-buttons">
        <button class="btn btn-secondary" @tap="handleRegenerate">
          🔄 重新生成
        </button>
        <button class="btn btn-primary" @tap="handleSave">
          💾 保存
        </button>
      </view>

      <!-- 发布按钮（私有游戏） -->
      <button
        v-if="isMyGame && currentGame?.visibility === 'private'"
        class="btn btn-outline btn-block"
        @tap="handlePublish"
      >
        🌐 发布到广场
      </button>

      <!-- 广场的游戏 -->
      <view v-if="!isMyGame" class="action-buttons">
        <button class="btn btn-secondary" @tap="handleLike">
          ❤️ 点赞({{ currentGame?.likeCount || 0 }})
        </button>
        <button class="btn btn-primary" @tap="handleClone">
          📋 克隆到我的作品
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore, useUserStore } from '@/store'
import { useAppStore } from '@/store/modules/app'
import { formatTime } from '@/utils'

const gameStore = useGameStore()
const userStore = useUserStore()
const appStore = useAppStore()

const gameId = ref('')
const currentGame = computed(() => gameStore.currentGame)
const isMyGame = computed(() => {
  return currentGame.value?.userId === userStore.userInfo?.id
})

onMounted(async () => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  gameId.value = options.id

  if (gameId.value) {
    await loadGame()
  }
})

const loadGame = async () => {
  try {
    appStore.showLoading('加载中...')
    await gameStore.fetchGameDetail(gameId.value)
  } catch (error) {
    appStore.showToast('游戏加载失败')
  } finally {
    appStore.hideLoading()
  }
}

const handleGameMessage = (e) => {
  console.log('Game message:', e)
}

const handleGameError = (e) => {
  console.error('Game error:', e)
  appStore.showToast('游戏运行出错')
}

const handleRegenerate = () => {
  uni.navigateBack()
}

const handleSave = async () => {
  try {
    appStore.showLoading('保存中...')
    await gameStore.updateGame(gameId.value, {
      visibility: 'private'
    })
    appStore.showToast('保存成功')
  } catch (error) {
    appStore.showToast('保存失败')
  } finally {
    appStore.hideLoading()
  }
}

const handlePublish = () => {
  uni.navigateTo({
    url: `/pages/publish/index?id=${gameId.value}`
  })
}

const handleLike = async () => {
  try {
    const newGame = await gameStore.updateGame(gameId.value, {
      likeCount: (currentGame.value.likeCount || 0) + 1
    })
    if (newGame) {
      appStore.showToast('点赞成功！')
    }
  } catch (error) {
    appStore.showToast('点赞失败')
  }
}

const handleClone = async () => {
  try {
    appStore.showLoading('克隆中...')
    const clonedGame = await gameStore.cloneGame(gameId.value)
    if (clonedGame) {
      appStore.showToast('已克隆到我的作品')
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1000)
    }
  } catch (error) {
    appStore.showToast('克隆失败')
  } finally {
    appStore.hideLoading()
  }
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.game-container {
  flex: 1;
  overflow: hidden;
}

.action-panel {
  background: var(--white);
  padding: var(--spacing-md);
  border-top: 1rpx solid var(--border-color);
}

.game-info {
  margin-bottom: var(--spacing-md);
}

.game-info__title {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.game-info__time {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}
</style>
