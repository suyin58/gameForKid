<template>
  <view class="page">
    <!-- 顶部信息栏 -->
    <view class="header-section">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="game-info">
        <text class="game-title">{{ gameTitle }}</text>
        <view class="game-stats">
          <text class="stat-item">
            <text class="stat-icon">❤️</text>
            {{ likeCount }}
          </text>
          <text class="stat-item">
            <text class="stat-icon">🎮</text>
            {{ playCount }}
          </text>
        </view>
      </view>
    </view>

    <!-- 游戏容器 -->
    <view class="game-container">
      <web-view v-if="gameUrl" :src="gameUrl" class="game-webview"></web-view>

      <!-- 加载状态 -->
      <view v-else class="game-placeholder">
        <view class="loading-spinner"></view>
        <text class="loading-text">游戏加载中...</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <button class="bottom-btn like" @click="toggleLike">
        <text class="btn-icon">{{ isLiked ? '❤️' : '🤍' }}</text>
        <text class="btn-text">{{ isLiked ? '已点赞' : '点赞' }}</text>
      </button>
      <button class="bottom-btn share" @click="shareGame">
        <text class="btn-icon">📤</text>
        <text class="btn-text">分享</text>
      </button>
      <button class="bottom-btn clone" @click="cloneGame">
        <text class="btn-icon">📋</text>
        <text class="btn-text">克隆</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad } from '@dcloudio/uni-app'

// 页面参数
const gameId = ref('')
const gameTitle = ref('游戏试玩')
const isPreview = ref(false)

// 游戏数据
const gameUrl = ref('')
const likeCount = ref(0)
const playCount = ref(0)
const isLiked = ref(false)

// 页面加载
onLoad((options) => {
  if (options.id) {
    gameId.value = options.id
  }
  if (options.title) {
    gameTitle.value = options.title
  }
  if (options.preview) {
    isPreview.value = true
  }

  // 加载游戏数据（Mock）
  loadGameData()
})

// 加载游戏数据
const loadGameData = () => {
  // TODO: 从 Mock 数据或 API 获取游戏信息
  // 这里使用模拟数据
  setTimeout(() => {
    likeCount.value = Math.floor(Math.random() * 100) + 10
    playCount.value = Math.floor(Math.random() * 500) + 50
    isLiked.value = false

    // 如果是预览模式，使用本地 HTML
    if (isPreview.value) {
      gameUrl.value = '/static/demo-game.html'
    } else {
      gameUrl.value = '/static/demo-game.html'
    }
  }, 500)
}

// 返回上一页
const goBack = () => {
  if (isPreview.value) {
    uni.navigateBack()
  } else {
    uni.switchTab({
      url: '/pages/plaza/index'
    })
  }
}

// 点赞/取消点赞
const toggleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1

  uni.showToast({
    title: isLiked.value ? '已点赞' : '已取消点赞',
    icon: 'none'
  })
}

// 分享游戏
const shareGame = () => {
  uni.showShareMenu({
    withShareTicket: true
  })
}

// 克隆游戏
const cloneGame = () => {
  uni.showModal({
    title: '克隆游戏',
    content: '将此游戏克隆到你的作品？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '克隆中...' })
        setTimeout(() => {
          uni.hideLoading()
          uni.showToast({
            title: '克隆成功！',
            icon: 'success'
          })
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        }, 1000)
      }
    }
  })
}

// 查看作者信息
const viewAuthor = () => {
  uni.showToast({
    title: '作者信息功能开发中',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-section {
  background: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #333;
}

.game-info {
  flex: 1;
}

.game-title {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.game-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.stat-icon {
  font-size: 14px;
}

.game-container {
  flex: 1;
  background: white;
  margin: 15px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.game-webview {
  width: 100%;
  height: 100%;
}

.game-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #FF6B6B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: #999;
}

.bottom-bar {
  background: white;
  padding: 15px 20px;
  display: flex;
  gap: 10px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.bottom-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  color: white;
  transition: transform 0.2s;
}

.bottom-btn:active {
  transform: scale(0.95);
}

.bottom-btn.like {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.bottom-btn.like.liked {
  background: #ff6b6b;
}

.bottom-btn.share {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.bottom-btn.clone {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.btn-icon {
  font-size: 20px;
}

.btn-text {
  font-size: 12px;
}
</style>
