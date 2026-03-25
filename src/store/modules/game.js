import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { gameApi } from '@/services/game'

export const useGameStore = defineStore('game', () => {
  // 状态
  const myGames = ref([])
  const squareGames = ref([])
  const currentGame = ref(null)
  const currentDraft = ref(null)

  // 计算属性
  const publicGames = computed(() =>
    myGames.value.filter(game => game.visibility === 'public')
  )

  const privateGames = computed(() =>
    myGames.value.filter(game => game.visibility === 'private')
  )

  /**
   * 获取我的游戏列表
   */
  const fetchMyGames = async () => {
    try {
      const res = await gameApi.getMyGames()
      if (res.code === 0) {
        myGames.value = res.data.list || []
        return true
      }
      return false
    } catch (error) {
      console.error('获取游戏列表失败:', error)
      return false
    }
  }

  /**
   * 获取广场游戏列表
   */
  const fetchSquareGames = async (params = {}) => {
    try {
      const res = await gameApi.getPublicGames(params)
      if (res.code === 0) {
        squareGames.value = res.data.list || []
        return true
      }
      return false
    } catch (error) {
      console.error('获取广场游戏失败:', error)
      return false
    }
  }

  /**
   * 获取游戏详情
   */
  const fetchGameDetail = async (gameId) => {
    try {
      const res = await gameApi.getGameDetail(gameId)
      if (res.code === 0) {
        currentGame.value = res.data
        return res.data
      }
      return null
    } catch (error) {
      console.error('获取游戏详情失败:', error)
      return null
    }
  }

  /**
   * 创建游戏
   */
  const createGame = async (data) => {
    try {
      const res = await gameApi.createGame(data)
      if (res.code === 0) {
        myGames.value.unshift(res.data)
        return res.data
      }
      return null
    } catch (error) {
      console.error('创建游戏失败:', error)
      return null
    }
  }

  /**
   * 更新游戏
   */
  const updateGame = async (gameId, data) => {
    try {
      const res = await gameApi.updateGame(gameId, data)
      if (res.code === 0) {
        const index = myGames.value.findIndex(g => g._id === gameId)
        if (index !== -1) {
          myGames.value[index] = res.data
        }
        if (currentGame.value?._id === gameId) {
          currentGame.value = res.data
        }
        return true
      }
      return false
    } catch (error) {
      console.error('更新游戏失败:', error)
      return false
    }
  }

  /**
   * 删除游戏
   */
  const deleteGame = async (gameId) => {
    try {
      const res = await gameApi.deleteGame(gameId)
      if (res.code === 0) {
        myGames.value = myGames.value.filter(g => g._id !== gameId)
        return true
      }
      return false
    } catch (error) {
      console.error('删除游戏失败:', error)
      return false
    }
  }

  /**
   * 发布游戏到广场
   */
  const publishGame = async (gameId, publishData) => {
    try {
      const res = await gameApi.publishGame(gameId, publishData)
      if (res.code === 0) {
        const index = myGames.value.findIndex(g => g._id === gameId)
        if (index !== -1) {
          myGames.value[index] = res.data
        }
        return true
      }
      return false
    } catch (error) {
      console.error('发布游戏失败:', error)
      return false
    }
  }

  /**
   * 克隆游戏
   */
  const cloneGame = async (gameId) => {
    try {
      const res = await gameApi.cloneGame(gameId)
      if (res.code === 0) {
        myGames.value.unshift(res.data)
        return res.data
      }
      return null
    } catch (error) {
      console.error('克隆游戏失败:', error)
      return null
    }
  }

  /**
   * 保存草稿
   */
  const saveDraft = (draft) => {
    currentDraft.value = draft
    uni.setStorageSync('game_draft', draft)
  }

  /**
   * 加载草稿
   */
  const loadDraft = () => {
    const draft = uni.getStorageSync('game_draft')
    if (draft) {
      currentDraft.value = draft
      return draft
    }
    return null
  }

  /**
   * 清空草稿
   */
  const clearDraft = () => {
    currentDraft.value = null
    uni.removeStorageSync('game_draft')
  }

  return {
    myGames,
    squareGames,
    currentGame,
    currentDraft,
    publicGames,
    privateGames,
    fetchMyGames,
    fetchSquareGames,
    fetchGameDetail,
    createGame,
    updateGame,
    deleteGame,
    publishGame,
    cloneGame,
    saveDraft,
    loadDraft,
    clearDraft
  }
})
