<template>
  <view class="voice-input">
    <view class="voice-input__textarea-wrapper">
      <textarea
        v-model="textValue"
        class="voice-input__textarea"
        placeholder="描述你想做的游戏..."
        :maxlength="500"
        :auto-height="true"
        @input="handleInput"
      />
    </view>

    <!-- 示例提示 -->
    <view v-if="showExamples && !textValue" class="voice-input__examples">
      <text class="voice-input__example-title">💡 试试这样描述：</text>
      <view
        v-for="(example, index) in examples"
        :key="index"
        class="voice-input__example-item"
        @tap="handleSelectExample(example)"
      >
        <text class="voice-input__example-text">{{ example }}</text>
      </view>
    </view>

    <!-- 语音按钮 -->
    <view
      class="voice-input__button"
      :class="{ 'voice-input__button--recording': recording }"
      @tapstart="handleStartRecord"
      @touchend="handleStopRecord"
      @touchcancel="handleCancelRecord"
    >
      <view class="voice-input__button-inner">
        <text class="voice-input__button-icon">🎙️</text>
        <text class="voice-input__button-text">
          {{ recording ? '松开结束' : '按住说话' }}
        </text>
      </view>
    </view>

    <!-- 录音动画 -->
    <view v-if="recording" class="voice-input__recording-animation">
      <view class="voice-input__wave">
        <view class="voice-input__wave-bar"></view>
        <view class="voice-input__wave-bar"></view>
        <view class="voice-input__wave-bar"></view>
      </view>
      <text class="voice-input__recording-text">正在录音...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import voiceRecorder from '@/utils/voice'
import { useAppStore } from '@/store/modules/app'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  showExamples: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'input'])

const appStore = useAppStore()
const textValue = ref(props.modelValue)
const recording = ref(false)

const examples = [
  '我想做一个跳跃游戏，主角是一只小兔子，要躲避障碍物吃到胡萝卜',
  '做一个打地鼠游戏，速度要快一些',
  '猜数字游戏，猜对有奖励'
]

const handleInput = (e) => {
  textValue.value = e.detail.value
  emit('update:modelValue', e.detail.value)
  emit('input', e.detail.value)
}

const handleSelectExample = (example) => {
  textValue.value = example
  emit('update:modelValue', example)
  emit('input', example)
}

const handleStartRecord = async () => {
  try {
    await voiceRecorder.startRecord()
    recording.value = true
  } catch (error) {
    appStore.showToast('录音失败，请检查麦克风权限')
  }
}

const handleStopRecord = async () => {
  if (!recording.value) return

  try {
    appStore.showLoading('识别中...')

    const { tempFilePath } = await voiceRecorder.stopRecord()
    const text = await voiceRecorder.translateVoice(tempFilePath)

    if (text) {
      textValue.value = text
      emit('update:modelValue', text)
      emit('input', text)
    }

    recording.value = false
    appStore.hideLoading()
  } catch (error) {
    recording.value = false
    appStore.hideLoading()
    appStore.showToast('语音识别失败，请重试')
  }
}

const handleCancelRecord = () => {
  recording.value = false
  voiceRecorder.stopRecord()
}
</script>

<style lang="scss" scoped>
.voice-input {
  padding: var(--spacing-md);
}

.voice-input__textarea-wrapper {
  margin-bottom: var(--spacing-md);
}

.voice-input__textarea {
  width: 100%;
  min-height: 200rpx;
  padding: var(--spacing-md);
  background: var(--bg-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  line-height: 1.6;
}

.voice-input__examples {
  margin-bottom: var(--spacing-md);
}

.voice-input__example-title {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.voice-input__example-item {
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-xs);
  background: var(--white);
  border-radius: var(--radius-sm);
  border-left: 4rpx solid var(--primary-color);
}

.voice-input__example-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.5;
}

.voice-input__button {
  margin-top: var(--spacing-md);
}

.voice-input__button-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--primary-color);
  border-radius: var(--radius-lg);
  transition: all 0.3s;

  &:active {
    background: var(--primary-dark);
    transform: scale(0.98);
  }
}

.voice-input__button--recording .voice-input__button-inner {
  background: var(--danger-color);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.voice-input__button-icon {
  font-size: 48rpx;
}

.voice-input__button-text {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--white);
}

.voice-input__recording-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
}

.voice-input__wave {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 80rpx;
}

.voice-input__wave-bar {
  width: 8rpx;
  height: 40rpx;
  background: var(--primary-color);
  border-radius: 4rpx;
  animation: wave 1s ease-in-out infinite;

  &:nth-child(1) {
    animation-delay: 0s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes wave {
  0%, 100% {
    height: 40rpx;
  }
  50% {
    height: 80rpx;
  }
}

.voice-input__recording-text {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
</style>
