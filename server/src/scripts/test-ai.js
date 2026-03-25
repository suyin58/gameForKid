/**
 * AI服务测试脚本
 *
 * 功能：
 * - 测试AI服务初始化
 * - 测试游戏生成功能
 * - 测试游戏修改功能
 */

require('dotenv').config();
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * 测试AI服务
 */
async function testAIService() {
  logger.info('🧪 开始测试AI服务...\n');

  // 测试1: 初始化
  logger.info('测试1: 初始化AI服务');
  const initialized = aiService.initialize();

  if (!initialized) {
    logger.warn('⚠️  AI服务初始化失败或未配置API密钥');
    logger.warn('   请在.env文件中设置 OPENAI_API_KEY');
    logger.info('\n💡 提示：如果没有API密钥，可以跳过此测试');
    return;
  }

  logger.info('✅ AI服务初始化成功\n');

  // 测试2: 检查服务可用性
  logger.info('测试2: 检查服务可用性');
  const isAvailable = aiService.isAvailable();
  logger.info(`AI服务可用: ${isAvailable ? '是' : '否'}\n`);

  if (!isAvailable) {
    logger.error('❌ AI服务不可用，测试终止');
    return;
  }

  // 测试3: 生成简单游戏
  logger.info('测试3: 生成简单游戏（流式输出）');
  try {
    console.log('--- 开始生成游戏 ---\n');

    const result = await aiService.generateGameStream(
      '一个简单的点击游戏，点击屏幕上的圆点得分',
      'casual',
      (chunk) => {
        if (chunk.type === 'status') {
          console.log(`📊 ${chunk.message}`);
        } else if (chunk.type === 'content') {
          process.stdout.write('.'); // 显示进度
        } else if (chunk.type === 'error') {
          console.log(`\n❌ 错误: ${chunk.message}`);
        }
      }
    );

    console.log('\n--- 生成完成 ---');
    console.log(`标题: ${result.title}`);
    console.log(`类型: ${result.type}`);
    console.log(`代码长度: ${result.code.length} 字符`);
    console.log(`代码预览:`);
    console.log(result.code.substring(0, 200) + '...\n');

    logger.info('✅ 游戏生成测试通过\n');
  } catch (error) {
    logger.error(`❌ 游戏生成测试失败: ${error.message}\n`);
  }

  // 测试4: 修改游戏（如果生成成功）
  logger.info('测试4: 修改游戏');
  try {
    const testCode = `<!DOCTYPE html>
<html>
<head>
  <title>测试游戏</title>
</head>
<body>
  <h1>点击游戏</h1>
  <div id="score">得分: 0</div>
  <button onclick="addScore()">点击我</button>
  <script>
    let score = 0;
    function addScore() {
      score++;
      document.getElementById('score').textContent = '得分: ' + score;
    }
  </script>
</body>
</html>`;

    const result = await aiService.modifyGameStream(
      testCode,
      '把按钮改成红色，添加音效',
      (chunk) => {
        if (chunk.type === 'status') {
          console.log(`📊 ${chunk.message}`);
        } else if (chunk.type === 'content') {
          process.stdout.write('.');
        }
      }
    );

    console.log('\n--- 修改完成 ---');
    console.log(`修改后代码长度: ${result.code.length} 字符\n`);

    logger.info('✅ 游戏修改测试通过\n');
  } catch (error) {
    logger.error(`❌ 游戏修改测试失败: ${error.message}\n`);
  }

  logger.info('🎉 所有测试完成！');
}

// 运行测试
testAIService().catch(error => {
  logger.error('测试失败:', error);
  process.exit(1);
});
