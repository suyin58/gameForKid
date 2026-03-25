/**
 * 测试辅助工具
 */

const API_BASE = 'http://localhost:3001/api/v1';
const JWT_SECRET = 'kidsgame-secret-key-development-only';

/**
 * 生成测试用的JWT Token
 * @param {number} userId - 用户ID
 * @param {string} openid - 用户OpenID
 * @returns {string} JWT Token
 */
function generateTestToken(userId, openid) {
  // 简化版本：实际测试中应该使用真实的JWT库
  // 这里为了测试，我们使用API登录获取真实token
  return null;
}

/**
 * 通过API进行测试登录
 * @param {string} code - 微信登录code（模拟）
 * @returns {Promise<Object>} 登录结果
 */
async function loginViaAPI(code = 'test_mock_code') {
  const response = await fetch(`${API_BASE}/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  const result = await response.json();

  if (result.code !== 0) {
    throw new Error(`登录失败: ${result.message}`);
  }

  return result.data;
}

/**
 * 创建测试用户并获取Token
 * @returns {Promise<string>} JWT Token
 */
async function createTestUserAndGetToken() {
  // 使用种子数据中的用户（通过模拟openid获取token）
  // 注意：这需要后端支持模拟登录模式

  // 简化方案：直接构造已知用户的token
  // 在真实测试中，应该通过完整的登录流程

  return null;
}

/**
 * 清理测试数据
 * @param {Object} page - Playwright page对象
 */
async function cleanupTestData(page) {
  // 清理测试期间创建的数据
  // 可以通过API调用删除测试数据
}

/**
 * 等待API响应
 * @param {Object} page - Playwright page对象
 * @param {string} url - API URL
 * @param {number} timeout - 超时时间
 */
async function waitForAPIResponse(page, url, timeout = 5000) {
  return page.waitForResponse(
    (response) => response.url().includes(url) && response.status() === 200,
    { timeout }
  );
}

module.exports = {
  generateTestToken,
  loginViaAPI,
  createTestUserAndGetToken,
  cleanupTestData,
  waitForAPIResponse,
  API_BASE,
  JWT_SECRET,
};
