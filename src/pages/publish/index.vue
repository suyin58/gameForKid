<template>
  <view class="page">
    <view class="page-content">
      <view class="form-section">
        <text class="form-section__title">发布游戏</text>

        <!-- 游戏名称 -->
        <view class="form-item">
          <text class="form-item__label">游戏名称</text>
          <input
            v-model="formData.title"
            class="input"
            placeholder="给你的游戏起个名字"
            @input="handleTitleInput"
          />
          <text v-if="errors.title" class="form-item__error">{{ errors.title }}</text>
        </view>

        <!-- 游戏简介 -->
        <view class="form-item">
          <text class="form-item__label">游戏简介（可选）</text>
          <textarea
            v-model="formData.description"
            class="input"
            placeholder="介绍一下你的游戏..."
            :maxlength="200"
            :auto-height="true"
          />
        </view>

        <!-- 游戏类型 -->
        <view class="form-item">
          <text class="form-item__label">游戏类型（可选）</text>
          <view class="type-tags">
            <view
              v-for="type in gameTypes"
              :key="type.value"
              class="type-tag"
              :class="{ 'type-tag--active': formData.type === type.value }"
              @tap="handleTypeSelect(type.value)"
            >
              <text class="type-tag__text">{{ type.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 按钮 -->
      <view class="action-buttons">
        <button class="btn btn-secondary btn-block" @tap="handleCancel">
          取消
        </button>
        <button class="btn btn-primary btn-block" @tap="handlePublish">
          确认发布
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useGameStore } from '@/store'
import { useAppStore } from '@/store/modules/app'
import { GameType, GameTypeLabels } from '@/config/constants'
import { validators } from '@/utils'

const gameStore = useGameStore()
const appStore = useAppStore()

const gameId = ref('')
const errors = reactive({})

const formData = reactive({
  title: '',
  description: '',
  type: GameType.CASUAL
})

const gameTypes = Object.entries(GameTypeLabels).map(([value, label]) => ({
  value,
  label
}))

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  gameId.value = options.id

  // 预填充游戏信息
  if (gameStore.currentGame) {
    formData.title = gameStore.currentGame.title || ''
    formData.description = gameStore.currentGame.description || ''
    formData.type = gameStore.currentGame.type || GameType.CASUAL
  }
})

const handleTitleInput = (e) => {
  formData.title = e.detail.value
  delete errors.title
}

const handleTypeSelect = (type) => {
  formData.type = type
}

const validate = () => {
  const result = validators.gameTitle(formData.title)
  if (!result.valid) {
    errors.title = result.message
    return false
  }
  return true
}

const handleCancel = () => {
  uni.navigateBack()
}

const handlePublish = async () => {
  if (!validate()) {
    return
  }

  try {
    appStore.showLoading('发布中...')

    const success = await gameStore.publishGame(gameId.value, {
      title: formData.title,
      description: formData.description,
      type: formData.type
    })

    if (success) {
      uni.showModal({
        title: '✅ 发布成功！',
        content: '你的游戏已经在广场上啦',
        showCancel: true,
        cancelText: '继续创作',
        confirmText: '去广场看看',
        success: (res) => {
          if (res.confirm) {
            uni.switchTab({
              url: '/pages/square/index'
            })
          } else {
            uni.navigateBack()
          }
        }
      })
    }
  } catch (error) {
    appStore.showToast('发布失败')
  } finally {
    appStore.hideLoading()
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--bg-color);
}

.page-content {
  padding: var(--spacing-md);
}

.form-section {
  margin-bottom: var(--spacing-xl);
}

.form-section__title {
  display: block;
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.form-item {
  margin-bottom: var(--spacing-lg);
}

.form-item__label {
  display: block;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.form-item__error {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--danger-color);
  margin-top: var(--spacing-xs);
}

.type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.type-tag {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--white);
  border-radius: var(--radius-md);
  border: 2rpx solid var(--border-color);
  transition: all 0.3s;
}

.type-tag--active {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.type-tag__text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.type-tag--active .type-tag__text {
  color: var(--white);
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}
</style>
