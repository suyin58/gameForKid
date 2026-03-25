/**
 * 功能7：游戏广场增强 - E2E测试
 *
 * 测试内容：
 * 1. 游戏搜索功能（按标题/作者）
 * 2. 排序功能（按热度/时间/点赞数）
 * 3. 分页功能
 * 4. 类型过滤
 */

const { test, expect } = require('@playwright/test');

const API_BASE = 'http://localhost:3001/api/v1';

/**
 * 游戏搜索测试套件
 */
test.describe('游戏搜索功能', () => {

  test('GET /api/v1/game/search - 搜索游戏标题', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/search?keyword=游戏`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);
    expect(result.message).toBe('搜索游戏成功');
    expect(result.data).toHaveProperty('games');
    expect(result.data).toHaveProperty('total');
    expect(Array.isArray(result.data.games)).toBe(true);
  });

  test('GET /api/v1/game/search - 搜索作者昵称', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/search?keyword=用户A`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);
    expect(result.data).toHaveProperty('games');
    expect(result.data).toHaveProperty('total');
  });

  test('GET /api/v1/game/search - 空关键词返回400错误', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/search?keyword=`);

    expect(response.status()).toBe(400);

    const result = await response.json();
    expect(result.code).toBe(1001);
    expect(result.message).toBe('搜索关键词不能为空');
  });

  test('GET /api/v1/game/search - 超长关键词返回400错误', async ({ request }) => {
    const longKeyword = 'a'.repeat(51);
    const response = await request.get(`${API_BASE}/game/search?keyword=${longKeyword}`);

    expect(response.status()).toBe(400);

    const result = await response.json();
    expect(result.code).toBe(1001);
    expect(result.message).toContain('关键词过长');
  });

  test('GET /api/v1/game/search - 类型过滤 + 搜索', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/search?keyword=游戏&type=casual`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);

    // 验证所有结果都是休闲游戏
    result.data.games.forEach(game => {
      expect(game.type).toBe('casual');
    });
  });

  test('GET /api/v1/game/search - 按点赞数排序', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/search?keyword=游戏&sortBy=like_count&order=DESC`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);

    // 验证排序正确
    const games = result.data.games;
    for (let i = 0; i < games.length - 1; i++) {
      expect(games[i].like_count).toBeGreaterThanOrEqual(games[i + 1].like_count);
    }
  });

  test('GET /api/v1/game/search - 按时间排序', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/search?keyword=游戏&sortBy=created_at&order=DESC`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);
  });

  test('GET /api/v1/game/search - 分页功能', async ({ request }) => {
    const response1 = await request.get(`${API_BASE}/game/search?keyword=游戏&limit=5&offset=0`);
    const response2 = await request.get(`${API_BASE}/game/search?keyword=游戏&limit=5&offset=5`);

    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);

    const result1 = await response1.json();
    const result2 = await response2.json();

    expect(result1.code).toBe(0);
    expect(result2.code).toBe(0);

    expect(result1.data.games.length).toBeLessThanOrEqual(5);
    expect(result2.data.games.length).toBeLessThanOrEqual(5);
  });

  test('GET /api/v1/game/search - 搜索不存在的游戏返回空结果', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/search?keyword=xyzabc123notexist`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);
    expect(result.data.total).toBe(0);
    expect(result.data.games.length).toBe(0);
  });
});

/**
 * 游戏排序测试套件
 */
test.describe('游戏广场排序功能', () => {

  test('GET /api/v1/game/public - 按创建时间降序（默认）', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);
    expect(result.data).toHaveProperty('games');
    expect(result.data).toHaveProperty('total');
  });

  test('GET /api/v1/game/public - 按点赞数排序', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public?sortBy=like_count&order=DESC`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);

    // 验证排序正确
    const games = result.data.games;
    if (games.length > 1) {
      for (let i = 0; i < games.length - 1; i++) {
        expect(games[i].like_count).toBeGreaterThanOrEqual(games[i + 1].like_count);
      }
    }
  });

  test('GET /api/v1/game/public - 按播放次数排序', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public?sortBy=play_count&order=DESC`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);

    // 验证排序正确
    const games = result.data.games;
    if (games.length > 1) {
      for (let i = 0; i < games.length - 1; i++) {
        expect(games[i].play_count).toBeGreaterThanOrEqual(games[i + 1].play_count);
      }
    }
  });

  test('GET /api/v1/game/public - 升序排序', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public?sortBy=created_at&order=ASC`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);
  });
});

/**
 * 游戏类型过滤测试套件
 */
test.describe('游戏类型过滤', () => {

  test('GET /api/v1/game/public - 过滤休闲游戏', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public?type=casual`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);

    // 验证所有结果都是休闲游戏
    result.data.games.forEach(game => {
      expect(game.type).toBe('casual');
    });
  });

  test('GET /api/v1/game/public - 过滤教育游戏', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public?type=education`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);

    result.data.games.forEach(game => {
      expect(game.type).toBe('education');
    });
  });

  test('GET /api/v1/game/public - 获取所有类型', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public?type=all`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);
  });
});

/**
 * 分页功能测试套件
 */
test.describe('分页功能', () => {

  test('GET /api/v1/game/public - 默认分页参数', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);
    expect(result.data.games.length).toBeLessThanOrEqual(20); // 默认limit=20
  });

  test('GET /api/v1/game/public - 自定义分页大小', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public?limit=5`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);
    expect(result.data.games.length).toBeLessThanOrEqual(5);
  });

  test('GET /api/v1/game/public - 分页偏移', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public?limit=10&offset=5`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);
    expect(result.data.games.length).toBeLessThanOrEqual(10);
  });

  test('GET /api/v1/game/public - 限制最大分页大小', async ({ request }) => {
    const response = await request.get(`${API_BASE}/game/public?limit=200`);

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.code).toBe(0);
    expect(result.data.games.length).toBeLessThanOrEqual(100); // 最大limit=100
  });
});
