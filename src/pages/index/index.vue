<template>
  <view class="page">
    <!-- 头部 -->
    <view class="page-header">
      <text class="page-header__title">儿童游戏创作工坊</text>
      <text class="page-header__subtitle">发挥想象，创造你的游戏</text>
    </view>

    <!-- 操作按钮 -->
    <view class="page-actions">
      <button class="btn btn-primary btn-lg btn-block" @tap="goToCreate">
        🎤 新创作
      </button>
    </view>

    <!-- 我的作品 -->
    <view class="section">
      <view class="section-header">
        <text class="section-header__title">我的作品 ({{ myGames.length }})</text>
      </view>

      <!-- 游戏列表 -->
      <view v-if="myGames.length > 0" class="game-list">
        <game-card
          v-for="game in myGames"
          :key="game._id"
          :game="game"
          @tap="goToPlay(game)"
        />
      </view>

      <!-- 空状态 -->
      <empty-state
        v-else
        icon="🎮"
        text="还没有创作任何游戏"
        button-text="开始创作你的第一个游戏"
        @action="goToCreate"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore, useGameStore } from '@/store'
import { useAppStore } from '@/store/modules/app'

const userStore = useUserStore()
const gameStore = useGameStore()
const appStore = useAppStore()

const myGames = computed(() => gameStore.myGames)

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    appStore.showLoading('加载中...')
    await gameStore.fetchMyGames()
  } catch (error) {
    appStore.showToast('加载失败')
  } finally {
    appStore.hideLoading()
  }
}

const goToCreate = () => {
  uni.navigateTo({
    url: '/pages/create/index'
  })
}

const goToPlay = (game) => {
  uni.navigateTo({
    url: `/pages/play/index?id=${game._id}`
  })
}

// 下拉刷新
onPullDownRefresh(async () => {
  await loadData()
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--bg-color);
}

.page-header {
  padding: var(--spacing-xl) var(--spacing-md);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: var(--white);
  text-align: center;
}

.page-header__title {
  display: block;
  font-size: var(--font-size-xxl);
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.page-header__subtitle {
  display: block;
  font-size: var(--font-size-md);
  opacity: 0.9;
}

.page-actions {
  padding: var(--spacing-md);
}

.section {
  margin-top: var(--spacing-md);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
}

.section-header__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.game-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md) var(--spacing-md);
}
</style>
