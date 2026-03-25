/**
 * AI服务配置文件
 *
 * 功能：
 * - 配置OpenAI API密钥和端点
 * - 配置模型参数
 * - 支持自定义OpenAI兼容的API（如Azure OpenAI、国内代理等）
 */

const { env } = require('./env');

/**
 * AI服务配置
 */
const aiConfig = {
  // OpenAI API配置
  openai: {
    // API密钥（从环境变量读取，开发环境有默认值）
    apiKey: env.openaiApiKey || process.env.OPENAI_API_KEY || '',

    // API基础URL（支持OpenAI兼容的代理）
    // 生产环境必须配置，开发环境使用默认值
    baseURL: env.openaiBaseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',

    // 使用的模型
    model: env.openaiModel || process.env.OPENAI_MODEL || 'glm-4-plus',

    // 备用模型（如果主模型失败）
    fallbackModel: 'glm-4-flash',
  },

  // 生成参数配置
  generation: {
    // 最大Token数（生成代码需要较多Token）
    maxTokens: 4000,

    // 温度（0-1，越高越随机，儿童游戏建议保持较低值）
    temperature: 0.7,

    // Top P采样
    topP: 0.9,

    // 停止序列
    stop: null,

    // 超时时间（毫秒）
    timeout: 60000, // 60秒
  },

  // 流式输出配置
  stream: {
    // 是否启用流式输出
    enabled: true,

    // 流式输出的分块大小
    chunkSize: 100,
  },

  // 重试配置
  retry: {
    // 最大重试次数
    maxRetries: 2,

    // 重试延迟（毫秒）
    retryDelay: 1000,

    // 可重试的错误类型
    retryableErrors: [
      'rate_limit_exceeded',
      'server_error',
      'timeout',
    ],
  },

  // 安全配置
  safety: {
    // 内容过滤
    enableContentFilter: true,

    // 代码注入检测
    enableCodeInjectionDetection: true,

    // 最大代码长度（字符数）
    maxCodeLength: 500000, // 500KB
  },
};

/**
 * 获取AI配置
 * @param {string} key - 配置键（支持点号分隔的路径）
 * @returns {*} 配置值
 */
function getConfig(key) {
  const keys = key.split('.');
  let value = aiConfig;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * 验证AI配置是否完整
 * @returns {Object} { valid: boolean, missing: string[] }
 */
function validateConfig() {
  const missing = [];

  if (!aiConfig.openai.apiKey) {
    missing.push('OPENAI_API_KEY');
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

module.exports = {
  aiConfig,
  getConfig,
  validateConfig,
};
