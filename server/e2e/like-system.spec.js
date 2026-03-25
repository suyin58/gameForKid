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

test.describe('点赞系统 E2E 测试', () => {

  let testToken;
  let testUserId = 1;
  let testGameId = 4; // 使用游戏4（属于用户2，用户1可以点赞）

  test.beforeEach(async () => {
    // 每个测试前生成测试Token
    testToken = generateTestToken(testUserId, 'test_openid_1');
    console.log('开始测试...');
  });

  test.afterEach(async () => {
    console.log('测试结束');
  });

  /**
   * 测试1: 点赞游戏
   */
  test('POST /api/v1/like/:gameId - 点赞游戏', async ({ request }) => {
    // 先取消点赞（确保可以重新点赞）
    try {
      await request.delete(`${API_BASE}/like/${testGameId}`, {
        headers: { 'Authorization': `Bearer ${testToken}` }
      });
    } catch (e) {
      // 忽略错误，可能本来就没点赞
    }

    // 点赞游戏
    const response = await request.post(`${API_BASE}/like/${testGameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('点赞成功');
    expect(result.data).toHaveProperty('likeCount');
    expect(result.data).toHaveProperty('liked');
    expect(result.data.likeCount).toBeGreaterThan(0);

    console.log(`✅ 点赞成功: gameId=${testGameId}, likeCount=${result.data.likeCount}`);
  });

  /**
   * 测试2: 检查点赞状态
   */
  test('GET /api/v1/like/:gameId/status - 检查点赞状态（已点赞）', async ({ request }) => {
    // 先点赞
    await request.post(`${API_BASE}/like/${testGameId}`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });

    // 检查点赞状态
    const response = await request.get(`${API_BASE}/like/${testGameId}/status`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('获取点赞状态成功');
    expect(result.data).toHaveProperty('liked');
    expect(result.data.liked).toBe(true);

    console.log('✅ 检查点赞状态成功: liked=true');
  });

  /**
   * 测试3: 检查点赞状态（未点赞）
   */
  test('GET /api/v1/like/:gameId/status - 检查点赞状态（未点赞）', async ({ request }) => {
    // 使用游戏5（用户1未点赞的游戏）
    const gameId = 5;

    // 检查点赞状态
    const response = await request.get(`${API_BASE}/like/${gameId}/status`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('获取点赞状态成功');
    expect(result.data).toHaveProperty('liked');
    expect(result.data.liked).toBe(false);

    console.log('✅ 检查点赞状态成功: liked=false');
  });

  /**
   * 测试4: 未登录用户检查点赞状态
   */
  test('GET /api/v1/like/:gameId/status - 未登录用户返回false', async ({ request }) => {
    // 不提供Token
    const response = await request.get(`${API_BASE}/like/${testGameId}/status`);

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('获取点赞状态成功');
    expect(result.data).toHaveProperty('liked');
    expect(result.data.liked).toBe(false);

    console.log('✅ 未登录用户点赞状态正确: liked=false');
  });

  /**
   * 测试5: 取消点赞
   */
  test('DELETE /api/v1/like/:gameId - 取消点赞', async ({ request }) => {
    // 先点赞
    await request.post(`${API_BASE}/like/${testGameId}`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });

    // 取消点赞
    const response = await request.delete(`${API_BASE}/like/${testGameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('取消点赞成功');
    expect(result.data).toHaveProperty('likeCount');

    console.log(`✅ 取消点赞成功: gameId=${testGameId}, likeCount=${result.data.likeCount}`);

    // 验证点赞状态已更新
    const statusResponse = await request.get(`${API_BASE}/like/${testGameId}/status`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });

    const statusResult = await statusResponse.json();
    expect(statusResult.data.liked).toBe(false);
    console.log('✅ 取消后点赞状态验证: liked=false');
  });

  /**
   * 测试6: 获取游戏点赞用户列表
   */
  test('GET /api/v1/like/:gameId/users - 获取点赞用户列表', async ({ request }) => {
    const response = await request.get(`${API_BASE}/like/${testGameId}/users`);

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('获取点赞用户列表成功');
    expect(result.data).toHaveProperty('likers');
    expect(Array.isArray(result.data.likers)).toBe(true);
    expect(result.data).toHaveProperty('total');

    console.log(`✅ 获取点赞用户列表成功: count=${result.data.likers.length}, total=${result.data.total}`);

    // 验证用户数据结构
    if (result.data.likers.length > 0) {
      const firstLiker = result.data.likers[0];
      expect(firstLiker).toHaveProperty('id');
      expect(firstLiker).toHaveProperty('nickname');
      expect(firstLiker).toHaveProperty('avatar');
    }
  });

  /**
   * 测试7: 获取用户点赞的游戏列表
   */
  test('GET /api/v1/like/my - 获取我的点赞游戏列表', async ({ request }) => {
    const response = await request.get(`${API_BASE}/like/my`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('获取点赞游戏列表成功');
    expect(result.data).toHaveProperty('games');
    expect(Array.isArray(result.data.games)).toBe(true);
    expect(result.data).toHaveProperty('total');

    console.log(`✅ 获取点赞游戏列表成功: count=${result.data.games.length}, total=${result.data.total}`);

    // 验证游戏数据结构
    if (result.data.games.length > 0) {
      const firstGame = result.data.games[0];
      expect(firstGame).toHaveProperty('id');
      expect(firstGame).toHaveProperty('title');
      expect(firstGame).toHaveProperty('liked_at'); //有点赞时间，说明已点赞
    }
  });

  /**
   * 测试8: 重复点赞返回错误
   */
  test('POST /api/v1/like/:gameId - 重复点赞返回错误', async ({ request }) => {
    // 先点赞
    await request.post(`${API_BASE}/like/${testGameId}`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });

    // 再次点赞（应该返回错误）
    const response = await request.post(`${API_BASE}/like/${testGameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证返回错误
    expect(result.code).not.toBe(0);
    expect(result.message).toMatch(/已经点赞/);

    console.log('✅ 重复点赞正确返回错误');
  });

  /**
   * 测试9: 取消未点赞的游戏返回错误
   */
  test('DELETE /api/v1/like/:gameId - 取消未点赞的游戏返回错误', async ({ request }) => {
    // 使用游戏5（用户1未点赞的游戏）
    const gameId = 5;

    // 尝试取消点赞
    const response = await request.delete(`${API_BASE}/like/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证返回错误
    expect(result.code).not.toBe(0);
    expect(result.message).toMatch(/尚未点赞/);

    console.log('✅ 取消未点赞游戏正确返回错误');
  });

  /**
   * 测试10: 点赞不存在的游戏返回错误
   */
  test('POST /api/v1/like/:gameId - 点赞不存在的游戏返回错误', async ({ request }) => {
    const nonExistentGameId = 99999;

    const response = await request.post(`${API_BASE}/like/${nonExistentGameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证返回错误
    expect(result.code).not.toBe(0);
    expect(result.message).toMatch(/不存在/);

    console.log('✅ 点赞不存在游戏正确返回错误');
  });

  /**
   * 测试11: 游戏ID格式验证
   */
  test('POST /api/v1/like/:gameId - 游戏ID格式不正确返回错误', async ({ request }) => {
    const response = await request.post(`${API_BASE}/like/invalid_id`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证返回错误
    expect(result.code).toBe(1001);
    expect(result.message).toBe('游戏ID格式不正确');

    console.log('✅ 游戏ID格式验证正确');
  });

  /**
   * 测试12: 点赞计数准确性验证
   */
  test('点赞计数准确性 - 多个用户点赞后计数增加', async ({ request }) => {
    // 创建一个新游戏用于测试
    const createResponse = await request.post(`${API_BASE}/game`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: {
        title: '点赞计数测试游戏',
        description: '用于测试点赞计数',
        code: '<!DOCTYPE html><html><body>测试游戏</body></html>',
        type: 'casual',
        visibility: 'public'
      }
    });

    const createResult = await createResponse.json();
    const gameId = createResult.data.id;
    const initialLikeCount = createResult.data.like_count;

    // 用户2点赞（用户1创建的游戏，用户2点赞）
    const user2Token = generateTestToken(2, 'test_openid_2');
    await request.post(`${API_BASE}/like/${gameId}`, {
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });

    // 验证点赞数+1
    const afterUser2Response = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    const afterUser2Result = await afterUser2Response.json();
    expect(afterUser2Result.data.like_count).toBe(initialLikeCount + 1);

    // 用户3点赞
    const user3Token = generateTestToken(3, 'test_openid_3');
    await request.post(`${API_BASE}/like/${gameId}`, {
      headers: { 'Authorization': `Bearer ${user3Token}` }
    });

    // 验证点赞数+2
    const afterUser3Response = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    const afterUser3Result = await afterUser3Response.json();
    expect(afterUser3Result.data.like_count).toBe(initialLikeCount + 2);

    console.log(`✅ 点赞计数准确性验证: ${initialLikeCount} → ${afterUser3Result.data.like_count}`);

    // 清理：删除测试游戏
    await request.delete(`${API_BASE}/game/${gameId}`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
  });

  /**
   * 测试13: 点赞列表分页
   */
  test('GET /api/v1/like/:gameId/users - 分页参数验证', async ({ request }) => {
    const response = await request.get(`${API_BASE}/like/${testGameId}/users?limit=5&offset=0`);

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.data.likers.length).toBeLessThanOrEqual(5);
    expect(result.data).toHaveProperty('total');

    console.log(`✅ 分页参数验证: 返回${result.data.likers.length}条记录, 总共${result.data.total}条`);
  });

  /**
   * 测试14: 获取用户点赞游戏分页
   */
  test('GET /api/v1/like/my - 分页参数验证', async ({ request }) => {
    const response = await request.get(`${API_BASE}/like/my?limit=10&offset=0`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.data.games.length).toBeLessThanOrEqual(10);
    expect(result.data).toHaveProperty('total');

    console.log(`✅ 我的点赞游戏分页验证: 返回${result.data.games.length}条记录, 总共${result.data.total}条`);
  });

  /**
   * 测试15: 完整点赞流程
   */
  test('完整点赞流程: 点赞 -> 检查状态 -> 查看列表 -> 取消点赞', async ({ request }) => {
    // 先创建一个新游戏用于测试（避免数据污染）
    const user2Token = generateTestToken(2, 'test_openid_2');
    const createResponse = await request.post(`${API_BASE}/game`, {
      headers: {
        'Authorization': `Bearer ${user2Token}`
      },
      data: {
        title: '完整流程测试游戏',
        code: '<!DOCTYPE html><html><body>测试</body></html>',
        type: 'casual',
        visibility: 'public'
      }
    });

    const createResult = await createResponse.json();
    const gameId = createResult.data.id;

    // 步骤1: 点赞
    const likeResponse = await request.post(`${API_BASE}/like/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const likeResult = await likeResponse.json();
    expect(likeResult.code).toBe(0);
    console.log(`步骤1: 点赞成功 - gameId=${gameId}`);

    // 步骤2: 检查点赞状态
    const statusResponse = await request.get(`${API_BASE}/like/${gameId}/status`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const statusResult = await statusResponse.json();
    expect(statusResult.data.liked).toBe(true);
    console.log('步骤2: 点赞状态验证 - liked=true');

    // 步骤3: 查看点赞游戏列表
    const myLikesResponse = await request.get(`${API_BASE}/like/my`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const myLikesResult = await myLikesResponse.json();
    const foundGame = myLikesResult.data.games.find(g => g.id === gameId);
    expect(foundGame).toBeDefined();
    expect(foundGame).toHaveProperty('liked_at'); // 有liked_at说明已点赞
    console.log('步骤3: 点赞列表验证 - 游戏已在列表中');

    // 步骤4: 取消点赞
    const unlikeResponse = await request.delete(`${API_BASE}/like/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const unlikeResult = await unlikeResponse.json();
    expect(unlikeResult.code).toBe(0);
    console.log('步骤4: 取消点赞成功');

    // 步骤5: 验证状态已更新
    const finalStatusResponse = await request.get(`${API_BASE}/like/${gameId}/status`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const finalStatusResult = await finalStatusResponse.json();
    expect(finalStatusResult.data.liked).toBe(false);
    console.log('步骤5: 取消后状态验证 - liked=false');

    console.log('✅ 完整点赞流程测试通过');
  });

  /**
   * 测试16: 未授权点赞
   */
  test('POST /api/v1/like/:gameId - 未提供Token返回401', async ({ request }) => {
    const response = await request.post(`${API_BASE}/like/${testGameId}`);

    const result = await response.json();

    // 验证返回401错误
    expect(result.code).toBe(401);
    expect(result.message).toBe('未提供认证Token');

    console.log('✅ 未提供Token正确返回401错误');
  });

  /**
   * 测试17: 并发点赞
   */
  test('并发点赞 - 多个用户同时点赞', async ({ request }) => {
    // 创建一个新游戏
    const user1Token = generateTestToken(1, 'test_openid_1');
    const createResponse = await request.post(`${API_BASE}/game`, {
      headers: { 'Authorization': `Bearer ${user1Token}` },
      data: {
        title: '并发点赞测试游戏',
        code: '<!DOCTYPE html><html><body>测试</body></html>',
        type: 'casual',
        visibility: 'public'
      }
    });

    const createResult = await createResponse.json();
    const gameId = createResult.data.id;

    // 多个用户并发点赞（使用用户2和用户3，不要用用户1因为游戏是用户1创建的）
    const user2Token = generateTestToken(2, 'test_openid_2');
    const user3Token = generateTestToken(3, 'test_openid_3');

    const promises = [
      request.post(`${API_BASE}/like/${gameId}`, {
        headers: { 'Authorization': `Bearer ${user2Token}` }
      }),
      request.post(`${API_BASE}/like/${gameId}`, {
        headers: { 'Authorization': `Bearer ${user3Token}` }
      })
    ];

    const responses = await Promise.all(promises);

    // 验证所有响应都成功
    responses.forEach((response, index) => {
      expect([200, 201]).toContain(response.status());
    });

    console.log('✅ 并发点赞测试通过');

    // 验证点赞计数
    const getResponse = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });

    const getResult = await getResponse.json();
    expect(getResult.data.like_count).toBe(2);
    console.log(`✅ 并发点赞计数验证: like_count=2`);

    // 清理
    await request.delete(`${API_BASE}/game/${gameId}`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
  });

  /**
   * 测试18: 取消点赞后点赞计数减少
   */
  test('取消点赞后计数减少', async ({ request }) => {
    const gameId = 4; // 使用游戏4（属于用户2）

    // 获取当前点赞数
    const beforeResponse = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const beforeResult = await beforeResponse.json();
    const beforeLikeCount = beforeResult.data.like_count;

    // 先点赞（如果没点赞）
    const likeResponse = await request.post(`${API_BASE}/like/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    // 获取点赞后的计数
    const afterLikeResponse = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const afterLikeResult = await afterLikeResponse.json();

    // 取消点赞
    await request.delete(`${API_BASE}/like/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    // 获取取消后的计数
    const afterUnlikeResponse = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const afterUnlikeResult = await afterUnlikeResponse.json();
    const afterUnlikeCount = afterUnlikeResult.data.like_count;

    // 验证计数已减少
    expect(afterUnlikeCount).toBeLessThan(afterLikeResult.data.like_count);

    console.log(`✅ 取消点赞计数验证: ${afterLikeResult.data.like_count} → ${afterUnlikeCount}`);
  });

  /**
   * 测试19: 点赞用户列表数据完整性
   */
  test('GET /api/v1/like/:gameId/users - 用户数据完整性验证', async ({ request }) => {
    const response = await request.get(`${API_BASE}/like/${testGameId}/users`);

    const result = await response.json();

    // 验证成功
    expect(result.code).toBe(0);

    // 验证用户数据结构
    if (result.data.likers.length > 0) {
      result.data.likers.forEach(liker => {
        expect(liker).toHaveProperty('id');
        expect(liker).toHaveProperty('nickname');
        expect(liker).toHaveProperty('avatar');
        expect(typeof liker.id).toBe('number');
        expect(typeof liker.nickname).toBe('string');
        expect(typeof liker.avatar).toBe('string');
      });
      console.log('✅ 点赞用户数据结构验证通过');
    } else {
      console.log('⚠️ 暂无点赞用户数据');
    }
  });

  /**
   * 测试20: 点赞游戏列表数据完整性
   */
  test('GET /api/v1/like/my - 游戏数据完整性验证', async ({ request }) => {
    const response = await request.get(`${API_BASE}/like/my`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证成功
    expect(result.code).toBe(0);

    // 验证游戏数据结构
    if (result.data.games.length > 0) {
      result.data.games.forEach(game => {
        expect(game).toHaveProperty('id');
        expect(game).toHaveProperty('title');
        expect(game).toHaveProperty('description');
        expect(game).toHaveProperty('type');
        expect(game).toHaveProperty('thumbnail');
        expect(game).toHaveProperty('liked_at'); // 有点赞时间
        expect(game).toHaveProperty('like_count');
        expect(game).toHaveProperty('play_count');
      });
      console.log('✅ 点赞游戏数据结构验证通过');
    } else {
      console.log('⚠️ 暂无点赞游戏数据');
    }
  });
});
