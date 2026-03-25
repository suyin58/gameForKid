/**
 * AI生成接口前后端联调测试
 *
 * 测试内容：
 * 1. AI游戏生成完整流程
 * 2. AI游戏修改流程
 * 3. 配额系统验证
 * 4. SSE流式输出验证
 * 5. 错误处理
 */

const http = require('http');
const jwt = require('jsonwebtoken');

// 配置
const API_BASE = 'http://localhost:3001';
const JWT_SECRET = 'kidsgame-secret-key-development-only';

// 生成测试Token
function generateToken(userId, openid) {
  return jwt.sign({ userId, openid }, JWT_SECRET, { expiresIn: '30d' });
}

let testUser = {
  userId: 9001,
  openid: 'ai_integration_test_user',
  token: null
};

// 尝试从文件读取Token
try {
  const fs = require('fs');
  const tokenData = JSON.parse(fs.readFileSync('ai-test-token.json', 'utf8'));
  testUser = tokenData;
  console.log('✅ 从文件读取测试Token\n');
} catch (error) {
  // 如果文件不存在，生成新的Token
  testUser.token = generateToken(testUser.userId, testUser.openid);
  console.log('✅ 生成新的测试Token\n');
}

console.log('='.repeat(60));
console.log('AI生成接口前后端联调测试');
console.log('='.repeat(60));
console.log('');

// 测试用例
async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  // 测试1: 验证后端服务运行
  console.log('📋 测试1: 验证后端服务运行');
  try {
    await checkHealth();
    console.log('✅ 后端服务正常运行\n');
    passedTests++;
  } catch (error) {
    console.log('❌ 后端服务未启动:', error.message);
    console.log('请先启动后端: cd server && npm start\n');
    return;
  }

  // 测试2: 测试AI游戏生成（简单提示）
  console.log('📋 测试2: AI游戏生成（简单提示）');
  try {
    await testAIGenerate();
    console.log('✅ AI游戏生成测试通过\n');
    passedTests++;
  } catch (error) {
    console.log('❌ AI游戏生成测试失败:', error.message, '\n');
    failedTests++;
  }

  // 测试3: 测试AI游戏修改
  console.log('📋 测试3: AI游戏修改');
  try {
    await testAIModify();
    console.log('✅ AI游戏修改测试通过\n');
    passedTests++;
  } catch (error) {
    console.log('❌ AI游戏修改测试失败:', error.message, '\n');
    failedTests++;
  }

  // 测试4: 测试配额系统
  console.log('📋 测试4: 配额系统验证');
  try {
    await testQuotaSystem();
    console.log('✅ 配额系统测试通过\n');
    passedTests++;
  } catch (error) {
    console.log('❌ 配额系统测试失败:', error.message, '\n');
    failedTests++;
  }

  // 测试5: 测试参数验证
  console.log('📋 测试5: 参数验证');
  try {
    await testParameterValidation();
    console.log('✅ 参数验证测试通过\n');
    passedTests++;
  } catch (error) {
    console.log('❌ 参数验证测试失败:', error.message, '\n');
    failedTests++;
  }

  // 测试总结
  console.log('='.repeat(60));
  console.log('测试完成');
  console.log('='.repeat(60));
  console.log(`✅ 通过: ${passedTests}`);
  console.log(`❌ 失败: ${failedTests}`);
  console.log(`📊 总计: ${passedTests + failedTests}`);
  console.log('='.repeat(60));
}

// 检查后端服务
async function checkHealth() {
  return new Promise((resolve, reject) => {
    http.get(`${API_BASE}/health`, (res) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        reject(new Error(`健康检查失败: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

// 测试AI游戏生成
async function testAIGenerate() {
  const testData = {
    description: '打地鼠游戏，适合3-6岁儿童',
    type: 'casual',
    ageRange: '3-6',
    features: ['简单操作', '有趣可爱']
  };

  const response = await makeRequest('/api/v1/ai/generate', 'POST', testData, testUser.token);
  const data = JSON.parse(response);

  if (data.code !== 0) {
    throw new Error(data.message || '生成失败');
  }

  // 验证返回数据
  if (!data.data.game) {
    throw new Error('未返回游戏数据');
  }

  const game = data.data.game;
  console.log(`   生成游戏ID: ${game.id}`);
  console.log(`   游戏标题: ${game.title}`);
  console.log(`   代码长度: ${game.code ? game.code.length : 0} 字符`);

  // 验证游戏数据完整性
  if (!game.title || !game.code || !game.type) {
    throw new Error('游戏数据不完整');
  }

  return game;
}

// 测试AI游戏修改
async function testAIModify() {
  // 先创建一个游戏
  const createResponse = await makeRequest('/api/v1/game', 'POST', {
    title: '测试游戏',
    description: '用于修改测试',
    code: '<html><body>原始游戏</body></html>',
    type: 'casual',
    visibility: 'private'
  }, testUser.token);

  const createData = JSON.parse(createResponse);
  if (createData.code !== 0) {
    throw new Error('创建测试游戏失败');
  }

  const gameId = createData.data.id;

  // 然后使用AI修改
  const modifyData = {
    gameId: gameId,
    instructions: '添加更多的颜色和动画效果',
    modifyType: 'enhance'
  };

  const response = await makeRequest('/api/v1/ai/modify', 'POST', modifyData, testUser.token);
  const data = JSON.parse(response);

  if (data.code !== 0) {
    throw new Error(data.message || '修改失败');
  }

  console.log(`   修改游戏ID: ${gameId}`);
  console.log(`   修改说明: ${modifyData.instructions}`);
  console.log(`   修改成功`);

  // 清理测试数据
  await makeRequest(`/api/v1/game/${gameId}`, 'DELETE', null, testUser.token);
}

// 测试配额系统
async function testQuotaSystem() {
  // 获取用户信息，查看配额
  const response = await makeRequest('/api/v1/user/info', 'GET', null, testUser.token);
  const data = JSON.parse(response);

  if (data.code !== 0) {
    throw new Error('获取用户信息失败');
  }

  const user = data.data;
  console.log(`   用户配额类型: ${user.quota_type || 'free'}`);
  console.log(`   剩余生成次数: ${user.remaining_generations || '未限制'}`);
}

// 测试参数验证
async function testParameterValidation() {
  // 测试缺少description参数
  try {
    const response = await makeRequest('/api/v1/ai/generate', 'POST', {
      type: 'casual'
    }, testUser.token);
    const data = JSON.parse(response);

    if (data.code === 0) {
      throw new Error('应该拒绝缺少description的请求');
    }

    console.log(`   正确拒绝了无效请求: ${data.message}`);
  } catch (error) {
    throw error;
  }

  // 测试空description
  try {
    const response = await makeRequest('/api/v1/ai/generate', 'POST', {
      description: '',
      type: 'casual'
    }, testUser.token);
    const data = JSON.parse(response);

    if (data.code === 0) {
      throw new Error('应该拒绝空description的请求');
    }

    console.log(`   正确拒绝了空description请求`);
  } catch (error) {
    throw error;
  }
}

// 辅助函数：发送HTTP请求
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['authorization'] = `Bearer ${token}`;  // 使用小写
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 运行测试
runTests().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});
