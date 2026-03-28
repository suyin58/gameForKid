<template>
  <view class="page">
    <!-- 游戏预览区 -->
    <view class="preview-section card">
      <view class="preview-header flex-between">
        <text class="preview-title">🎮 游戏预览</text>
        <view class="preview-status" :class="statusClass">
          {{ previewStatus }}
        </view>
      </view>

      <!-- 预览缩略图 -->
      <view
        class="preview-thumbnail"
        :class="{ 'generating': isGenerating }"
        :style="{ background: previewBg }"
      >
        <!-- 生成中的 stream 输出 -->
        <scroll-view
          v-if="isGenerating"
          class="stream-output"
          scroll-y
          :scroll-top="scrollTop"
        >
          <view
            v-for="(line, index) in streamLines"
            :key="index"
            class="stream-line"
            :class="'line-' + line.type"
          >
            {{ line.text }}
          </view>
          <view v-if="showCursor" class="cursor"></view>
        </scroll-view>

        <!-- 普通预览 -->
        <view v-else class="preview-content flex-center flex-column">
          <text class="preview-title-large">{{ previewTitle }}</text>
          <text class="preview-icon">🎮</text>
          <text class="preview-hint">{{ previewHint }}</text>
        </view>
      </view>
    </view>

    <!-- 输入区域 -->
    <view class="input-section card">
      <textarea
        class="input-textarea"
        v-model="gameDescription"
        placeholder="描述你想要的游戏..."
        :maxlength="500"
        @input="onInputChange"
      />
      <view class="input-actions flex-between">
        <button
          class="voice-btn"
          @tap="toggleVoice"
          :class="{ 'recording': isRecording }"
        >
          <text>{{ isRecording ? '⏹️' : '🎤' }}</text>
        </button>
        <button
          class="generate-btn btn btn-primary"
          @tap="generateGame"
          :disabled="!canGenerate"
          :class="{ 'btn-disabled': !canGenerate }"
        >
          {{ isEditMode ? '修改' : '生成' }}
        </button>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions" v-if="showBottomActions">
      <button class="action-btn btn btn-default" @tap="testGame">
        <text class="action-icon">▶️</text>
        <text>试玩</text>
      </button>
      <button class="action-btn btn btn-success" @tap="saveGame">
        <text class="action-icon">💾</text>
        <text>保存</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 状态
const gameDescription = ref('')
const isGenerating = ref(false)
const isRecording = ref(false)
const isEditMode = ref(false)
const showBottomActions = ref(false)
const streamLines = ref([])
const scrollTop = ref(0)
const showCursor = ref(true)

// 预览状态
const previewStatus = ref('等待生成...')
const previewTitle = ref('等待生成...')
const previewBg = ref('linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)')
const previewHint = ref('描述你的游戏，AI会帮你生成！')

// 当前编辑的游戏ID
const currentEditGameId = ref(null)

// 计算属性
const canGenerate = computed(() => {
  return gameDescription.value.trim().length > 0
})

const statusClass = computed(() => {
  if (isGenerating.value) return 'status-generating'
  if (showBottomActions.value) return 'status-success'
  return 'status-waiting'
})

// 页面加载
onLoad((options) => {
  if (options.id) {
    // 编辑模式
    isEditMode.value = true
    currentEditGameId.value = options.id
    loadGameData(options.id)
  }
})

// 加载游戏数据
const loadGameData = (id) => {
  // 模拟加载游戏数据
  const games = {
    1: { title: '超级跳跃游戏', description: '控制小球跳跃躲避障碍物' }
  }
  const game = games[id]
  if (game) {
    gameDescription.value = game.description
    previewTitle.value = game.title
    previewHint.value = game.description
    previewStatus.value = '📝 编辑模式'
    showBottomActions.value = true
  }
}

// 输入变化
const onInputChange = () => {
  // 可以在这里做一些实时分析
}

// 语音录制
const toggleVoice = () => {
  if (!isRecording.value) {
    isRecording.value = true
    // 开始录音
    uni.startRecord({
      success: () => {
        console.log('录音开始')
      }
    })
  } else {
    isRecording.value = false
    // 停止录音
    uni.stopRecord({
      success: (res) => {
        // 模拟语音转文字
        gameDescription.value += ' 我想做一个跳跃游戏，玩家控制一个小球，点击屏幕就能跳起来，要躲避红色的障碍物。'
        uni.showToast({ title: '语音识别成功', icon: 'success' })
      }
    })
  }
}

// AI生成游戏
const generateGame = async () => {
  if (!canGenerate.value) {
    uni.showToast({ title: '请先描述游戏', icon: 'none' })
    return
  }

  isGenerating.value = true
  showBottomActions.value = false
  previewStatus.value = '⚡ 正在生成...'
  streamLines.value = []

  // 模拟 AI 生成过程的 stream 输出
  const messages = isEditMode.value ? [
    { type: 'command', text: '> ai modify --mode="edit"' },
    { type: 'info', text: '分析修改需求...' },
    { type: 'success', text: '✓ 需求分析完成' },
    { type: 'command', text: '> ai generate --type="game_logic"' },
    { type: 'code', text: '正在更新游戏逻辑...' },
    { type: 'info', text: '更新碰撞检测算法' },
    { type: 'success', text: '✓ 游戏逻辑更新完成' },
    { type: 'command', text: '> ai build --optimize' },
    { type: 'success', text: '✅ 游戏修改成功！' }
  ] : [
    { type: 'command', text: '> ai create --type="html5_game"' },
    { type: 'info', text: '初始化游戏项目...' },
    { type: 'success', text: '✓ 项目初始化完成' },
    { type: 'command', text: '> ai analyze' },
    { type: 'info', text: '分析游戏描述...' },
    { type: 'info', text: '识别游戏类型: 动作游戏' },
    { type: 'success', text: '✓ 需求分析完成' },
    { type: 'command', text: '> ai generate --type="game_engine"' },
    { type: 'code', text: '正在生成游戏引擎...' },
    { type: 'success', text: '✓ 游戏引擎生成完成' },
    { type: 'command', text: '> ai generate --type="game_logic"' },
    { type: 'code', text: '正在生成游戏逻辑...' },
    { type: 'success', text: '✓ 游戏逻辑生成完成' },
    { type: 'command', text: '> ai render --type="visuals"' },
    { type: 'code', text: '正在生成游戏画面...' },
    { type: 'success', text: '✓ 画面渲染完成' },
    { type: 'command', text: '> ai build' },
    { type: 'success', text: '✅ 游戏生成成功！' }
  ]

  // 逐行显示
  for (let i = 0; i < messages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 300))
    streamLines.value.push(messages[i])
    scrollTop.value = 999999
  }

  // 生成完成
  await new Promise(resolve => setTimeout(resolve, 500))
  isGenerating.value = false

  // 更新预览
  const gameInfo = analyzeDescription(gameDescription.value)
  previewTitle.value = gameInfo.title
  previewHint.value = gameInfo.hint
  previewStatus.value = '✅ 完成'
  showBottomActions.value = true

  uni.showToast({
    title: isEditMode.value ? '游戏修改成功！' : '游戏生成成功！',
    icon: 'success'
  })
}

// 分析描述
const analyzeDescription = (desc) => {
  if (desc.includes('跳跃') || desc.includes('跳')) {
    return {
      title: '超级跳跃游戏',
      hint: '点击屏幕跳跃，躲避障碍物！'
    }
  } else if (desc.includes('猜') || desc.includes('数字')) {
    return {
      title: '猜数字游戏',
      hint: '猜猜电脑想的数字是多少！'
    }
  } else if (desc.includes('跑') || desc.includes('酷')) {
    return {
      title: '跑酷小游戏',
      hint: '跑得越远越好，加油！'
    }
  }
  return {
    title: '我的第一个游戏',
    hint: '开始你的游戏冒险吧！'
  }
}

// 试玩游戏
const testGame = () => {
  const gameInfo = analyzeDescription(gameDescription.value)
  uni.navigateTo({
    url: `/pages/play/index?title=${gameInfo.title}&preview=true`
  })
}

// 保存游戏
const saveGame = () => {
  uni.showModal({
    title: '保存游戏',
    content: '确定要将这个游戏保存到"我的作品"吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '游戏已保存！', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: 160rpx;
}

.preview-section {
  margin: 30rpx;
}

.preview-header {
  margin-bottom: 30rpx;
}

.preview-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
}

.preview-status {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;

  &.status-waiting {
    background: $bg-color;
    color: $text-hint;
  }

  &.status-generating {
    background: $warning-color;
    color: $white;
  }

  &.status-success {
    background: $success-color;
    color: $white;
  }
}

.preview-thumbnail {
  width: 100%;
  min-height: 400rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &.generating {
    background: #1a1a1a;
    min-height: 500rpx;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 30rpx;
  }
}

.preview-content {
  text-align: center;
  color: $white;
  padding: 60rpx 30rpx;
}

.preview-title-large {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  text-shadow: 4rpx 4rpx 8rpx rgba(0, 0, 0, 0.3);
}

.preview-icon {
  font-size: 100rpx;
}

.preview-hint {
  font-size: 28rpx;
  margin-top: 20rpx;
  opacity: 0.9;
}

/* Stream 输出样式 */
.stream-output {
  width: 100%;
  height: 100%;
  max-height: 460rpx;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 24rpx;
  line-height: 1.8;
  color: #00ff00;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.stream-line {
  margin-bottom: 10rpx;

  &.line-command {
    color: #00bfff;
  }

  &.line-success {
    color: #00ff00;
  }

  &.line-error {
    color: #ff4444;
  }

  &.line-info {
    color: #ffaa00;
  }

  &.line-code {
    color: #aa00ff;
  }
}

.cursor {
  display: inline-block;
  width: 16rpx;
  height: 30rpx;
  background: #00ff00;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 输入区域 */
.input-section {
  margin: 0 30rpx 30rpx;
}

.input-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 24rpx;
  border: 2rpx solid $border-color;
  border-radius: 24rpx;
  font-size: 30rpx;
  background: $white;
  box-sizing: border-box;
  margin-bottom: 20rpx;
}

.input-actions {
  gap: 20rpx;
}

.voice-btn {
  width: 80rpx;
  height: 80rpx;
  background: $bg-color;
  border: none;
  border-radius: 16rpx;
  font-size: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.recording {
    background: #fee;
    color: #f44;
    animation: pulse 1s infinite;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.generate-btn {
  flex: 1;
  padding: 20rpx 32rpx;
  font-size: 30rpx;
}

.btn-disabled {
  opacity: 0.5;
}

/* 底部操作按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $white;
  padding: 24rpx 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 20rpx;
  z-index: 100;
}

.action-btn {
  flex: 1;
  padding: 24rpx;
  font-size: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.action-icon {
  font-size: 36rpx;
}
</style>
