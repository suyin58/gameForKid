<template>
  <view class="game-card" @tap="handleTap">
    <view class="game-card__thumbnail">
      <image
        v-if="game.thumbnail"
        :src="game.thumbnail"
        class="game-card__image"
        mode="aspectFill"
      />
      <view v-else class="game-card__placeholder">
        <text class="game-card__emoji">{{ getGameEmoji(game.type) }}</text>
      </view>

      <!-- 公开标识 -->
      <view v-if="game.visibility === 'public'" class="game-card__badge">
        <text class="game-card__badge-text">公开</text>
      </view>
    </view>

    <view class="game-card__content">
      <text class="game-card__title">{{ game.title }}</text>
      <text class="game-card__description text-ellipsis-2">{{ game.description }}</text>

      <view class="game-card__footer">
        <view class="game-card__meta">
          <text class="game-card__time">{{ formatTime(game.createdAt) }}</text>
        </view>

        <!-- 点赞数 -->
        <view v-if="showStats && game.likeCount > 0" class="game-card__stats">
          <text class="game-card__heart">❤️</text>
          <text class="game-card__count">{{ game.likeCount }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { formatTime } from '@/utils'

const props = defineProps({
  game: {
    type: Object,
    required: true
  },
  showStats: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tap'])

const getGameEmoji = (type) => {
  const emojis = {
    casual: '🎮',
    sports: '🏃',
    education: '📚',
    creative: '🎨',
    fighting: '⚔️',
    adventure: '🗺️',
    puzzle: '🧩'
  }
  return emojis[type] || '🎮'
}

const handleTap = () => {
  emit('tap', props.game)
}
</script>

<style lang="scss" scoped>
.game-card {
  background: var(--white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-md);
  }
}

.game-card__thumbnail {
  position: relative;
  width: 100%;
  height: 320rpx;
  background: var(--bg-color);
}

.game-card__image {
  width: 100%;
  height: 100%;
}

.game-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.game-card__emoji {
  font-size: 120rpx;
}

.game-card__badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(255, 107, 107, 0.9);
  padding: 4rpx 12rpx;
  border-radius: var(--radius-sm);
}

.game-card__badge-text {
  color: var(--white);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.game-card__content {
  padding: var(--spacing-md);
}

.game-card__title {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.game-card__description {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.6;
}

.game-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.game-card__time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.game-card__stats {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.game-card__heart {
  font-size: var(--font-size-sm);
}

.game-card__count {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}
</style>
