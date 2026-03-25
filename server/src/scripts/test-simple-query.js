/**
 * 简单查询测试 - 测试AI对"你是谁"的响应
 */

require('dotenv').config();
const OpenAI = require('openai');
const logger = require('../utils/logger');

async function testSimpleQuery() {
  logger.info('🧪 测试AI简单查询...\n');

  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;
  const model = process.env.OPENAI_MODEL || 'glm-4-plus';

  if (!apiKey) {
    logger.error('❌ 未配置 OPENAI_API_KEY');
    return;
  }

  logger.info(`📡 使用模型: ${model}`);
  logger.info(`🌐 API端点: ${baseURL}\n`);

  const client = new OpenAI({
    apiKey,
    baseURL,
  });

  try {
    logger.info('📤 发送问题: "你是谁"');

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: '你是一个友好的AI助手，请用简洁的语言回答问题。'
        },
        {
          role: 'user',
          content: '你是谁'
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const answer = response.choices[0].message.content;

    logger.info('📥 AI回复:\n');
    console.log('━'.repeat(60));
    console.log(answer);
    console.log('━'.repeat(60));
    console.log(`\n✅ 测试成功`);
    console.log(`   Token使用: ${response.usage.total_tokens} tokens`);
    console.log(`   提示词: ${response.usage.prompt_tokens} tokens`);
    console.log(`   完成: ${response.usage.completion_tokens} tokens`);

  } catch (error) {
    logger.error(`❌ 测试失败: ${error.message}`);
    if (error.response) {
      console.error('   响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testSimpleQuery().catch(error => {
  logger.error('测试失败:', error);
  process.exit(1);
});
