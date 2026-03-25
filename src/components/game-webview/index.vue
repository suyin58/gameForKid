<template>
  <view class="game-webview">
    <web-view
      v-if="gameCode"
      :src="gameUrl"
      class="game-webview__container"
      @message="handleMessage"
      @error="handleError"
    />
    <view v-else class="game-webview__empty">
      <text>游戏加载失败</text>
    </view>
  </view>
</template>

<script setup>
import { computed, defineProps, defineEmits, onMounted } from 'vue'

const props = defineProps({
  gameCode: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['message', 'error'])

// 将HTML代码转换为data URL
const gameUrl = computed(() => {
  if (!props.gameCode) return ''

  const html = props.gameCode
  const base64 = btoa(unescape(encodeURIComponent(html)))
  return `data:text/html;charset=utf-8;base64,${base64}`
})

const handleMessage = (e) => {
  emit('message', e.detail)
}

const handleError = (e) => {
  emit('error', e)
}

onMounted(() => {
  console.log('Game WebView mounted')
})
</script>

<style lang="scss" scoped>
.game-webview {
  width: 100%;
  height: 100vh;
}

.game-webview__container {
  width: 100%;
  height: 100%;
}

.game-webview__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--bg-color);
}
</style>
