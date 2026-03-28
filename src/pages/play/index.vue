<template>
  <view class="play-page">
    <!-- 头部 -->
    <view class="play-header gradient-bg gradient-primary">
      <view class="play-header-left flex">
        <view class="back-btn" @tap="goBack">
          <text>←</text>
        </view>
        <view class="play-title text-ellipsis">{{ gameTitle }}</view>
      </view>
      <view class="play-header-right">
        <view class="share-btn" @tap="shareGame" v-if="showShareBtn">
          <text>📤</text>
        </view>
      </view>
    </view>

    <!-- 游戏操作区（我的游戏） -->
    <view class="game-actions" v-if="isMyGame">
      <view class="actions-inline flex">
        <button class="action-btn action-btn-primary flex-1" @tap="editGame">
          <text>✏️ 修改游戏</text>
        </button>
        <button class="action-btn action-btn-success flex-1" @tap="togglePublish">
          <text>{{ game.isPublic ? '🔒 设为私密' : '🌍 发布到广场' }}</text>
        </button>
      </view>
    </view>

    <!-- 游戏容器 -->
    <view class="game-container flex-center flex-column">
      <!-- 实际游戏会渲染在这里 -->
      <web-view v-if="gameUrl" :src="gameUrl" class="game-webview"></web-view>
      <view v-else class="game-placeholder">
        <text class="placeholder-icon">🎮</text>
        <text class="placeholder-text">游戏加载中...</text>
        <text class="placeholder-hint">（实际会显示HTML5游戏）</text>
      </view>
    </view>

    <!-- 底部信息栏 -->
    <view class="play-footer">
      <view class="game-info-detail flex-1">
        <text class="info-title text-ellipsis">{{ gameTitle }}</text>
        <view class="info-meta">
          <text class="info-author">{{ isMyGame ? '👤 我的作品' : `👤 ${gameAuthor}的作品` }}</text>
          <text class="info-stats">❤️ {{ likeCount }}  🎮 {{ playCount }}</text>
        </view>
      </view>

      <!-- 底部操作按钮（别人的游戏） -->
      <view class="footer-actions" v-if="!isMyGame">
        <view
          class="footer-btn like-btn"
          :class="{ 'liked': isLiked }"
          @tap="toggleLike"
        >
          <text>{{ isLiked ? '❤️ 已赞' : '🤍 点赞' }}</text>
        </view>
        <view class="footer-btn clone-btn" @tap="cloneGame">
          <text>📋 复制游戏</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 游戏信息
const gameId = ref(null)
const gameTitle = ref('游戏标题')
const gameAuthor = ref('我')
const gameUrl = ref('')
const isMyGame = ref(false)
const isPublic = ref(false)
const isLiked = ref(false)
const likeCount = ref(0)
const playCount = ref(0)

// 计算属性
const showShareBtn = computed(() => {
  return !isMyGame.value || isPublic.value
})

const game = computed(() => ({
  isPublic: isPublic.value
}))

// 页面加载
onLoad((options) => {
  if (options.id) {
    gameId.value = options.id
    loadGameData(options.id)
  }

  if (options.title) {
    gameTitle.value = options.title
  }

  if (options.author) {
    gameAuthor.value = options.author
    isMyGame.value = false
  } else {
    isMyGame.value = true
  }

  if (options.preview) {
    // 预览模式
    gameUrl.value = '' // 实际会是生成的游戏 URL
  }
})

// 加载游戏数据
const loadGameData = (id) => {
  // 模拟游戏数据
  const games = {
    1: { title: '超级跳跃游戏', author: '我', isPublic: true, likeCount: 15, playCount: 67 },
    2: { title: '猜数字游戏', author: '我', isPublic: false, likeCount: 8, playCount: 23 },
    3: { title: '跑酷小游戏', author: '我', isPublic: false, likeCount: 5, playCount: 12 },
    4: { title: '接水果游戏', author: '小红', isPublic: true, likeCount: 15, playCount: 67 },
    5: { title: '记忆力测试', author: '小红', isPublic: true, likeCount: 6, playCount: 18 },
    6: { title: '跑酷挑战', author: '小刚', isPublic: true, likeCount: 20, playCount: 89 }
  }

  const gameData = games[id]
  if (gameData) {
    gameTitle.value = gameData.title
    gameAuthor.value = gameData.author
    isPublic.value = gameData.isPublic
    likeCount.value = gameData.likeCount
    playCount.value = gameData.playCount
    isMyGame.value = gameData.author === '我'
  }
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 编辑游戏
const editGame = () => {
  uni.redirectTo({
    url: `/pages/create/index?id=${gameId.value}`
  })
}

// 发布/私密
const togglePublish = () => {
  const action = isPublic.value ? '设为私密' : '发布到广场'
  uni.showModal({
    title: `${action}游戏`,
    content: `确定要${action}吗？`,
    success: (res) => {
      if (res.confirm) {
        isPublic.value = !isPublic.value
        uni.showToast({
          title: `${action}成功！`,
          icon: 'success'
        })
      }
    }
  })
}

// 点赞
const toggleLike = () => {
  isLiked.value = !isLiked.value
  if (isLiked.value) {
    likeCount.value++
    uni.showToast({ title: '点赞成功！', icon: 'success' })
  } else {
    likeCount.value--
  }
}

// 复制游戏
const cloneGame = () => {
  uni.showModal({
    title: '复制游戏',
    content: '确定要复制这个游戏吗？复制后可以修改和重新发布',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '游戏已复制到"我的作品"！',
          icon: 'success'
        })
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      }
    }
  })
}

// 分享
const shareGame = () => {
  uni.showShareMenu({
    withShareTicket: true
  })
}
</script>

<style lang="scss" scoped>
.play-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $white;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.play-header {
  padding: 24rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: $white;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.play-header-left {
  flex: 1;
  align-items: center;
  gap: 20rpx;
  min-width: 0;
}

.back-btn {
  font-size: 56rpx;
  padding: 16rpx;
  min-width: 88rpx;
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.play-title {
  font-size: 36rpx;
  font-weight: bold;
  flex: 1;
}

.play-header-right {
  display: flex;
  gap: 16rpx;
}

.share-btn {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

/* 游戏操作区 */
.game-actions {
  background: $bg-color;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid $border-color;
}

.actions-inline {
  gap: 16rpx;
  flex-wrap: wrap;
}

.action-btn {
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 500;
  border: none;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn-primary {
  background: rgba(255, 255, 255, 0.95);
  color: $primary-color;
  font-weight: 600;
}

.action-btn-success {
  background: $success-color;
  color: $white;
}

/* 游戏容器 */
.game-container {
  flex: 1;
  background: $bg-color;
  position: relative;
}

.game-webview {
  width: 100%;
  height: 100%;
}

.game-placeholder {
  text-align: center;
  padding: 80rpx 40rpx;
}

.placeholder-icon {
  display: block;
  font-size: 160rpx;
  margin-bottom: 40rpx;
}

.placeholder-text {
  display: block;
  font-size: 32rpx;
  color: $text-secondary;
  margin-bottom: 20rpx;
}

.placeholder-hint {
  display: block;
  font-size: 24rpx;
  color: $text-hint;
}

/* 底部信息栏 */
.play-footer {
  background: $white;
  border-top: 1rpx solid $border-color;
  padding: 24rpx 30rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.game-info-detail {
  min-width: 0;
}

.info-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: 10rpx;
}

.info-meta {
  display: flex;
  gap: 30rpx;
  font-size: 24rpx;
  color: $text-hint;
  flex-wrap: wrap;
}

.footer-actions {
  display: flex;
  gap: 16rpx;
  flex-shrink: 0;
}

.footer-btn {
  padding: 20rpx 32rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: 500;
  flex-shrink: 0;
}

.like-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: $white;

  &.liked {
    background: #ff6b6b;
  }
}

.clone-btn {
  background: linear-gradient(135deg, $success-color 0%, #38ef7d 100%);
  color: $white;
}
</style>
