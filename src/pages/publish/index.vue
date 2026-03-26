<template>
  <view class="page">
    <!-- 顶部标题 -->
    <view class="header-section">
      <text class="header-title">发布游戏</text>
      <text class="header-subtitle">让更多小朋友看到你的作品</text>
    </view>

    <!-- 游戏预览 -->
    <view class="preview-section">
      <view class="preview-card">
        <view class="preview-thumbnail" :style="{ background: previewBackground }">
          <text class="preview-icon">{{ previewIcon }}</text>
        </view>
        <view class="preview-info">
          <text class="preview-title">{{ previewTitle }}</text>
          <text class="preview-desc">{{ previewDesc }}</text>
        </view>
      </view>
    </view>

    <!-- 发布表单 -->
    <view class="form-section">
      <!-- 游戏标题 -->
      <view class="form-item">
        <text class="form-label">游戏标题</text>
        <input
          class="form-input"
          v-model="form.title"
          placeholder="给游戏起个好听的名字"
          :maxlength="30"
        />
        <text class="form-count">{{ form.title.length }}/30</text>
      </view>

      <!-- 游戏描述 -->
      <view class="form-item">
        <text class="form-label">游戏描述</text>
        <textarea
          class="form-textarea"
          v-model="form.description"
          placeholder="介绍一下你的游戏玩法和特色"
          :maxlength="200"
        />
        <text class="form-count">{{ form.description.length }}/200</text>
      </view>

      <!-- 游戏类型 -->
      <view class="form-item">
        <text class="form-label">游戏类型</text>
        <view class="type-options">
          <view
            class="type-option"
            :class="{ active: form.type === item.value }"
            v-for="item in gameTypes"
            :key="item.value"
            @click="selectType(item.value)"
          >
            <text class="type-icon">{{ item.icon }}</text>
            <text class="type-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 可见性设置 -->
      <view class="form-item">
        <text class="form-label">可见性</text>
        <view class="visibility-options">
          <view
            class="visibility-option"
            :class="{ active: form.visibility === item.value }"
            v-for="item in visibilityOptions"
            :key="item.value"
            @click="selectVisibility(item.value)"
          >
            <text class="visibility-label">{{ item.label }}</text>
            <text class="visibility-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 封面图标 -->
      <view class="form-item">
        <text class="form-label">封面图标</text>
        <view class="icon-selector">
          <view
            class="icon-option"
            :class="{ active: form.icon === item }"
            v-for="item in iconOptions"
            :key="item"
            @click="selectIcon(item)"
          >
            {{ item }}
          </view>
        </view>
      </view>
    </view>

    <!-- 发布说明 -->
    <view class="notice-section">
      <text class="notice-icon">ℹ️</text>
      <text class="notice-text">发布后的游戏将经过审核，审核通过后会在游戏广场展示</text>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="cancel-btn" @click="goBack">取消</button>
      <button
        class="publish-btn"
        :disabled="!canPublish"
        @click="publishGame"
      >
        发布
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onLoad } from '@dcloudio/uni-app'

// 页面参数
const gameId = ref('')

// 表单数据
const form = ref({
  title: '',
  description: '',
  type: 'casual',
  visibility: 'public',
  icon: '🎮'
})

// 预览数据
const previewTitle = ref('我的游戏')
const previewDesc = ref('暂无描述')
const previewIcon = ref('🎮')
const previewBackground = ref('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')

// 游戏类型选项
const gameTypes = [
  { label: '休闲', value: 'casual', icon: '🎮' },
  { label: '冒险', value: 'adventure', icon: '🚀' },
  { label: '益智', value: 'puzzle', icon: '🧩' },
  { label: '动作', value: 'action', icon: '⚔️' },
  { label: '教育', value: 'education', icon: '📚' },
  { label: '运动', value: 'sports', icon: '⚽' }
]

// 可见性选项
const visibilityOptions = [
  { label: '公开', value: 'public', desc: '所有人可见' },
  { label: '私有', value: 'private', desc: '仅自己可见' }
]

// 图标选项
const iconOptions = ['🎮', '🚀', '🧩', '⚔️', '📚', '⚽', '🎨', '🎵', '🎯', '🎪']

// 是否可以发布
const canPublish = computed(() => {
  return form.value.title.trim().length >= 2 &&
         form.value.description.trim().length >= 10
})

// 页面加载
onLoad((options) => {
  if (options.id) {
    gameId.value = options.id
    // TODO: 加载游戏数据
  }
})

// 选择游戏类型
const selectType = (value) => {
  form.value.type = value
  const selectedType = gameTypes.find(item => item.value === value)
  if (selectedType) {
    previewIcon.value = selectedType.icon
    form.value.icon = selectedType.icon
  }
}

// 选择可见性
const selectVisibility = (value) => {
  form.value.visibility = value
}

// 选择图标
const selectIcon = (icon) => {
  form.value.icon = icon
  previewIcon.value = icon
}

// 发布游戏
const publishGame = () => {
  if (!canPublish.value) return

  uni.showLoading({ title: '发布中...' })

  // 模拟发布
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '发布成功！',
      icon: 'success'
    })

    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 1500)
  }, 1500)
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100px;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px;
  text-align: center;
}

.header-title {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
}

.header-subtitle {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.preview-section {
  padding: 20px;
}

.preview-card {
  background: white;
  border-radius: 15px;
  padding: 15px;
  display: flex;
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.preview-thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  flex-shrink: 0;
}

.preview-icon {
  font-size: 40px;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.preview-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.preview-desc {
  font-size: 13px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.form-section {
  padding: 0 20px;
}

.form-item {
  background: white;
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-label {
  display: block;
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  background: #f9f9f9;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  min-height: 100px;
  background: #f9f9f9;
  resize: none;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.form-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.type-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  transition: all 0.3s;
}

.type-option.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.type-icon {
  font-size: 24px;
}

.type-label {
  font-size: 12px;
  color: #666;
}

.visibility-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.visibility-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  transition: all 0.3s;
}

.visibility-option.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.visibility-label {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.visibility-desc {
  font-size: 12px;
  color: #999;
}

.icon-selector {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.icon-option {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  transition: all 0.3s;
}

.icon-option.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: scale(1.1);
}

.notice-section {
  margin: 0 20px 15px;
  padding: 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.notice-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.notice-text {
  flex: 1;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px 20px;
  display: flex;
  gap: 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  flex: 1;
  padding: 15px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
}

.publish-btn {
  flex: 2;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
}

.publish-btn:disabled {
  opacity: 0.5;
}
</style>
