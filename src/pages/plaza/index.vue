<template>
  <view class="page">
    <!-- 顶部搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索游戏..."
          @input="handleSearch"
        />
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="category-section">
      <scroll-view class="category-scroll" scroll-x>
        <view
          class="category-item"
          :class="{ active: selectedCategory === item.value }"
          v-for="item in categories"
          :key="item.value"
          @click="selectCategory(item.value)"
        >
          {{ item.label }}
        </view>
      </scroll-view>
    </view>

    <!-- 排序选项 -->
    <view class="sort-section">
      <view
        class="sort-item"
        :class="{ active: sortBy === item.value }"
        v-for="item in sortOptions"
        :key="item.value"
        @click="changeSort(item.value)"
      >
        {{ item.label }}
      </view>
    </view>

    <!-- 游戏列表 -->
    <view class="games-section">
      <view class="games-list">
        <view
          class="game-card"
          v-for="game in filteredGames"
          :key="game.id"
          @click="goToPlay(game)"
        >
          <view class="game-card-thumbnail" :style="{ background: game.background }">
            <text class="game-icon">{{ game.icon }}</text>
            <view class="play-overlay">
              <view class="play-button">▶</view>
            </view>
            <view class="game-type-badge">{{ game.type }}</view>
          </view>
          <view class="game-card-content">
            <view class="game-header">
              <text class="game-card-title">{{ game.title }}</text>
              <view class="like-btn" @click.stop="toggleLike(game)">
                <text :class="{ liked: game.isLiked }">{{ game.isLiked ? '❤️' : '🤍' }}</text>
                <text class="like-count">{{ game.likes }}</text>
              </view>
            </view>
            <text class="game-card-desc">{{ game.description }}</text>
            <view class="game-card-stats">
              <text class="stat-item">
                <text class="stat-icon">👤</text>
                {{ game.author }}
              </text>
              <text class="stat-item">
                <text class="stat-icon">❤️</text>
                {{ game.likes }}
              </text>
              <text class="stat-item">
                <text class="stat-icon">🎮</text>
                {{ game.plays }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredGames.length === 0">
        <text class="empty-state-icon">🔍</text>
        <text class="empty-state-text">没有找到相关游戏</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 搜索关键词
const searchKeyword = ref('')

// 选中的分类
const selectedCategory = ref('all')

// 排序方式
const sortBy = ref('hot')

// 分类选项
const categories = [
  { label: '全部', value: 'all' },
  { label: '冒险', value: 'adventure' },
  { label: '益智', value: 'puzzle' },
  { label: '动作', value: 'action' },
  { label: '休闲', value: 'casual' },
  { label: '教育', value: 'education' }
]

// 排序选项
const sortOptions = [
  { label: '最热', value: 'hot' },
  { label: '最新', value: 'new' },
  { label: '最多点赞', value: 'likes' }
]

// 游戏列表（Mock 数据）
const games = ref([
  {
    id: 1,
    title: '太空大冒险',
    description: '探索神秘宇宙，收集星星能量',
    icon: '🚀',
    type: '冒险',
    typeValue: 'adventure',
    author: '小明',
    likes: 128,
    plays: 456,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    isLiked: false
  },
  {
    id: 2,
    title: '数学小天才',
    description: '趣味数学挑战，让孩子爱上数学',
    icon: '🔢',
    type: '教育',
    typeValue: 'education',
    author: '王老师',
    likes: 89,
    plays: 234,
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    isLiked: true
  },
  {
    id: 3,
    title: '水果连连看',
    description: '经典连连看游戏，锻炼观察力',
    icon: '🍎',
    type: '休闲',
    typeValue: 'casual',
    author: '小红',
    likes: 234,
    plays: 678,
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    isLiked: false
  },
  {
    id: 4,
    title: '勇者斗恶龙',
    description: '经典RPG游戏体验',
    icon: '⚔️',
    type: '动作',
    typeValue: 'action',
    author: '小刚',
    likes: 156,
    plays: 345,
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    isLiked: false
  }
])

// 过滤和排序后的游戏列表
const filteredGames = computed(() => {
  let result = games.value

  // 分类过滤
  if (selectedCategory.value !== 'all') {
    result = result.filter(game => game.typeValue === selectedCategory.value)
  }

  // 搜索过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(game =>
      game.title.toLowerCase().includes(keyword) ||
      game.description.toLowerCase().includes(keyword) ||
      game.author.toLowerCase().includes(keyword)
    )
  }

  // 排序
  result = [...result].sort((a, b) => {
    if (sortBy.value === 'hot') {
      return b.plays - a.plays
    } else if (sortBy.value === 'likes') {
      return b.likes - a.likes
    } else {
      return b.id - a.id
    }
  })

  return result
})

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已在 computed 中实现
}

// 选择分类
const selectCategory = (value) => {
  selectedCategory.value = value
}

// 改变排序
const changeSort = (value) => {
  sortBy.value = value
}

// 点赞/取消点赞
const toggleLike = (game) => {
  game.isLiked = !game.isLiked
  game.likes += game.isLiked ? 1 : -1
}

// 跳转到游戏试玩页
const goToPlay = (game) => {
  uni.navigateTo({
    url: `/pages/play/index?id=${game.id}&title=${game.title}`
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.search-section {
  background: white;
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 25px;
  padding: 10px 15px;
}

.search-icon {
  font-size: 18px;
  margin-right: 10px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
}

.category-section {
  background: white;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.category-scroll {
  white-space: nowrap;
}

.category-item {
  display: inline-block;
  padding: 8px 16px;
  margin: 0 5px;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  transition: all 0.3s;
}

.category-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sort-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 15px 20px;
}

.sort-item {
  font-size: 14px;
  color: #666;
  padding: 5px 10px;
  border-radius: 15px;
  transition: all 0.3s;
}

.sort-item.active {
  color: #FF6B6B;
  font-weight: bold;
}

.games-section {
  padding: 15px 20px;
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
}

.game-card-thumbnail {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  position: relative;
}

.game-icon {
  font-size: 60px;
}

.game-type-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
  color: #666;
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

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.game-card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #999;
}

.like-btn .liked {
  color: #ff4444;
}

.like-count {
  font-size: 12px;
}

.game-card-desc {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.game-card-stats {
  display: flex;
  gap: 15px;
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
}
</style>
