import { Config } from '@/config/constants'

/**
 * 语音识别工具
 */
class VoiceRecorder {
  constructor() {
    this.recording = false
    this.tempFilePath = ''
  }

  /**
   * 开始录音
   */
  async startRecord() {
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      uni.getRecorderManager().onStart(() => {
        this.recording = true
        resolve()
      })

      uni.getRecorderManager().onError((err) => {
        this.recording = false
        reject(err)
      })

      uni.getRecorderManager().start({
        duration: Config.VOICE_MAX_DURATION,
        format: 'mp3'
      })
      // #endif

      // #ifdef H5
      // H5环境使用Web Audio API（需要额外实现）
      reject(new Error('H5环境暂不支持语音识别'))
      // #endif
    })
  }

  /**
   * 停止录音
   */
  async stopRecord() {
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      const recorderManager = uni.getRecorderManager()

      recorderManager.onStop((res) => {
        this.recording = false
        this.tempFilePath = res.tempFilePath
        resolve(res)
      })

      recorderManager.onError((err) => {
        this.recording = false
        reject(err)
      })

      if (this.recording) {
        recorderManager.stop()
      } else {
        reject(new Error('未在录音中'))
      }
      // #endif

      // #ifdef H5
      reject(new Error('H5环境暂不支持语音识别'))
      // #endif
    })
  }

  /**
   * 语音转文字
   */
  async translateVoice(filePath) {
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      uni.translateVoice({
        filePath,
        complete: (res) => {
          if (res.statusCode === 200) {
            resolve({
              text: res.result,
              localId: res.localId
            })
          } else {
            reject(new Error('语音识别失败'))
          }
        }
      })
      // #endif

      // #ifdef H5
      reject(new Error('H5环境暂不支持语音识别'))
      // #endif
    })
  }

  /**
   * 一键录音并转文字
   */
  async recordAndTranslate() {
    try {
      await this.startRecord()
      const { tempFilePath } = await this.stopRecord()
      const result = await this.translateVoice(tempFilePath)
      return result.text
    } catch (error) {
      throw error
    }
  }
}

export default new VoiceRecorder()
