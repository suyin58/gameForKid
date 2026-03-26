<template>
  <view class="page">
    <!-- 预览区域 -->
    <view class="preview-section">
      <view class="preview-header">
        <text class="preview-title">游戏预览</text>
        <view class="preview-status">
          <text class="status-text">{{ statusText }}</text>
        </view>
      </view>

      <view class="game-thumbnail-preview-large" :class="{ generating: isGenerating }">
        <!-- 生成中状态 -->
        <view v-if="isGenerating" class="stream-output">
          <view
            v-for="(line, index) in streamLines"
            :key="index"
            class="stream-line"
            :class="line.type"
          >
            {{ line.text }}
          </view>
          <text v-if="isGenerating" class="cursor"></text>
        </view>

        <!-- 初始状态 -->
        <view v-else-if="!generatedGame" class="game-thumbnail-content">
          <text class="game-scene-large">🎮</text>
          <text class="game-title-large">开始创作吧</text>
          <text class="game-hint-large">描述你想要的游戏，AI 会帮你生成</text>
        </view>

        <!-- 生成完成状态 -->
        <view v-else class="game-thumbnail-content">
          <text class="game-scene-large">{{ generatedGame.icon }}</text>
          <text class="game-title-large">{{ generatedGame.title }}</text>
          <text class="game-hint-large">{{ generatedGame.description }}</text>
        </view>
      </view>
    </view>

    <!-- 输入区域 -->
    <view class="input-section-chat">
      <view class="input-header">
        <text class="input-title">描述你的游戏</text>
        <text class="input-hint">例如：我想做一个关于太空探险的游戏</text>
      </view>
      <textarea
        class="game-input"
        v-model="gameDescription"
        placeholder="在这里描述你想要的游戏..."
        :disabled="isGenerating"
        :maxlength="500"
      />
      <view class="input-count">
        <text :class="{ warning: gameDescription.length >= 450 }">
          {{ gameDescription.length }}/500
        </text>
      </view>

      <view class="input-actions-chat">
        <button
          class="voice-btn-chat"
          :class="{ recording: isRecording }"
          @click="toggleRecording"
          :disabled="isGenerating"
        >
          {{ isRecording ? '⏹️' : '🎤' }}
        </button>
        <button
          class="generate-btn-chat"
          @click="generateGame"
          :disabled="!canGenerate || isGenerating"
        >
          {{ isGenerating ? '生成中...' : '生成游戏' }}
        </button>
      </view>
    </view>

    <!-- 配额提示 -->
    <view class="quota-section">
      <text class="quota-text">剩余生成次数：{{ remainingQuota }}</text>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions" v-if="generatedGame">
      <button class="bottom-action-btn" @click="resetGame">
        <text class="action-icon">🔄</text>
        <text>重新生成</text>
      </button>
      <button class="bottom-action-btn" @click="previewGame">
        <text class="action-icon">👁️</text>
        <text>预览</text>
      </button>
      <button class="bottom-action-btn primary" @click="saveGame">
        <text class="action-icon">💾</text>
        <text>保存</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 状态数据
const gameDescription = ref('')
const isGenerating = ref(false)
const isRecording = ref(false)
const remainingQuota = ref(5)
const streamLines = ref([])
const generatedGame = ref(null)

// 计算属性
const statusText = computed(() => {
  if (isGenerating.value) return '生成中'
  if (generatedGame.value) return '已完成'
  return '等待生成'
})

const canGenerate = computed(() => {
  return gameDescription.value.trim().length >= 5 && remainingQuota.value > 0
})

// 切换录音
const toggleRecording = () => {
  isRecording.value = !isRecording.value
  if (isRecording.value) {
    // TODO: 实现语音识别功能
    uni.showToast({
      title: '语音识别功能开发中',
      icon: 'none'
    })
  }
}

// 生成游戏（模拟）
const generateGame = () => {
  if (!canGenerate.value || isGenerating.value) return

  isGenerating.value = true
  streamLines.value = []

  // 模拟流式输出
  const mockStreamLines = [
    { text: '> 正在分析游戏需求...', type: 'command' },
    { text: '> 设计游戏场景和角色', type: 'command' },
    { text: '> 编写游戏逻辑代码', type: 'command' },
    { text: '> 添加动画效果', type: 'info' },
    { text: '> 优化游戏体验', type: 'info' },
    { text: '✓ 游戏生成完成！', type: 'success' }
  ]

  let index = 0
  const addLine = () => {
    if (index < mockStreamLines.length) {
      streamLines.value.push(mockStreamLines[index])
      index++
      setTimeout(addLine, 500)
    } else {
      // 生成完成
      setTimeout(() => {
        isGenerating.value = false
        generatedGame.value = {
          id: Date.now(),
          title: '太空冒险',
          description: gameDescription.value.substring(0, 50),
          icon: '🚀',
          content: '<!-- 游戏代码 -->'
        }
        remainingQuota.value--
        uni.showToast({
          title: '游戏生成成功！',
          icon: 'success'
        })
      }, 500)
    }
  }

  addLine()
}

// 预览游戏
const previewGame = () => {
  if (!generatedGame.value) return
  uni.navigateTo({
    url: `/pages/play/index?id=${generatedGame.value.id}&title=${generatedGame.value.title}&preview=true`
  })
}

// 保存游戏
const saveGame = () => {
  if (!generatedGame.value) return
  uni.showToast({
    title: '游戏已保存到我的作品',
    icon: 'success'
  })
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/index/index'
    })
  }, 1500)
}

// 重新生成
const resetGame = () => {
  generatedGame.value = null
  streamLines.value = []
  gameDescription.value = ''
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  padding-bottom: 100px;
}

.preview-section {
  background: white;
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.preview-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.preview-status {
  font-size: 12px;
  color: #999;
  padding: 4px 10px;
  background: #f5f5f5;
  border-radius: 12px;
}

.game-thumbnail-preview-large {
  width: 100%;
  min-height: 200px;
  background: linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.game-thumbnail-preview-large.generating {
  background: #1a1a1a;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 15px;
}

.game-thumbnail-content {
  text-align: center;
}

.game-scene-large {
  font-size: 60px;
  animation: bounce 1s infinite;
}

.game-title-large {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.game-hint-large {
  font-size: 14px;
  color: #666;
}

.stream-output {
  width: 100%;
  max-height: 230px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #00ff00;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.stream-line {
  margin-bottom: 5px;
  animation: fadeInLine 0.3s ease forwards;
}

.stream-line.command {
  color: #00bfff;
}

.stream-line.success {
  color: #00ff00;
}

.stream-line.error {
  color: #ff4444;
}

.stream-line.info {
  color: #ffaa00;
}

.cursor {
  display: inline-block;
  width: 8px;
  height: 15px;
  background: #00ff00;
  animation: blink 1s infinite;
  margin-left: 2px;
}

@keyframes fadeInLine {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.input-section-chat {
  background: white;
  border-radius: 15px;
  padding: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.input-hint {
  font-size: 12px;
  color: #999;
}

.game-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  min-height: 80px;
  resize: none;
}

.game-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.input-count {
  text-align: right;
  font-size: 12px;
  color: #999;
}

.input-count .warning {
  color: #ff4444;
}

.input-actions-chat {
  display: flex;
  gap: 8px;
  align-items: center;
}

.voice-btn-chat {
  background: #f5f5f5;
  border: none;
  color: #666;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 18px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.voice-btn-chat.recording {
  background: #fee;
  color: #f44;
  animation: pulse 1s infinite;
}

.generate-btn-chat {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
}

.generate-btn-chat:disabled {
  opacity: 0.5;
}

.quota-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 10px 15px;
  margin-top: 15px;
  text-align: center;
}

.quota-text {
  font-size: 13px;
  color: #666;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
  z-index: 100;
}

.bottom-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  background: #f5f5f5;
  color: #666;
}

.bottom-action-btn.primary {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.action-icon {
  font-size: 18px;
}
</style>
