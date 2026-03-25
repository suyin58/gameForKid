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

/**
 * 生成测试游戏代码
 */
function generateTestGameCode(title) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f0f0f0; }
    .game-container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; text-align: center; }
    .game-area { height: 400px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
    .button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px; font-size: 16px; }
    .button:hover { background: #45a049; }
  </style>
</head>
<body>
  <div class="game-container">
    <h1>${title}</h1>
    <div class="game-area">游戏区域</div>
    <div style="text-align: center; margin-top: 20px;">
      <button class="button" onclick="alert('开始游戏！')">开始游戏</button>
      <button class="button" onclick="alert('游戏规则')">游戏说明</button>
    </div>
  </div>
  <script>
    console.log('游戏已加载: ${title}');
    // 游戏逻辑
    let score = 0;
    function updateScore(points) {
      score += points;
      console.log('当前分数:', score);
    }
  </script>
</body>
</html>`;
}

test.describe('游戏系统 E2E 测试', () => {

  let testToken;
  let testUserId = 1;
  let createdGameId;

  test.beforeEach(async () => {
    // 每个测试前生成测试Token
    testToken = generateTestToken(testUserId, 'test_openid_1');
    console.log('开始测试...');
  });

  test.afterEach(async () => {
    console.log('测试结束');
  });

  /**
   * 测试1: 创建游戏
   */
  test('POST /api/v1/game - 创建游戏', async ({ request }) => {
    const gameData = {
      title: 'E2E测试游戏',
      description: '这是一个E2E测试创建的游戏',
      code: generateTestGameCode('E2E测试游戏'),
      type: 'casual',
      visibility: 'private'
    };

    const response = await request.post(`${API_BASE}/game`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: gameData
    });

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('创建游戏成功');
    expect(result.data).toHaveProperty('id');
    expect(result.data.title).toBe(gameData.title);
    expect(result.data.description).toBe(gameData.description);
    expect(result.data.type).toBe(gameData.type);
    expect(result.data.visibility).toBe(gameData.visibility);
    expect(result.data.user_id).toBe(testUserId);

    // 保存游戏ID供后续测试使用
    createdGameId = result.data.id;

    console.log(`✅ 创建游戏成功: gameId=${createdGameId}, title=${result.data.title}`);
  });

  /**
   * 测试2: 获取我的游戏列表
   */
  test('GET /api/v1/game/my - 获取我的游戏列表', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/my`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('获取游戏列表成功');
    expect(result.data).toHaveProperty('games');
    expect(Array.isArray(result.data.games)).toBe(true);
    expect(result.data).toHaveProperty('total');

    console.log(`✅ 获取我的游戏列表成功: count=${result.data.games.length}, total=${result.data.total}`);

    // 验证游戏数据结构
    if (result.data.games.length > 0) {
      const firstGame = result.data.games[0];
      expect(firstGame).toHaveProperty('id');
      expect(firstGame).toHaveProperty('title');
      expect(firstGame).toHaveProperty('created_at');
    }
  });

  /**
   * 测试3: 获取公开游戏广场列表
   */
  test('GET /api/v1/game/public - 获取公开游戏列表', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public`);

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('获取游戏列表成功');
    expect(result.data).toHaveProperty('games');
    expect(Array.isArray(result.data.games)).toBe(true);
    expect(result.data).toHaveProperty('total');

    console.log(`✅ 获取公开游戏列表成功: count=${result.data.games.length}, total=${result.data.total}`);
  });

  /**
   * 测试4: 获取游戏详情
   */
  test('GET /api/v1/game/:gameId - 获取游戏详情', async ({ request }) => {
    const gameId = 1; // 使用种子数据中的游戏ID

    const response = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.message).toBe('获取游戏详情成功');
    expect(result.data).toHaveProperty('id');
    expect(result.data.id).toBe(gameId);
    expect(result.data).toHaveProperty('title');
    expect(result.data).toHaveProperty('code');
    expect(result.data).toHaveProperty('like_count');
    expect(result.data).toHaveProperty('play_count');

    console.log(`✅ 获取游戏详情成功: gameId=${gameId}, title=${result.data.title}`);
  });

  /**
   * 测试5: 更新游戏
   */
  test('PUT /api/v1/game/:gameId - 更新游戏', async ({ request }) => {
    // 先创建一个游戏用于更新测试
    const createResponse = await request.post(`${API_BASE}/game`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: {
        title: '更新前的标题',
        description: '更新前的描述',
        code: generateTestGameCode('更新前的标题'),
        type: 'casual'
      }
    });

    const createResult = await createResponse.json();
    const gameId = createResult.data.id;

    // 更新游戏
    const updateData = {
      title: '更新后的标题',
      description: '这是E2E测试更新的描述',
      type: 'education'
    };

    const updateResponse = await request.put(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: updateData
    });

    const updateResult = await updateResponse.json();

    // 验证更新成功
    expect(updateResult.code).toBe(0);
    expect(updateResult.message).toBe('更新游戏成功');
    expect(updateResult.data.title).toBe(updateData.title);
    expect(updateResult.data.description).toBe(updateData.description);

    console.log(`✅ 更新游戏成功: gameId=${gameId}, newTitle=${updateResult.data.title}`);

    // 验证数据持久化
    const getResponse = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const getResult = await getResponse.json();
    expect(getResult.data.title).toBe(updateData.title);
    console.log('✅ 更新数据持久化验证成功');
  });

  /**
   * 测试6: 删除游戏
   */
  test('DELETE /api/v1/game/:gameId - 删除游戏', async ({ request }) => {
    // 先创建一个游戏用于删除测试
    const createResponse = await request.post(`${API_BASE}/game`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: {
        title: '待删除的游戏',
        description: '这个游戏将被删除',
        code: generateTestGameCode('待删除的游戏'),
        type: 'casual'
      }
    });

    const createResult = await createResponse.json();
    const gameId = createResult.data.id;

    // 删除游戏
    const deleteResponse = await request.delete(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const deleteResult = await deleteResponse.json();

    // 验证删除成功
    expect(deleteResult.code).toBe(0);
    expect(deleteResult.message).toBe('删除游戏成功');

    console.log(`✅ 删除游戏成功: gameId=${gameId}`);

    // 验证游戏已被删除
    const getResponse = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const getResult = await getResponse.json();
    expect(getResult.code).not.toBe(0); // 应该返回错误
    console.log('✅ 删除后验证游戏不存在');
  });

  /**
   * 测试7: 增加游戏播放次数
   */
  test('POST /api/v1/game/:gameId/play - 增加播放次数', async ({ request }) => {
    const gameId = 1;

    // 获取当前播放次数
    const beforeResponse = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const beforeResult = await beforeResponse.json();
    const beforePlayCount = beforeResult.data.play_count;

    // 增加播放次数
    const playResponse = await request.post(`${API_BASE}/game/${gameId}/play`);

    const playResult = await playResponse.json();

    // 验证成功
    expect(playResult.code).toBe(0);
    expect(playResult.message).toBe('操作成功');

    console.log(`✅ 增加播放次数成功: gameId=${gameId}`);

    // 验证播放次数已增加
    const afterResponse = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const afterResult = await afterResponse.json();
    expect(afterResult.data.play_count).toBe(beforePlayCount + 1);
    console.log(`✅ 播放次数验证: ${beforePlayCount} → ${afterResult.data.play_count}`);
  });

  /**
   * 测试8: 克隆游戏
   */
  test('POST /api/v1/game/:gameId/clone - 克隆游戏', async ({ request }) => {
    // 使用用户2的token克隆游戏4（游戏4属于用户2，但用用户1的token去克隆）
    // 游戏种子数据：游戏4属于用户2，游戏1,2,3属于用户1
    const gameId = 4; // 游戏4属于用户2

    const cloneResponse = await request.post(`${API_BASE}/game/${gameId}/clone`, {
      headers: {
        'Authorization': `Bearer ${testToken}` // 用户1的token
      }
    });

    const cloneResult = await cloneResponse.json();

    // 验证克隆成功
    expect(cloneResult.code).toBe(0);
    expect(cloneResult.message).toBe('克隆游戏成功');
    expect(cloneResult.data).toHaveProperty('id');
    expect(cloneResult.data).toHaveProperty('title');
    expect(cloneResult.data.user_id).toBe(testUserId);
    expect(cloneResult.data.is_cloned).toBe(1); // SQLite返回整数1表示true
    expect(cloneResult.data.cloned_from).toBe(gameId);

    console.log(`✅ 克隆游戏成功: originalGameId=${gameId}, newGameId=${cloneResult.data.id}`);
  });

  /**
   * 测试9: 创建游戏验证 - 缺少必填字段
   */
  test('POST /api/v1/game - 缺少必填字段返回错误', async ({ request }) => {
    const gameData = {
      title: '测试游戏',
      description: '缺少代码字段'
      // 缺少code字段
    };

    const response = await request.post(`${API_BASE}/game`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: gameData
    });

    const result = await response.json();

    // 验证返回错误
    expect(result.code).not.toBe(0);
    expect(result.message).toMatch(/游戏代码不能为空/);

    console.log('✅ 缺少必填字段验证正确');
  });

  /**
   * 测试10: 创建游戏验证 - 标题长度验证
   */
  test('POST /api/v1/game - 标题长度验证', async ({ request }) => {
    const gameData = {
      title: '', // 空标题
      code: generateTestGameCode('test')
    };

    const response = await request.post(`${API_BASE}/game`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: gameData
    });

    const result = await response.json();

    // 验证返回错误
    expect(result.code).not.toBe(0);
    expect(result.message).toMatch(/标题长度/);

    console.log('✅ 标题长度验证正确');
  });

  /**
   * 测试11: 创建游戏验证 - 描述长度验证
   */
  test('POST /api/v1/game - 描述长度验证', async ({ request }) => {
    const gameData = {
      title: '测试游戏',
      description: 'a'.repeat(501), // 超过500字符
      code: generateTestGameCode('test')
    };

    const response = await request.post(`${API_BASE}/game`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: gameData
    });

    const result = await response.json();

    // 验证返回错误
    expect(result.code).not.toBe(0);
    expect(result.message).toMatch(/描述不能超过/);

    console.log('✅ 描述长度验证正确');
  });

  /**
   * 测试12: 游戏ID格式验证
   */
  test('GET /api/v1/game/:gameId - 游戏ID格式不正确返回错误', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/invalid_id`, {
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
   * 测试13: 获取不存在的游戏
   */
  test('GET /api/v1/game/:gameId - 获取不存在的游戏返回错误', async ({ request }) => {
    const nonExistentGameId = 99999;

    const response = await request.get(`${API_BASE}/game/${nonExistentGameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证返回错误
    expect(result.code).not.toBe(0);
    expect(result.message).toMatch(/不存在/);

    console.log('✅ 不存在的游戏正确返回错误');
  });

  /**
   * 测试14: 未授权访问私有游戏
   */
  test('GET /api/v1/game/:gameId - 未授权访问私有游戏返回403', async ({ request }) => {
    // 用户2的token
    const user2Token = generateTestToken(2, 'test_openid_2');

    // 创建一个私有游戏（用户1）
    const createResponse = await request.post(`${API_BASE}/game`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: {
        title: '私有游戏',
        description: '这是私有游戏',
        code: generateTestGameCode('私有游戏'),
        visibility: 'private'
      }
    });

    const createResult = await createResponse.json();
    const gameId = createResult.data.id;

    // 用户2尝试访问用户1的私有游戏
    const response = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${user2Token}`
      }
    });

    const result = await response.json();

    // 验证返回403错误
    expect(result.code).toBe(2003);
    expect(result.message).toMatch(/权限/);

    console.log('✅ 未授权访问私有游戏正确返回403错误');
  });

  /**
   * 测试15: 完整的游戏流程
   */
  test('完整游戏流程: 创建 -> 查看 -> 更新 -> 克隆 -> 删除', async ({ request }) => {
    // 步骤1: 创建游戏
    const createData = {
      title: `完整流程测试_${Date.now()}`,
      description: '完整流程测试描述',
      code: generateTestGameCode('完整流程测试'),
      type: 'casual',
      visibility: 'public'
    };

    const createResponse = await request.post(`${API_BASE}/game`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: createData
    });

    const createResult = await createResponse.json();
    expect(createResult.code).toBe(0);
    const gameId = createResult.data.id;
    console.log(`步骤1: 创建游戏 - gameId=${gameId}, title=${createResult.data.title}`);

    // 步骤2: 查看游戏详情
    const getResponse = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const getResult = await getResponse.json();
    expect(getResult.code).toBe(0);
    expect(getResult.data.title).toBe(createData.title);
    console.log(`步骤2: 查看游戏详情 - ${getResult.data.title}`);

    // 步骤3: 更新游戏
    const updateData = {
      title: `更新后的标题_${Date.now()}`,
      description: '更新后的描述'
    };

    const updateResponse = await request.put(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      },
      data: updateData
    });

    const updateResult = await updateResponse.json();
    expect(updateResult.code).toBe(0);
    expect(updateResult.data.title).toBe(updateData.title);
    console.log(`步骤3: 更新游戏 - ${updateResult.data.title}`);

    // 步骤4: 克隆游戏（需要克隆另一个用户的游戏）
    // 创建一个公开的游戏供后续克隆
    const otherUserToken = generateTestToken(2, 'test_openid_2');
    const otherGameResponse = await request.post(`${API_BASE}/game`, {
      headers: {
        'Authorization': `Bearer ${otherUserToken}`
      },
      data: {
        title: `用于克隆的游戏_${Date.now()}`,
        description: '这个游戏将被克隆',
        code: generateTestGameCode('用于克隆的游戏'),
        type: 'casual',
        visibility: 'public'
      }
    });

    const otherGameResult = await otherGameResponse.json();
    const otherGameId = otherGameResult.data.id;

    const cloneResponse = await request.post(`${API_BASE}/game/${otherGameId}/clone`, {
      headers: {
        'Authorization': `Bearer ${testToken}` // 用户1克隆用户2的游戏
      }
    });

    const cloneResult = await cloneResponse.json();
    expect(cloneResult.code).toBe(0);
    const clonedGameId = cloneResult.data.id;
    console.log(`步骤4: 克隆游戏 - 原游戏ID=${otherGameId}, 新游戏ID=${clonedGameId}`);

    // 步骤5: 删除游戏
    const deleteResponse = await request.delete(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const deleteResult = await deleteResponse.json();
    expect(deleteResult.code).toBe(0);
    console.log(`步骤5: 删除游戏 - gameId=${gameId}`);

    // 步骤6: 验证游戏已删除
    const verifyResponse = await request.get(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const verifyResult = await verifyResponse.json();
    expect(verifyResult.code).not.toBe(0);
    console.log('步骤6: 验证删除成功');

    console.log('✅ 完整游戏流程测试通过');
  });

  /**
   * 测试16: 公开游戏列表分页
   */
  test('GET /api/v1/game/public - 分页参数验证', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public?limit=5&offset=0`);

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(result.data.games.length).toBeLessThanOrEqual(5);
    expect(result.data).toHaveProperty('total');

    console.log(`✅ 分页参数验证: 返回${result.data.games.length}条记录, 总共${result.data.total}条`);
  });

  /**
   * 测试17: 公开游戏列表类型筛选
   */
  test('GET /api/v1/game/public - 按类型筛选', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public?type=casual`);

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(Array.isArray(result.data.games)).toBe(true);

    // 验证返回的游戏都是指定类型
    result.data.games.forEach(game => {
      expect(game.type).toBe('casual');
    });

    console.log(`✅ 类型筛选验证: 筛选出${result.data.games.length}个休闲游戏`);
  });

  /**
   * 测试18: 无Token访问需要认证的接口
   */
  test('POST /api/v1/game - 未提供Token返回401', async ({ request }) => {
    const response = await request.post(`${API_BASE}/game`, {
      data: {
        title: '测试游戏',
        code: generateTestGameCode('test')
      }
    });

    const result = await response.json();

    // 验证返回401错误
    expect(result.code).toBe(401);
    expect(result.message).toBe('未提供认证Token');

    console.log('✅ 未提供Token正确返回401错误');
  });

  /**
   * 测试19: 并发创建游戏
   */
  test('并发创建游戏 - 多个用户同时创建游戏', async ({ request }) => {
    const user1Token = generateTestToken(1, 'test_openid_1');
    const user2Token = generateTestToken(2, 'test_openid_2');
    const user3Token = generateTestToken(3, 'test_openid_3');

    // 并发创建3个游戏
    const promises = [
      request.post(`${API_BASE}/game`, {
        headers: { 'Authorization': `Bearer ${user1Token}` },
        data: {
          title: '用户1的游戏',
          code: generateTestGameCode('用户1的游戏')
        }
      }),
      request.post(`${API_BASE}/game`, {
        headers: { 'Authorization': `Bearer ${user2Token}` },
        data: {
          title: '用户2的游戏',
          code: generateTestGameCode('用户2的游戏')
        }
      }),
      request.post(`${API_BASE}/game`, {
        headers: { 'Authorization': `Bearer ${user3Token}` },
        data: {
          title: '用户3的游戏',
          code: generateTestGameCode('用户3的游戏')
        }
      })
    ];

    const responses = await Promise.all(promises);

    // 验证所有响应都成功（201表示资源创建成功）
    responses.forEach((response, index) => {
      expect([200, 201]).toContain(response.status());
    });

    console.log('✅ 并发创建游戏测试通过');
  });

  /**
   * 测试20: 我的游戏可见性筛选
   */
  test('GET /api/v1/game/my - 按可见性筛选', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/my?visibility=private`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const result = await response.json();

    // 验证成功响应
    expect(result.code).toBe(0);
    expect(Array.isArray(result.data.games)).toBe(true);

    // 验证返回的游戏都是私有游戏
    result.data.games.forEach(game => {
      expect(game.visibility).toBe('private');
    });

    console.log(`✅ 可见性筛选验证: 筛选出${result.data.games.length}个私有游戏`);
  });
});
