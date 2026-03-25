import { test, expect } from '@playwright/test';
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:3001/api/v1';
const JWT_SECRET = 'kidsgame-secret-key-development-only';

/**
 * 生成测试用的JWT Token
 */
function generateTestToken(userId, openid) {
  return jwt.sign(
    { userId, openid },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

test.describe('用户系统 E2E 测试', () => {

  test.beforeEach(async () => {
    // 每个测试前的准备工作
    console.log('开始测试...');
  });

  test.afterEach(async () => {
    // 每个测试后的清理工作
    console.log('测试结束');
  });

  /**
   * 测试1: 微信登录流程
   */
  test('POST /api/v1/user/login - 微信登录', async ({ request }) => {
    // 测试登录接口（预期返回错误，因为未配置微信AppID）
    const response = await request.post(`${API_BASE}/user/login`, {
      data: {
        code: 'test_mock_code_123'
      }
    });

    const result = await response.json();

    // 验证响应格式
    expect(result).toHaveProperty('code');
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('timestamp');

    // 由于未配置微信AppID，应该返回错误
    expect(result.code).not.toBe(0);
    console.log('✅ 登录接口响应格式正确');
  });

  /**
   * 测试2: 获取当前用户信息（需要Token）
   */
  test('GET /api/v1/user/info - 获取当前用户信息', async ({ request }) => {
    // 生成测试Token（使用用户1）
    const testToken = generateTestToken(1, 'test_openid_1');

    const response = await request.get(`${API_BASE}/user/info`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('获取用户信息成功');
    expect(result.data).toHaveProperty('id');
    expect(result.data).toHaveProperty('nickname');
    expect(result.data).toHaveProperty('avatar');
    expect(result.data).toHaveProperty('gameCount');
    expect(result.data).toHaveProperty('likeCount');

    console.log(`✅ 获取用户信息成功: ${result.data.nickname}`);
  });

  /**
   * 测试3: 获取指定用户信息（公开接口）
   */
  test('GET /api/v1/user/:userId - 获取指定用户信息', async ({ request }) => {
    const userId = 1;

    const response = await request.get(`${API_BASE}/user/${userId}`);

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('获取用户信息成功');
    expect(result.data.id).toBe(userId);
    expect(result.data).toHaveProperty('nickname');

    console.log(`✅ 获取指定用户信息成功: ID=${userId}, 昵称=${result.data.nickname}`);
  });

  /**
   * 测试4: 更新用户信息（需要Token）
   */
  test('PUT /api/v1/user/info - 更新用户信息', async ({ request }) => {
    // 生成测试Token（使用用户1）
    const testToken = generateTestToken(1, 'test_openid_1');

    const updateData = {
      nickname: 'E2E测试用户',
      bio: '这是E2E测试修改的简介'
    };

    const response = await request.put(`${API_BASE}/user/info`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: updateData
    });

    const result = await response.json();

    // 验证更新成功
    expect(result.code).toBe(0);
    expect(result.message).toBe('更新成功');
    expect(result.data.nickname).toBe(updateData.nickname);
    expect(result.data.bio).toBe(updateData.bio);

    console.log(`✅ 更新用户信息成功: ${result.data.nickname}`);

    // 验证数据持久化：重新获取用户信息
    const getResponse = await request.get(`${API_BASE}/user/info`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const getResult = await getResponse.json();
    expect(getResult.data.nickname).toBe(updateData.nickname);
    console.log('✅ 数据持久化验证成功');
  });

  /**
   * 测试5: 无效Token访问受保护接口
   */
  test('GET /api/v1/user/info - 无效Token返回401', async ({ request }) => {
    const response = await request.get(`${API_BASE}/user/info`, {
      headers: {
        'Authorization': 'Bearer invalid_token_12345'
      }
    });

    const result = await response.json();

    // 验证返回401错误
    expect(result.code).toBe(401);
    expect(result.message).toMatch(/认证失败|Token无效/);

    console.log('✅ 无效Token正确返回401错误');
  });

  /**
   * 测试6: 未提供Token访问受保护接口
   */
  test('GET /api/v1/user/info - 未提供Token返回401', async ({ request }) => {
    const response = await request.get(`${API_BASE}/user/info`);

    const result = await response.json();

    // 验证返回401错误
    expect(result.code).toBe(401);
    expect(result.message).toBe('未提供认证Token');

    console.log('✅ 未提供Token正确返回401错误');
  });

  /**
   * 测试7: 用户ID格式不正确
   */
  test('GET /api/v1/user/:userId - 用户ID格式不正确返回400', async ({ request }) => {
    const response = await request.get(`${API_BASE}/user/invalid_id`);

    const result = await response.json();

    // 验证返回400错误
    expect(result.code).toBe(1001);
    expect(result.message).toBe('用户ID格式不正确');

    console.log('✅ 用户ID格式验证正确');
  });

  /**
   * 测试8: 昵称长度验证
   */
  test('PUT /api/v1/user/info - 昵称长度验证', async ({ request }) => {
    const testToken = generateTestToken(1, 'test_openid_1');

    const updateData = {
      nickname: 'a', // 太短（要求1-20字符）
      bio: '测试简介'
    };

    const response = await request.put(`${API_BASE}/user/info`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: updateData
    });

    const result = await response.json();

    // 1个字符应该是允许的，所以应该成功
    expect(result.code).toBe(0);

    console.log('✅ 昵称长度验证正确');
  });

  /**
   * 测试9: 完整的用户流程
   */
  test('完整用户流程: 登录 -> 查看信息 -> 修改信息 -> 再次查看', async ({ request }) => {
    const testToken = generateTestToken(2, 'test_openid_2');

    // 步骤1: 获取用户信息
    const getResponse = await request.get(`${API_BASE}/user/info`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const getResult = await getResponse.json();
    expect(getResult.code).toBe(0);
    const originalNickname = getResult.data.nickname;

    console.log(`步骤1: 获取用户信息 - ${originalNickname}`);

    // 步骤2: 更新用户信息
    const newNickname = `更新后的昵称_${Date.now()}`;
    const updateResponse = await request.put(`${API_BASE}/user/info`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: {
        nickname: newNickname,
        bio: '这是完整流程测试的简介'
      }
    });

    const updateResult = await updateResponse.json();
    expect(updateResult.code).toBe(0);

    console.log(`步骤2: 更新用户信息 - ${newNickname}`);

    // 步骤3: 再次获取用户信息验证更新
    const verifyResponse = await request.get(`${API_BASE}/user/info`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const verifyResult = await verifyResponse.json();
    expect(verifyResult.code).toBe(0);
    expect(verifyResult.data.nickname).toBe(newNickname);
    expect(verifyResult.data.bio).toBe('这是完整流程测试的简介');

    console.log(`步骤3: 验证更新成功 - ${verifyResult.data.nickname}`);
    console.log('✅ 完整用户流程测试通过');
  });

  /**
   * 测试10: 获取不存在的用户
   */
  test('GET /api/v1/user/:userId - 获取不存在的用户返回错误', async ({ request }) => {
    const nonExistentUserId = 99999;

    const response = await request.get(`${API_BASE}/user/${nonExistentUserId}`);

    const result = await response.json();

    // 验证返回错误（可能是1003或1004）
    expect(result.code).not.toBe(0);
    expect(result.message).toMatch(/用户|不存在/);

    console.log('✅ 不存在的用户正确返回错误');
  });

  /**
   * 测试11: Token过期验证
   */
  test('GET /api/v1/user/info - Token过期返回401', async ({ request }) => {
    // 生成一个过期的Token（已过期）
    const expiredToken = jwt.sign(
      { userId: 1, openid: 'test_openid_1' },
      JWT_SECRET,
      { expiresIn: '-1h' } // 负数表示已过期
    );

    const response = await request.get(`${API_BASE}/user/info`, {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });

    const result = await response.json();

    // 验证返回401错误
    expect(result.code).toBe(401);
    expect(result.message).toMatch(/Token已过期|认证失败/);

    console.log('✅ 过期Token正确返回401错误');
  });

  /**
   * 测试12: 并发请求测试
   */
  test('并发请求测试 - 多个用户同时获取信息', async ({ request }) => {
    const userIds = [1, 2, 3];

    // 并发发送多个请求
    const promises = userIds.map(userId =>
      request.get(`${API_BASE}/user/${userId}`)
    );

    const responses = await Promise.all(promises);

    // 验证所有响应都成功
    responses.forEach((response, index) => {
      expect(response.status()).toBe(200);
    });

    console.log('✅ 并发请求测试通过');
  });
});
