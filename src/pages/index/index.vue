<template>
  <view class="page">
    <!-- 顶部标题区域 -->
    <view class="header-section">
      <view class="user-info">
        <view class="avatar">👶</view>
        <view class="welcome-text">
          <text class="greeting">你好，小创作者！</text>
          <text class="subtitle">开始创作你的第一个游戏吧</text>
        </view>
      </view>
    </view>

    <!-- 创作按钮 -->
    <view class="create-section">
      <button class="create-btn" @click="goToCreate">
        <text class="create-icon">✨</text>
        <text class="create-text">创建新游戏</text>
      </button>
    </view>

    <!-- 游戏列表 -->
    <view class="games-section">
      <view class="section-header">
        <text class="section-title">我的作品</text>
        <text class="section-count">{{ games.length }} 个游戏</text>
      </view>

      <!-- 游戏卡片列表 -->
      <view class="games-list">
        <view
          class="game-card"
          v-for="game in games"
          :key="game.id"
          @click="goToPlay(game)"
        >
          <view class="game-card-thumbnail">
            <text class="game-icon">{{ game.icon }}</text>
            <view class="play-overlay">
              <view class="play-button">▶</view>
            </view>
          </view>
          <view class="game-card-content">
            <text class="game-card-title">{{ game.title }}</text>
            <text class="game-card-desc">{{ game.description }}</text>
            <view class="game-card-stats">
              <text class="stat-item">
                <text class="stat-icon">❤️</text>
                {{ game.likes }}
              </text>
              <text class="stat-item">
                <text class="stat-icon">🎮</text>
                {{ game.plays }} 次游玩
              </text>
              <text class="stat-item">{{ formatDate(game.createdAt) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="games.length === 0">
        <text class="empty-state-icon">🎨</text>
        <text class="empty-state-text">还没有作品哦</text>
        <text class="empty-state-hint">点击上方按钮开始创作吧！</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 游戏列表数据（后续将使用 Mock 数据）
const games = ref([
  {
    id: 1,
    title: '太空冒险',
    description: '探索神秘宇宙，收集星星能量',
    icon: '🚀',
    likes: 12,
    plays: 45,
    createdAt: '2026-03-25'
  },
  {
    id: 2,
    title: '魔法森林',
    description: '在神奇的森林里寻找宝藏',
    icon: '🌲',
    likes: 8,
    plays: 23,
    createdAt: '2026-03-26'
  }
])

// 跳转到创作页
const goToCreate = () => {
  uni.navigateTo({
    url: '/pages/create/index'
  })
}

// 跳转到游戏试玩页
const goToPlay = (game) => {
  uni.navigateTo({
    url: `/pages/play/index?id=${game.id}&title=${game.title}`
  })
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 80px;
}

.header-section {
  padding: 30px 20px 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  backdrop-filter: blur(10px);
}

.welcome-text {
  flex: 1;
  color: white;
}

.greeting {
  display: block;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.subtitle {
  display: block;
  font-size: 14px;
  opacity: 0.9;
}

.create-section {
  padding: 0 20px 20px;
}

.create-btn {
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
}

.create-btn:active {
  transform: scale(0.98);
}

.create-icon {
  font-size: 24px;
}

.games-section {
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  min-height: 400px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.section-count {
  font-size: 14px;
  color: #999;
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.game-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.game-card:active {
  transform: scale(0.98);
}

.game-card-thumbnail {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  position: relative;
  background: linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%);
}

.game-icon {
  font-size: 60px;
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

.game-card-thumbnail:active .play-overlay {
  opacity: 1;
}

.play-button {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  color: #FF6B6B;
}

.game-card-content {
  padding: 15px;
}

.game-card-title {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.game-card-desc {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.game-card-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-state-icon {
  font-size: 60px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.empty-state-hint {
  font-size: 14px;
  color: #999;
}
</style>
