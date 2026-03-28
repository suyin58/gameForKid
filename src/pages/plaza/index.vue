<template>
  <view class="page">
    <!-- 头部 -->
    <view class="header gradient-bg gradient-primary">
      <view class="header-content">
        <text class="header-title">🌍 游戏广场</text>
        <text class="header-subtitle">发现其他小朋友创作的精彩游戏</text>
      </view>
    </view>

    <!-- 排序选项 -->
    <view class="sort-bar">
      <view
        class="sort-item"
        v-for="item in sortOptions"
        :key="item.value"
        @tap="changeSort(item.value)"
        :class="{ active: currentSort === item.value }"
      >
        <text>{{ item.label }}</text>
      </view>
    </view>

    <!-- 游戏列表 -->
    <view class="game-list">
      <view
        class="game-card"
        v-for="game in filteredGameList"
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
          <view class="thumbnail-badge">{{ game.type }}</view>
        </view>

        <!-- 游戏信息 -->
        <view class="game-info">
          <text class="game-title">{{ game.title }}</text>
          <text class="game-desc">{{ game.description }}</text>
          <view class="game-meta flex-between">
            <view class="author-info">
              <text class="author-name">👤 {{ game.author }}</text>
            </view>
            <view class="game-stats">
              <text class="stat-item">❤️ {{ game.likeCount }}</text>
              <text class="stat-item">🎮 {{ game.playCount }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore" @tap="loadMore">
        <text>加载更多</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredGameList.length === 0">
        <text class="empty-icon">🎮</text>
        <text class="empty-text">广场上还没有游戏哦~</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 排序选项
const sortOptions = [
  { label: '最新', value: 'newest' },
  { label: '最热', value: 'hottest' }
]

const currentSort = ref('newest')

// 游戏列表
const gameList = ref([
  {
    id: 4,
    title: '接水果游戏',
    description: '用篮子接住掉下来的水果',
    thumbnail: '🎨',
    thumbnailBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    author: '小红',
    type: '休闲',
    likeCount: 15,
    playCount: 67,
    createdAt: Date.now()
  },
  {
    id: 5,
    title: '记忆力测试',
    description: '记住卡片位置并匹配',
    thumbnail: '🧠',
    thumbnailBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    author: '小红',
    type: '益智',
    likeCount: 6,
    playCount: 18,
    createdAt: Date.now() - 86400000
  },
  {
    id: 6,
    title: '跑酷挑战',
    description: '躲避障碍物跑得更远',
    thumbnail: '🏃',
    thumbnailBg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    author: '小刚',
    type: '动作',
    likeCount: 20,
    playCount: 89,
    createdAt: Date.now() - 172800000
  },
  {
    id: 7,
    title: '猜数字',
    description: '猜猜电脑想的数字',
    thumbnail: '🔢',
    thumbnailBg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    author: '小明',
    type: '益智',
    likeCount: 8,
    playCount: 34,
    createdAt: Date.now() - 259200000
  }
])

const hasMore = ref(false)

// 排序后的列表
const filteredGameList = computed(() => {
  const list = [...gameList.value]
  if (currentSort.value === 'newest') {
    return list.sort((a, b) => b.createdAt - a.createdAt)
  } else {
    return list.sort((a, b) => b.likeCount - a.likeCount)
  }
})

// 切换排序
const changeSort = (value) => {
  currentSort.value = value
}

// 试玩游戏
const playGame = (game) => {
  uni.navigateTo({
    url: `/pages/play/index?id=${game.id}&title=${game.title}&author=${game.author}`
  })
}

// 加载更多
const loadMore = () => {
  uni.showToast({ title: '加载中...', icon: 'loading' })
  // 实际应用中这里会调用 API
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

.sort-bar {
  display: flex;
  background: $white;
  padding: 20rpx 30rpx;
  gap: 20rpx;
  border-bottom: 1rpx solid $border-color;
}

.sort-item {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  font-size: 28rpx;
  color: $text-secondary;
  border-radius: 16rpx;
  transition: all 0.3s;

  &.active {
    background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
    color: $white;
    font-weight: bold;
  }
}

.game-list {
  padding: 30rpx;
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

  .thumbnail-badge {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    background: rgba(255, 255, 255, 0.9);
    color: $primary-color;
    padding: 8rpx 20rpx;
    border-radius: 24rpx;
    font-size: 22rpx;
    font-weight: bold;
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

.game-meta {
  margin-top: 20rpx;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 24rpx;
  color: $text-hint;
}

.game-stats {
  display: flex;
  gap: 20rpx;
  font-size: 24rpx;
  color: $text-hint;
}

.stat-item {
  flex-shrink: 0;
}

.load-more {
  text-align: center;
  padding: 30rpx;
  color: $primary-color;
  font-size: 28rpx;

  &:active {
    opacity: 0.7;
  }
}
</style>
