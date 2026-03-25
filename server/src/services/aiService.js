/**
 * AI服务层
 *
 * 功能：
 * - 调用OpenAI API生成游戏
 * - 支持流式输出
 * - 错误处理和重试
 * - 内容安全检查
 */

const OpenAI = require('openai');
const { aiConfig, validateConfig } = require('../config/ai.config');
const { buildGeneratePrompt, buildModifyPrompt, suggestGameTitle } = require('../prompts/game-prompts');
const logger = require('../utils/logger');

/**
 * AI服务类
 */
class AIService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  /**
   * 初始化AI服务
   */
  initialize() {
    try {
      // 验证配置
      const configValidation = validateConfig();
      if (!configValidation.valid) {
        logger.warn(`⚠️  AI配置不完整: ${configValidation.missing.join(', ')}`);
        logger.warn('⚠️  AI功能将不可用，请在生产环境配置OPENAI_API_KEY');
        return false;
      }

      // 初始化OpenAI客户端
      this.client = new OpenAI({
        apiKey: aiConfig.openai.apiKey,
        baseURL: aiConfig.openai.baseURL,
      });

      this.initialized = true;
      logger.info('✅ AI服务初始化成功');
      logger.info(`📡 使用模型: ${aiConfig.openai.model}`);
      logger.info(`🌐 API端点: ${aiConfig.openai.baseURL}`);

      return true;
    } catch (error) {
      logger.error('❌ AI服务初始化失败:', error.message);
      this.initialized = false;
      return false;
    }
  }

  /**
   * 检查服务是否可用
   */
  isAvailable() {
    return this.initialized && this.client !== null;
  }

  /**
   * 生成游戏
   * @param {string} userDescription - 用户的游戏描述
   * @param {string} gameType - 游戏类型
   * @param {Function} onProgress - 进度回调（可选）
   * @returns {Promise<Object>} 生成结果
   */
  async generateGame(userDescription, gameType = 'casual', onProgress = null) {
    if (!this.isAvailable()) {
      throw new Error('AI服务未初始化或配置不完整');
    }

    try {
      logger.info(`🎮 开始生成游戏: ${userDescription}`);

      // 构建Prompt
      const prompt = buildGeneratePrompt(userDescription, gameType);

      // 生成标题
      const title = suggestGameTitle(userDescription);

      // 发送进度
      if (onProgress) {
        onProgress({ type: 'status', message: '📋 正在分析描述...' });
      }

      // 调用OpenAI API
      const completion = await this._callWithRetry(async () => {
        return await this.client.chat.completions.create({
          model: aiConfig.openai.model,
          messages: [
            { role: 'system', content: '你是一个专业的儿童游戏开发者。' },
            { role: 'user', content: prompt },
          ],
          max_tokens: aiConfig.generation.maxTokens,
          temperature: aiConfig.generation.temperature,
          top_p: aiConfig.generation.topP,
        });
      }, onProgress);

      // 提取生成的代码
      const code = this._extractCode(completion.choices[0].message.content);

      // 验证生成的代码
      this._validateGeneratedCode(code);

      logger.info('✅ 游戏生成成功');

      return {
        title,
        description: userDescription,
        code,
        type: gameType,
        model: aiConfig.openai.model,
        tokensUsed: completion.usage.total_tokens,
      };
    } catch (error) {
      logger.error('❌ 游戏生成失败:', error.message);
      throw error;
    }
  }

  /**
   * 流式生成游戏（支持实时进度推送）
   * @param {string} userDescription - 用户的游戏描述
   * @param {string} gameType - 游戏类型
   * @param {Function} onChunk - 接收数据块的回调
   * @returns {Promise<Object>} 生成结果
   */
  async generateGameStream(userDescription, gameType = 'casual', onChunk = null) {
    if (!this.isAvailable()) {
      throw new Error('AI服务未初始化或配置不完整');
    }

    try {
      logger.info(`🎮 开始流式生成游戏: ${userDescription}`);

      // 构建Prompt
      const prompt = buildGeneratePrompt(userDescription, gameType);

      // 生成标题
      const title = suggestGameTitle(userDescription);

      // 发送初始状态
      if (onChunk) {
        onChunk({ type: 'status', message: '📋 正在分析描述...' });
      }

      let fullContent = '';

      // 调用OpenAI流式API
      const stream = await this.client.chat.completions.create({
        model: aiConfig.openai.model,
        messages: [
          { role: 'system', content: '你是一个专业的儿童游戏开发者。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: aiConfig.generation.maxTokens,
        temperature: aiConfig.generation.temperature,
        top_p: aiConfig.generation.topP,
        stream: true,
      });

      // 处理流式响应
      let stepIndex = 0;
      const steps = [
        '🎨 设计游戏角色...',
        '🎮 生成游戏逻辑...',
        '✨ 优化游戏体验...',
      ];

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullContent += content;

        // 发送进度更新
        if (onChunk && Math.random() < 0.1) { // 偶尔发送进度
          const step = steps[Math.min(stepIndex, steps.length - 1)];
          onChunk({ type: 'status', message: step });
          stepIndex++;
        }

        // 发送内容片段
        if (onChunk && content.length > 0) {
          onChunk({ type: 'content', data: content });
        }
      }

      // 提取并验证代码
      const code = this._extractCode(fullContent);
      this._validateGeneratedCode(code);

      // 发送完成消息
      if (onChunk) {
        onChunk({ type: 'status', message: '✅ 生成完成！' });
      }

      logger.info('✅ 流式游戏生成成功');

      return {
        title,
        description: userDescription,
        code,
        type: gameType,
        model: aiConfig.openai.model,
      };
    } catch (error) {
      logger.error('❌ 流式游戏生成失败:', error.message);

      // 发送错误消息
      if (onChunk) {
        onChunk({
          type: 'error',
          code: error.code || 5000,
          message: error.message || 'AI生成失败，请重试'
        });
      }

      throw error;
    }
  }

  /**
   * 修改游戏
   * @param {string} currentCode - 当前游戏代码
   * @param {string} modifyDescription - 修改要求
   * @param {Function} onProgress - 进度回调（可选）
   * @returns {Promise<Object>} 修改结果
   */
  async modifyGame(currentCode, modifyDescription, onProgress = null) {
    if (!this.isAvailable()) {
      throw new Error('AI服务未初始化或配置不完整');
    }

    try {
      logger.info(`🔧 开始修改游戏: ${modifyDescription}`);

      // 构建Prompt
      const prompt = buildModifyPrompt(currentCode, modifyDescription);

      // 发送进度
      if (onProgress) {
        onProgress({ type: 'status', message: '📋 正在分析修改要求...' });
      }

      // 调用OpenAI API
      const completion = await this._callWithRetry(async () => {
        return await this.client.chat.completions.create({
          model: aiConfig.openai.model,
          messages: [
            { role: 'system', content: '你是一个专业的儿童游戏开发者。' },
            { role: 'user', content: prompt },
          ],
          max_tokens: aiConfig.generation.maxTokens,
          temperature: aiConfig.generation.temperature,
        });
      }, onProgress);

      // 提取修改后的代码
      const code = this._extractCode(completion.choices[0].message.content);

      // 验证生成的代码
      this._validateGeneratedCode(code);

      logger.info('✅ 游戏修改成功');

      return {
        code,
        modifyDescription,
        model: aiConfig.openai.model,
        tokensUsed: completion.usage.total_tokens,
      };
    } catch (error) {
      logger.error('❌ 游戏修改失败:', error.message);
      throw error;
    }
  }

  /**
   * 流式修改游戏
   * @param {string} currentCode - 当前游戏代码
   * @param {string} modifyDescription - 修改要求
   * @param {Function} onChunk - 接收数据块的回调
   * @returns {Promise<Object>} 修改结果
   */
  async modifyGameStream(currentCode, modifyDescription, onChunk = null) {
    if (!this.isAvailable()) {
      throw new Error('AI服务未初始化或配置不完整');
    }

    try {
      logger.info(`🔧 开始流式修改游戏: ${modifyDescription}`);

      // 构建Prompt
      const prompt = buildModifyPrompt(currentCode, modifyDescription);

      // 发送初始状态
      if (onChunk) {
        onChunk({ type: 'status', message: '📋 正在分析修改要求...' });
      }

      let fullContent = '';

      // 调用OpenAI流式API
      const stream = await this.client.chat.completions.create({
        model: aiConfig.openai.model,
        messages: [
          { role: 'system', content: '你是一个专业的儿童游戏开发者。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: aiConfig.generation.maxTokens,
        temperature: aiConfig.generation.temperature,
        stream: true,
      });

      // 处理流式响应
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullContent += content;

        // 发送内容片段
        if (onChunk && content.length > 0) {
          onChunk({ type: 'content', data: content });
        }
      }

      // 提取并验证代码
      const code = this._extractCode(fullContent);
      this._validateGeneratedCode(code);

      // 发送完成消息
      if (onChunk) {
        onChunk({ type: 'status', message: '✅ 修改完成！' });
      }

      logger.info('✅ 流式游戏修改成功');

      return {
        code,
        modifyDescription,
        model: aiConfig.openai.model,
      };
    } catch (error) {
      logger.error('❌ 流式游戏修改失败:', error.message);

      if (onChunk) {
        onChunk({
          type: 'error',
          code: error.code || 5002,
          message: error.message || 'AI修改失败，请重试'
        });
      }

      throw error;
    }
  }

  /**
   * 带重试的API调用
   * @private
   */
  async _callWithRetry(apiCall, onProgress = null) {
    const maxRetries = aiConfig.retry.maxRetries;
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          logger.info(`🔄 重试第 ${attempt} 次...`);
          if (onProgress) {
            onProgress({ type: 'status', message: `🔄 重试中... (${attempt}/${maxRetries})` });
          }

          // 等待一段时间再重试
          await this._sleep(aiConfig.retry.retryDelay * attempt);
        }

        return await apiCall();
      } catch (error) {
        lastError = error;

        // 检查是否可重试
        if (attempt < maxRetries && this._isRetryableError(error)) {
          logger.warn(`⚠️  API调用失败，准备重试: ${error.message}`);
          continue;
        }

        break;
      }
    }

    throw lastError;
  }

  /**
   * 判断错误是否可重试
   * @private
   */
  _isRetryableError(error) {
    const retryableErrors = aiConfig.retry.retryableErrors;

    if (error.status === 429) return true; // Rate limit
    if (error.status >= 500) return true; // Server error
    if (error.code === 'timeout') return true;

    return false;
  }

  /**
   * 从AI响应中提取代码
   * @private
   */
  _extractCode(content) {
    // 移除markdown代码块标记（如果有）
    let code = content.trim();

    // 移除 ```html 和 ``` 标记
    code = code.replace(/^```html\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');

    return code;
  }

  /**
   * 验证生成的代码
   * @private
   */
  _validateGeneratedCode(code) {
    if (!code || code.length === 0) {
      throw new Error('AI未生成任何代码');
    }

    if (code.length > aiConfig.safety.maxCodeLength) {
      throw new Error(`生成的代码过长（${code.length}字符），超过限制（${aiConfig.safety.maxCodeLength}字符）`);
    }

    // 基本的HTML结构检查
    if (!code.includes('<html') && !code.includes('<HTML')) {
      throw new Error('生成的代码不是有效的HTML');
    }

    // 简单的代码注入检测（生产环境应该更严格）
    const dangerousPatterns = [
      /<script[^>]*src\s*=\s*["']https?:\/\/(?!localhost|127\.0\.0\.1)/i,
      /eval\s*\(/i,
      /document\.write\s*\(/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        logger.warn('⚠️  检测到潜在的代码注入风险');
        // 生产环境可能需要抛出错误
        // throw new Error('生成的代码包含不安全的内容');
      }
    }
  }

  /**
   * 睡眠函数
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 创建单例
const aiService = new AIService();

module.exports = aiService;
