<template>
  <view class="page">
    <!-- 头部 -->
    <view class="header gradient-bg gradient-danger">
      <view class="header-content">
        <text class="header-title">🎮 儿童AI游戏创作平台</text>
        <text class="header-subtitle">6-14岁孩子的AI游戏创作工具</text>
      </view>
    </view>

    <!-- 创建按钮 -->
    <view class="create-section">
      <button class="create-btn btn btn-primary" @tap="goToCreate">
        ✨ 创建新游戏
      </button>
    </view>

    <!-- 游戏列表 -->
    <view class="game-list">
      <view
        class="game-card"
        v-for="game in gameList"
        :key="game.id"
        @tap="playGame(game)"
        hover-class="game-card-hover"
      >
        <!-- 游戏缩略图 -->
        <view class="game-thumbnail" :style="{ background: game.thumbnailBg }">
          <text class="game-icon">{{ game.thumbnail }}</text>
          <view class="play-overlay">
            <view class="play-button">▶️</view>
          </view>
        </view>

        <!-- 游戏信息 -->
        <view class="game-info">
          <text class="game-title">{{ game.title }}</text>
          <text class="game-desc">{{ game.description }}</text>
          <view class="game-stats">
            <text class="stat-item">❤️ {{ game.likeCount }}</text>
            <text class="stat-item">🎮 {{ game.playCount }}</text>
            <view
              class="badge"
              :class="game.isPublic ? 'badge-success' : 'badge-default'"
            >
              {{ game.isPublic ? '公开' : '私密' }}
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="gameList.length === 0">
        <text class="empty-icon">🎮</text>
        <text class="empty-text">还没有游戏，快去创建一个吧！</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 游戏列表数据
const gameList = ref([
  {
    id: 1,
    title: '超级跳跃游戏',
    description: '控制小球跳跃躲避障碍物',
    thumbnail: '🎯',
    thumbnailBg: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    likeCount: 15,
    playCount: 67,
    isPublic: true
  },
  {
    id: 2,
    title: '猜数字游戏',
    description: '电脑想一个数字你来猜',
    thumbnail: '🎨',
    thumbnailBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    likeCount: 8,
    playCount: 23,
    isPublic: false
  },
  {
    id: 3,
    title: '跑酷小游戏',
    description: '无限跑酷挑战高分',
    thumbnail: '🏃',
    thumbnailBg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    likeCount: 5,
    playCount: 12,
    isPublic: false
  }
])

// 跳转到创作页面
const goToCreate = () => {
  uni.navigateTo({
    url: '/pages/create/index'
  })
}

// 试玩游戏
const playGame = (game) => {
  uni.navigateTo({
    url: `/pages/play/index?id=${game.id}&title=${game.title}`
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-color;
}

.header {
  padding: 40rpx 30rpx;

  .header-content {
    text-align: center;
    color: $white;
  }

  .header-title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
  }

  .header-subtitle {
    display: block;
    font-size: 28rpx;
    opacity: 0.9;
  }
}

.create-section {
  padding: 30rpx;

  .create-btn {
    width: 100%;
    padding: 40rpx;
    font-size: 36rpx;
    font-weight: bold;
  }
}

.game-list {
  padding: 0 30rpx 30rpx;
}

.game-card {
  background: $white;
  border-radius: 30rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.game-card-hover {
  transform: translateY(-10rpx);
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.15);
}

.game-thumbnail {
  width: 100%;
  height: 240rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .game-icon {
    font-size: 100rpx;
  }

  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .play-button {
    width: 100rpx;
    height: 100rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48rpx;
    box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.3);
  }
}

.game-card-hover .play-overlay {
  opacity: 1;
}

.game-info {
  padding: 30rpx;
}

.game-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: 10rpx;
}

.game-desc {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  margin-bottom: 20rpx;
}

.game-stats {
  display: flex;
  align-items: center;
  gap: 20rpx;
  font-size: 24rpx;
  color: $text-hint;

  .stat-item {
    flex-shrink: 0;
  }
}
</style>
