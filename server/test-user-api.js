/**
 * 用户系统API测试脚本
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:3001/api/v1';
const JWT_SECRET = process.env.JWT_SECRET || 'kidsgame-secret-key-development-only';

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.yellow}═══ ${msg} ═══${colors.reset}`)
};

/**
 * 生成测试JWT Token
 */
function generateTestToken(userId, openid) {
  return jwt.sign(
    { userId, openid },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * 测试获取用户信息（公开接口）
 */
async function testGetUserById() {
  log.title('测试获取指定用户信息（公开接口）');

  try {
    const response = await axios.get(`${API_BASE}/user/1`);

    if (response.data.code === 0) {
      log.success('获取用户信息成功');
      console.log('   用户信息:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      log.error('获取用户信息失败: ' + response.data.message);
      return null;
    }
  } catch (error) {
    log.error('请求失败: ' + error.message);
    return null;
  }
}

/**
 * 测试获取当前用户信息（需要Token）
 */
async function testGetCurrentUser(token) {
  log.title('测试获取当前用户信息（需要Token）');

  try {
    const response = await axios.get(`${API_BASE}/user/info`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.code === 0) {
      log.success('获取当前用户信息成功');
      console.log('   用户信息:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      log.error('获取用户信息失败: ' + response.data.message);
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log.error('认证失败：Token无效或已过期');
    } else {
      log.error('请求失败: ' + error.message);
    }
    return null;
  }
}

/**
 * 测试更新用户信息（需要Token）
 */
async function testUpdateUser(token) {
  log.title('测试更新用户信息（需要Token）');

  try {
    const response = await axios.put(`${API_BASE}/user/info`,
      { nickname: '测试用户_更新', bio: '这是更新后的简介' },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.data.code === 0) {
      log.success('更新用户信息成功');
      console.log('   更新后信息:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      log.error('更新用户信息失败: ' + response.data.message);
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log.error('认证失败：Token无效或已过期');
    } else {
      log.error('请求失败: ' + error.message);
    }
    return null;
  }
}

/**
 * 测试登录接口（模拟微信登录）
 */
async function testLogin() {
  log.title('测试微信登录接口（模拟）');

  try {
    const response = await axios.post(`${API_BASE}/user/login`, {
      code: 'test_mock_code_123'
    });

    if (response.data.code === 0) {
      log.success('登录成功');
      console.log('   Token:', response.data.data.token.substring(0, 50) + '...');
      console.log('   用户信息:', JSON.stringify(response.data.data.user, null, 2));
      return response.data.data.token;
    } else {
      log.info('登录失败（预期行为，因为未配置微信AppID）: ' + response.data.message);
      return null;
    }
  } catch (error) {
    log.info('登录失败（预期行为）: ' + (error.response?.data?.message || error.message));
    return null;
  }
}

/**
 * 测试无效Token访问
 */
async function testInvalidToken() {
  log.title('测试无效Token访问');

  try {
    const response = await axios.get(`${API_BASE}/user/info`, {
      headers: {
        'Authorization': 'Bearer invalid_token_12345'
      }
    });

    log.error('应该返回401错误，但没有');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log.success('正确返回401认证失败错误');
      console.log('   错误信息:', error.response.data.message);
    } else {
      log.error(' unexpected error: ' + error.message);
    }
  }
}

/**
 * 测试无Token访问
 */
async function testNoToken() {
  log.title('测试无Token访问受保护接口');

  try {
    const response = await axios.get(`${API_BASE}/user/info`);

    log.error('应该返回401错误，但没有');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log.success('正确返回401未提供Token错误');
      console.log('   错误信息:', error.response.data.message);
    } else {
      log.error(' unexpected error: ' + error.message);
    }
  }
}

/**
 * 运行所有测试
 */
async function runTests() {
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}         用户系统 API 测试${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);

  // 1. 测试登录（预期失败，因为没有配置微信AppID）
  await testLogin();

  // 2. 测试获取指定用户信息（公开接口）
  const user = await testGetUserById();

  if (user) {
    // 生成测试Token
    log.info('生成测试Token...');
    const testToken = generateTestToken(user.id, user.openid);
    console.log('   Token:', testToken.substring(0, 50) + '...');

    // 3. 测试获取当前用户信息（需要Token）
    await testGetCurrentUser(testToken);

    // 4. 测试更新用户信息（需要Token）
    await testUpdateUser(testToken);

    // 5. 测试无效Token
    await testInvalidToken();

    // 6. 测试无Token访问
    await testNoToken();
  }

  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  log.success('所有测试完成！');
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);
}

// 运行测试
runTests().catch(error => {
  log.error('测试运行失败: ' + error.message);
  process.exit(1);
});
