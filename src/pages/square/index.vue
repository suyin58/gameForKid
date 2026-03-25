<template>
  <view class="page">
    <!-- 头部搜索 -->
    <view class="page-header">
      <view class="search-bar">
        <text class="search-bar__icon">🔍</text>
        <input
          v-model="searchKeyword"
          class="search-bar__input"
          placeholder="搜索游戏..."
          @input="handleSearch"
        />
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="sort-tabs">
      <view
        v-for="tab in sortTabs"
        :key="tab.value"
        class="sort-tab"
        :class="{ 'sort-tab--active': currentSort === tab.value }"
        @tap="handleSortChange(tab.value)"
      >
        <text class="sort-tab__text">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 游戏列表 -->
    <view v-if="squareGames.length > 0" class="game-list">
      <game-card
        v-for="game in squareGames"
        :key="game._id"
        :game="game"
        :show-stats="true"
        @tap="goToPlay(game)"
      />
    </view>

    <!-- 空状态 -->
    <empty-state
      v-else
      icon="🌐"
      text="广场上还没有游戏"
      button-text="做第一个发布游戏的人吧！"
      @action="goToCreate"
    />

    <!-- 加载更多 -->
    <view v-if="hasMore" class="load-more">
      <text class="load-more__text">加载更多...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/store'
import { useAppStore } from '@/store/modules/app'
import { SquareSortType } from '@/config/constants'
import { debounce } from '@/utils'

const gameStore = useGameStore()
const appStore = useAppStore()

const searchKeyword = ref('')
const currentSort = ref(SquareSortType.RECOMMEND)
const page = ref(1)
const hasMore = ref(true)

const sortTabs = [
  { label: '推荐', value: SquareSortType.RECOMMEND },
  { label: '最新', value: SquareSortType.LATEST },
  { label: '最热', value: SquareSortType.HOT }
]

const squareGames = computed(() => gameStore.squareGames)

onMounted(() => {
  loadData()
})

const loadData = async (isLoadMore = false) => {
  try {
    if (!isLoadMore) {
      appStore.showLoading('加载中...')
    }

    await gameStore.fetchSquareGames({
      page: page.value,
      sort: currentSort.value,
      keyword: searchKeyword.value
    })

    hasMore.value = gameStore.squareGames.length >= 20
  } catch (error) {
    appStore.showToast('加载失败')
  } finally {
    appStore.hideLoading()
  }
}

const handleSearch = debounce((e) => {
  searchKeyword.value = e.detail.value
  page.value = 1
  loadData()
}, 500)

const handleSortChange = (sort) => {
  currentSort.value = sort
  page.value = 1
  loadData()
}

const goToPlay = (game) => {
  uni.navigateTo({
    url: `/pages/play/index?id=${game._id}`
  })
}

const goToCreate = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 下拉刷新
onPullDownRefresh(async () => {
  page.value = 1
  await loadData()
  uni.stopPullDownRefresh()
})

// 上拉加载更多
onReachBottom(() => {
  if (hasMore.value) {
    page.value++
    loadData(true)
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--bg-color);
}

.page-header {
  padding: var(--spacing-md);
  background: var(--white);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-color);
  border-radius: var(--radius-lg);
}

.search-bar__icon {
  font-size: var(--font-size-lg);
}

.search-bar__input {
  flex: 1;
  font-size: var(--font-size-md);
  border: none;
  background: transparent;
}

.sort-tabs {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--white);
  border-top: 1rpx solid var(--border-color);
}

.sort-tab {
  flex: 1;
  text-align: center;
  padding: var(--spacing-sm) 0;
  border-radius: var(--radius-sm);
  transition: all 0.3s;
}

.sort-tab--active {
  background: var(--primary-color);
}

.sort-tab__text {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-secondary);
}

.sort-tab--active .sort-tab__text {
  color: var(--white);
}

.game-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.load-more {
  padding: var(--spacing-lg);
  text-align: center;
}

.load-more__text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
</style>
