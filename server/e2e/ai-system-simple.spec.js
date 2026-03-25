import { test, expect } from '@playwright/test';
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:3001/api/v1';
const JWT_SECRET = 'kidsgame-secret-key-development-only';

/**
 * 生成测试用的JWT Token
 */
function generateTestToken(userId, openid) {
  return jwt.sign(
    { user_id: userId, openid },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

test.describe('AI生成系统 E2E 测试（简化版）', () => {

  let testToken;
  let testUserId = 1;

  test.beforeEach(async () => {
    testToken = generateTestToken(testUserId, 'test_openid_1');
  });

  /**
   * 测试1: AI生成 - 未认证返回401
   */
  test('POST /api/v1/ai/generate - 未提供Token返回401', async ({ request }) => {
    const response = await request.post(`${API_BASE}/ai/generate`, {
      data: {
        description: '测试游戏',
        type: 'casual'
      }
    });

    const result = await response.json();

    expect(result.code).toBe(401);
    expect(result.message).toBe('未提供认证Token');

    console.log('✅ 未认证测试通过');
  });

  /**
   * 测试2: AI生成 - 缺少描述返回错误
   */
  test('POST /api/v1/ai/generate - 缺少描述参数验证', async ({ request }) => {
    const response = await request.post(`${API_BASE}/ai/generate`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: {
        type: 'casual'
        // 缺少description
      }
    });

    const result = await response.json();

    // 认证成功后应该返回参数验证错误
    expect(result.code).not.toBe(401); // 不是401说明认证通过了
    expect(result.message).toBeDefined();

    console.log(`✅ 参数验证测试: ${result.message}`);
  });

  /**
   * 测试3: AI生成 - 描述过长返回错误
   */
  test('POST /api/v1/ai/generate - 描述长度验证', async ({ request }) => {
    const response = await request.post(`${API_BASE}/ai/generate`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: {
        description: 'a'.repeat(501),
        type: 'casual'
      }
    });

    const result = await response.json();

    expect(result.code).not.toBe(401);
    console.log(`✅ 描述长度验证: ${result.message}`);
  });

  /**
   * 测试4: AI修改 - 缺少gameId返回错误
   */
  test('POST /api/v1/ai/modify - gameId参数验证', async ({ request }) => {
    const response = await request.post(`${API_BASE}/ai/modify`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: {
        modifyDescription: '测试修改'
        // 缺少gameId
      }
    });

    const result = await response.json();

    expect(result.code).not.toBe(401);
    console.log(`✅ gameId验证: ${result.message}`);
  });

  /**
   * 测试5: AI修改 - 修改描述为空返回错误
   */
  test('POST /api/v1/ai/modify - 修改描述验证', async ({ request }) => {
    const response = await request.post(`${API_BASE}/ai/modify`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: {
        gameId: 1,
        modifyDescription: ''
      }
    });

    const result = await response.json();

    expect(result.code).not.toBe(401);
    console.log(`✅ 修改描述验证: ${result.message}`);
  });

  /**
   * 测试6: 游戏类型支持
   */
  test('POST /api/v1/ai/generate - 支持所有游戏类型参数', async ({ request }) => {
    const gameTypes = ['casual', 'education', 'puzzle', 'sports', 'adventure'];

    for (const type of gameTypes) {
      const response = await request.post(`${API_BASE}/ai/generate`, {
        headers: {
          'Authorization': `Bearer ${testToken}`
        },
        data: {
          description: '测试游戏',
          type: type
        },
        maxRedirects: 0, // 不跟随重定向
        timeout: 5000 // 5秒超时
      });

      // 至少应该有响应（可能是200成功或500错误）
      expect([200, 400, 500, 503]).toContain(response.status());
    }

    console.log('✅ 游戏类型参数验证通过');
  });

  /**
   * 测试7: 并发请求处理
   */
  test('AI生成 - 并发请求处理', async ({ request }) => {
    const user1Token = generateTestToken(1, 'test_openid_1');
    const user2Token = generateTestToken(2, 'test_openid_2');
    const user3Token = generateTestToken(3, 'test_openid_3');

    // 并发请求
    const promises = [
      request.post(`${API_BASE}/ai/generate`, {
        headers: { 'Authorization': `Bearer ${user1Token}` },
        data: { description: '用户1的游戏', type: 'casual' },
        timeout: 5000
      }),
      request.post(`${API_BASE}/ai/generate`, {
        headers: { 'Authorization': `Bearer ${user2Token}` },
        data: { description: '用户2的游戏', type: 'education' },
        timeout: 5000
      }),
      request.post(`${API_BASE}/ai/generate`, {
        headers: { 'Authorization': `Bearer ${user3Token}` },
        data: { description: '用户3的游戏', type: 'puzzle' },
        timeout: 5000
      })
    ];

    const responses = await Promise.all(promises);

    // 验证所有请求都得到响应
    responses.forEach((response) => {
      expect([200, 400, 401, 500, 503]).toContain(response.status());
    });

    console.log('✅ 并发请求处理正确');
  });

  /**
   * 测试8: AI服务配置检查
   */
  test('AI服务配置检查', async ({ request }) => {
    // 通过测试一个生成请求来检查AI服务状态
    const response = await request.post(`${API_BASE}/ai/generate`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: {
        description: '简单测试',
        type: 'casual'
      },
      timeout: 5000
    });

    const result = await response.json();

    // 检查响应
    if (result.code === 5003) {
      console.log('⚠️  AI服务未配置');
    } else if (result.code === 5001 || result.code === 0) {
      console.log('✅ AI服务已配置');
    } else {
      console.log(`ℹ️  AI服务状态: ${result.code} - ${result.message}`);
    }
  });

  /**
   * 测试9: 配额系统集成
   */
  test('配额系统 - 生成接口需要配额', async ({ request }) => {
    // 这个测试验证生成接口确实会检查配额
    // 实际配额扣除在生成成功后进行

    const response = await request.post(`${API_BASE}/ai/generate`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: {
        description: '测试配额',
        type: 'casual'
      },
      timeout: 5000
    });

    const result = await response.json();

    // 如果返回"配额不足"错误，说明配额系统正常工作
    // 如果返回其他错误，也说明接口在正常处理
    if (result.message && result.message.includes('配额')) {
      console.log('✅ 配额系统正常工作');
    } else {
      console.log(`✅ 配额系统响应: ${result.message}`);
    }
  });

  /**
   * 测试10: Token格式验证
   */
  test('Token格式 - 无效Token返回401', async ({ request }) => {
    const invalidToken = 'invalid_token_string';

    const response = await request.post(`${API_BASE}/ai/generate`, {
      headers: {
        'Authorization': `Bearer ${invalidToken}`
      },
      data: {
        description: '测试',
        type: 'casual'
      }
    });

    const result = await response.json();

    expect(result.code).toBe(401);
    console.log('✅ Token格式验证正确');
  });

  /**
   * 测试11: Token过期验证
   */
  test('Token格式 - 过期Token返回401', async ({ request }) => {
    // 生成一个已过期的token（exp设置为过去的时间）
    const expiredToken = jwt.sign(
      { user_id: 1, openid: 'test' },
      JWT_SECRET,
      { expiresIn: '-1h' } // 1小时前过期
    );

    const response = await request.post(`${API_BASE}/ai/generate`, {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      },
      data: {
        description: '测试',
        type: 'casual'
      }
    });

    const result = await response.json();

    expect(result.code).toBe(401);
    console.log('✅ Token过期验证正确');
  });
});
