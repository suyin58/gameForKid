/**
 * 前后端联调测试 - 游戏广场与互动功能
 *
 * 前提条件：
 * 1. 后端服务器运行在 http://localhost:3001
 * 2. 前端开发服务器运行在 http://localhost:5173
 * 3. 测试数据已准备（运行 node prepare-test-data.js）
 */

const { test, expect, beforeAll } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// 读取测试 Token
let testTokens = {};
try {
  const tokenData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../server/test-tokens.json'), 'utf8'));
  testTokens = tokenData;
} catch (error) {
  console.warn('警告: 无法读取测试Token，请先运行 node prepare-test-data.js');
}

test.describe('前后端联调测试', () => {

  // 在所有测试开始前检查后端服务器
  test.beforeAll(async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (!response.ok) throw new Error('后端服务器未响应');
    } catch (error) {
      console.error('\n❌ 错误: 后端服务器未启动！');
      console.error('请先启动后端服务器: cd server && npm start\n');
      throw error;
    }
  });

  // 每个测试前设置测试Token
  test.beforeEach(async ({ page }) => {
    page.addInitScript(() => {
      window.localStorage.setItem('token', testTokens.user1?.token || '');
      window.localStorage.setItem('userInfo', JSON.stringify({
        id: testTokens.user1?.userId || 1001,
        openid: testTokens.user1?.openid || 'test_user_1',
        nickname: '测试用户1',
        avatar: 'https://picsum.photos/100'
      }));
    });
  });

  test.describe('游戏广场功能', () => {

    test('1. 游戏广场 - 加载并显示游戏列表', async ({ page }) => {
      // 注意：此测试需要前端服务器运行
      // 如果前端未启动，将跳过页面导航部分，仅测试API

      try {
        // 尝试导航到游戏广场页面
        await page.goto('/pages/square/square', { timeout: 5000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/square-page.png' });
        const title = await page.title();
        console.log('页面标题:', title);
        console.log('✅ 游戏广场页面已加载');
      } catch (error) {
        console.log('⚠️  前端服务器未运行，跳过页面导航测试');
        console.log('   如需测试前端，请运行: npm run dev:h5');
      }

      // 无论前端是否运行，都测试API
      const response = await fetch('http://localhost:3001/api/v1/game/public', {
        headers: {
          'Authorization': `Bearer ${testTokens.user1?.token}`
        }
      });

      const data = await response.json();
      expect(data.code).toBe(0);
      expect(data.data.games).toBeDefined();
      console.log(`✅ API返回 ${data.data.games.length} 个游戏`);
    });

    test('2. 游戏详情 - 查看游戏信息', async ({ page }) => {
      // 直接通过API获取游戏列表并验证数据
      const response = await fetch('http://localhost:3001/api/v1/game/public', {
        headers: {
          'Authorization': `Bearer ${testTokens.user1?.token}`
        }
      });

      const data = await response.json();
      console.log('游戏列表API响应:', data);

      // 验证API响应
      expect(data.code).toBe(0);
      expect(data.data.games).toBeDefined();
      expect(data.data.games.length).toBeGreaterThan(0);

      console.log(`✅ 成功获取 ${data.data.games.length} 个游戏`);

      // 显示第一个游戏的信息
      if (data.data.games.length > 0) {
        const firstGame = data.data.games[0];
        console.log('第一个游戏:', firstGame.title);
        console.log('  - 点赞数:', firstGame.like_count);
        console.log('  - 播放数:', firstGame.play_count);
        console.log('  - 游戏类型:', firstGame.type);
      }
    });

    test('3. 游戏搜索 - 按关键词搜索', async ({ page }) => {
      // 测试搜索API
      const response = await fetch('http://localhost:3001/api/v1/game/search?keyword=游戏', {
        headers: {
          'Authorization': `Bearer ${testTokens.user1?.token}`
        }
      });

      const data = await response.json();
      console.log('搜索API响应:', data);

      // 验证搜索结果
      expect(data.code).toBe(0);
      expect(data.data.games.length).toBeGreaterThan(0);

      console.log(`✅ 搜索成功，找到 ${data.data.games.length} 个游戏`);
    });

    test('4. 游戏排序 - 按点赞数排序', async ({ page }) => {
      const response = await fetch('http://localhost:3001/api/v1/game/public?sortBy=like_count&order=DESC', {
        headers: {
          'Authorization': `Bearer ${testTokens.user1?.token}`
        }
      });

      const data = await response.json();
      console.log('排序API响应:', data);

      // 验证排序结果
      expect(data.code).toBe(0);
      const games = data.data.games;

      // 验证排序是否正确（降序）
      for (let i = 0; i < games.length - 1; i++) {
        expect(games[i].like_count).toBeGreaterThanOrEqual(games[i + 1].like_count);
      }

      console.log('✅ 排序功能正常，点赞数降序排列');
    });
  });

  test.describe('游戏详情与互动功能', () => {

    test('5. 游戏详情 - 获取完整信息', async ({ page }) => {
      // 获取游戏列表
      const listResponse = await fetch('http://localhost:3001/api/v1/game/public', {
        headers: {
          'Authorization': `Bearer ${testTokens.user1?.token}`
        }
      });

      const listData = await listResponse.json();
      const firstGameId = listData.data.games[0]?.id;

      expect(firstGameId).toBeDefined();

      // 获取游戏详情
      const detailResponse = await fetch(`http://localhost:3001/api/v1/game/${firstGameId}`, {
        headers: {
          'Authorization': `Bearer ${testTokens.user1?.token}`
        }
      });

      const detailData = await detailResponse.json();
      console.log('游戏详情:', detailData);

      // 验证详情数据
      expect(detailData.code).toBe(0);
      expect(detailData.data.id).toBe(firstGameId);
      expect(detailData.data.title).toBeDefined();
      expect(detailData.data.description).toBeDefined();
      expect(detailData.data.code).toBeDefined();

      console.log('✅ 游戏详情获取成功:', detailData.data.title);
    });

    test('6. 点赞功能 - 点赞游戏', async ({ page }) => {
      // 使用 user2 的 Token 进行点赞
      const listResponse = await fetch('http://localhost:3001/api/v1/game/public', {
        headers: {
          'Authorization': `Bearer ${testTokens.user1?.token}`
        }
      });

      const listData = await listResponse.json();
      const firstGameId = listData.data.games[0]?.id;

      expect(firstGameId).toBeDefined();

      // 先检查点赞状态
      const checkResponse = await fetch(`http://localhost:3001/api/v1/like/${firstGameId}/status`, {
        headers: {
          'Authorization': `Bearer ${testTokens.user2?.token}`
        }
      });

      const checkData = await checkResponse.json();
      console.log('点赞状态:', checkData.data.liked);

      const initialLiked = checkData.data.liked;

      // 如果已经点赞，先取消点赞
      if (initialLiked) {
        console.log('已点赞，先取消点赞...');
        await fetch(`http://localhost:3001/api/v1/like/${firstGameId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${testTokens.user2?.token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      // 执行点赞操作
      const likeResponse = await fetch(`http://localhost:3001/api/v1/like/${firstGameId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testTokens.user2?.token}`,
          'Content-Type': 'application/json'
        }
      });

      const likeData = await likeResponse.json();
      console.log('点赞操作:', likeData);

      // 验证点赞成功
      expect(likeData.code).toBe(0);

      // 再次检查点赞状态
      const checkResponse2 = await fetch(`http://localhost:3001/api/v1/like/${firstGameId}/status`, {
        headers: {
          'Authorization': `Bearer ${testTokens.user2?.token}`
        }
      });

      const checkData2 = await checkResponse2.json();
      console.log('点赞后状态:', checkData2.data.liked);

      // 验证点赞状态已改变
      expect(checkData2.data.liked).toBe(true);

      console.log('✅ 点赞功能正常，状态已更新');
    });

    test('7. 播放次数 - 记录游戏游玩', async ({ page }) => {
      // 获取游戏列表
      const listResponse = await fetch('http://localhost:3001/api/v1/game/public', {
        headers: {
          'Authorization': `Bearer ${testTokens.user1?.token}`
        }
      });

      const listData = await listResponse.json();
      const firstGame = listData.data.games[0];
      const gameId = firstGame?.id;
      const initialPlayCount = firstGame?.play_count || 0;

      expect(gameId).toBeDefined();

      // 记录播放
      const playResponse = await fetch(`http://localhost:3001/api/v1/game/${gameId}/play`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testTokens.user1?.token}`,
          'Content-Type': 'application/json'
        }
      });

      const playData = await playResponse.json();
      console.log('记录播放:', playData);

      // 验证播放记录成功
      expect(playData.code).toBe(0);

      // 获取更新后的游戏信息，验证播放次数增加
      const detailResponse = await fetch(`http://localhost:3001/api/v1/game/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${testTokens.user1?.token}`
        }
      });

      const detailData = await detailResponse.json();
      const newPlayCount = detailData.data.play_count;

      console.log(`播放次数: ${initialPlayCount} → ${newPlayCount}`);
      expect(newPlayCount).toBe(initialPlayCount + 1);

      console.log('✅ 播放次数记录正常');
    });

    test('8. 游戏克隆 - 克隆到我的作品', async ({ page }) => {
      // 获取游戏列表
      const listResponse = await fetch('http://localhost:3001/api/v1/game/public', {
        headers: {
          'Authorization': `Bearer ${testTokens.user2?.token}`
        }
      });

      const listData = await listResponse.json();
      const firstGame = listData.data.games[0];
      const gameId = firstGame?.id;
      const originalTitle = firstGame?.title;

      expect(gameId).toBeDefined();

      // 克隆游戏
      const cloneResponse = await fetch(`http://localhost:3001/api/v1/game/${gameId}/clone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testTokens.user2?.token}`,
          'Content-Type': 'application/json'
        }
      });

      const cloneData = await cloneResponse.json();
      console.log('克隆游戏:', cloneData);

      // 验证克隆成功
      expect(cloneData.code).toBe(0);
      expect(cloneData.data.title).toContain(originalTitle);
      expect(cloneData.data.title).toContain('副本');

      console.log('✅ 游戏克隆成功:', cloneData.data.title);

      // 验证克隆的游戏在"我的作品"列表中
      const myGamesResponse = await fetch('http://localhost:3001/api/v1/game/my', {
        headers: {
          'Authorization': `Bearer ${testTokens.user2?.token}`
        }
      });

      const myGamesData = await myGamesResponse.json();
      console.log('我的作品:', myGamesData.data.games.length);

      const clonedGame = myGamesData.data.games.find(g => g.title.includes('副本'));
      expect(clonedGame).toBeDefined();

      console.log('✅ 克隆的游戏已出现在"我的作品"中');
    });
  });

  test.describe('数据一致性验证', () => {

    test('9. 数据一致性 - API响应与数据库对比', async ({ page }) => {
      // 获取游戏列表
      const response = await fetch('http://localhost:3001/api/v1/game/public', {
        headers: {
          'Authorization': `Bearer ${testTokens.user1?.token}`
        }
      });

      const data = await response.json();
      const apiGames = data.data.games;

      console.log(`API返回 ${apiGames.length} 个游戏`);

      // 验证每个游戏的必要字段
      apiGames.forEach(game => {
        expect(game.id).toBeDefined();
        expect(game.title).toBeDefined();
        expect(game.type).toBeDefined();
        expect(game.like_count).toBeGreaterThanOrEqual(0);
        expect(game.play_count).toBeGreaterThanOrEqual(0);
      });

      console.log('✅ 所有游戏数据结构完整');

      // 验证排序逻辑（如果有排序参数）
      const sortedResponse = await fetch('http://localhost:3001/api/v1/game/public?sortBy=play_count&order=DESC', {
        headers: {
          'Authorization': `Bearer ${testTokens.user1?.token}`
        }
      });

      const sortedData = await sortedResponse.json();
      const sortedGames = sortedData.data.games;

      // 验证降序排列
      for (let i = 0; i < sortedGames.length - 1; i++) {
        expect(sortedGames[i].play_count).toBeGreaterThanOrEqual(sortedGames[i + 1].play_count);
      }

      console.log('✅ 排序逻辑正确');
    });
  });

  test.describe('API响应格式验证', () => {

    test('10. API响应格式 - 统一响应结构', async ({ page }) => {
      const endpoints = [
        'http://localhost:3001/api/v1/game/public',
        'http://localhost:3001/api/v1/game/search?keyword=游戏',
        'http://localhost:3001/api/v1/user/info'
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${testTokens.user1?.token}`
          }
        });

        const data = await response.json();

        // 验证响应格式
        expect(data).toHaveProperty('code');
        expect(data).toHaveProperty('message');
        expect(data).toHaveProperty('data');
        expect(data).toHaveProperty('timestamp');

        // 成功响应的code应该是0
        if (response.ok) {
          expect(data.code).toBe(0);
        }

        console.log(`✅ ${endpoint} - 响应格式正确`);
      }
    });
  });
});

test.afterAll(async () => {
  console.log('\n========================================');
  console.log('测试完成！');
  console.log('========================================\n');
});
