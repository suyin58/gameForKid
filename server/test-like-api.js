/**
 * 点赞功能API测试脚本
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
 * 测试点赞游戏
 */
async function testLikeGame(gameId, token) {
  log.title('测试点赞游戏');

  try {
    const response = await axios.post(`${API_BASE}/like/${gameId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.code === 0) {
      log.success('点赞成功');
      console.log('   点赞结果:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      log.error('点赞失败: ' + response.data.message);
      return null;
    }
  } catch (error) {
    log.error('请求失败: ' + error.message);
    if (error.response) {
      console.log('   错误详情:', error.response.data);
    }
    return null;
  }
}

/**
 * 测试检查点赞状态
 */
async function testCheckLikeStatus(gameId, token) {
  log.title('测试检查点赞状态');

  try {
    const response = await axios.get(`${API_BASE}/like/${gameId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.code === 0) {
      log.success('检查点赞状态成功');
      console.log('   点赞状态:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      log.error('检查点赞状态失败: ' + response.data.message);
      return null;
    }
  } catch (error) {
    log.error('请求失败: ' + error.message);
    return null;
  }
}

/**
 * 测试获取游戏点赞用户列表
 */
async function testGetGameLikers(gameId) {
  log.title('测试获取游戏点赞用户列表');

  try {
    const response = await axios.get(`${API_BASE}/like/${gameId}/users?limit=10`);

    if (response.data.code === 0) {
      log.success('获取点赞用户列表成功');
      console.log(`   点赞用户数量: ${response.data.data.likers.length}`);
      console.log(`   总点赞数: ${response.data.data.total}`);
      if (response.data.data.likers.length > 0) {
        console.log('   第一个点赞用户:', JSON.stringify(response.data.data.likers[0], null, 2));
      }
      return response.data.data;
    } else {
      log.error('获取点赞用户列表失败: ' + response.data.message);
      return null;
    }
  } catch (error) {
    log.error('请求失败: ' + error.message);
    return null;
  }
}

/**
 * 测试获取用户点赞的游戏列表
 */
async function testGetUserLikedGames(token) {
  log.title('测试获取用户点赞的游戏列表');

  try {
    const response = await axios.get(`${API_BASE}/like/my`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.code === 0) {
      log.success('获取用户点赞游戏列表成功');
      console.log(`   点赞游戏数量: ${response.data.data.games.length}`);
      console.log(`   总点赞游戏数: ${response.data.data.total}`);
      if (response.data.data.games.length > 0) {
        console.log('   第一个点赞游戏:', JSON.stringify(response.data.data.games[0], null, 2));
      }
      return response.data.data;
    } else {
      log.error('获取用户点赞游戏列表失败: ' + response.data.message);
      return null;
    }
  } catch (error) {
    log.error('请求失败: ' + error.message);
    return null;
  }
}

/**
 * 测试取消点赞
 */
async function testUnlikeGame(gameId, token) {
  log.title('测试取消点赞');

  try {
    const response = await axios.delete(`${API_BASE}/like/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.code === 0) {
      log.success('取消点赞成功');
      console.log('   取消点赞结果:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      log.error('取消点赞失败: ' + response.data.message);
      return null;
    }
  } catch (error) {
    log.error('请求失败: ' + error.message);
    if (error.response) {
      console.log('   错误详情:', error.response.data);
    }
    return null;
  }
}

/**
 * 测试重复点赞（应该失败）
 */
async function testDuplicateLike(gameId, token) {
  log.title('测试重复点赞（应该返回错误）');

  try {
    const response = await axios.post(`${API_BASE}/like/${gameId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.code === 0) {
      log.error('不应该允许重复点赞');
      return false;
    } else {
      log.success('正确阻止重复点赞: ' + response.data.message);
      return true;
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.success('正确返回400错误: ' + error.response.data.message);
      return true;
    } else {
      log.error('请求失败: ' + error.message);
      return false;
    }
  }
}

/**
 * 测试未点赞就取消（应该失败）
 */
async function testUnlikeBeforeLike(gameId, token) {
  log.title('测试未点赞就取消（应该返回错误）');

  try {
    const response = await axios.delete(`${API_BASE}/like/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.code === 0) {
      log.error('不应该允许未点赞就取消');
      return false;
    } else {
      log.success('正确阻止未点赞就取消: ' + response.data.message);
      return true;
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.success('正确返回400错误: ' + error.response.data.message);
      return true;
    } else {
      log.error('请求失败: ' + error.message);
      return false;
    }
  }
}

/**
 * 测试给自己游戏点赞（应该失败）
 */
async function testLikeOwnGame(gameId, userId, token) {
  log.title('测试给自己游戏点赞（应该返回错误）');

  try {
    // 先获取游戏信息，确认是自己的游戏
    const gameResponse = await axios.get(`${API_BASE}/game/${gameId}`);
    if (gameResponse.data.data.user_id !== userId) {
      log.info('跳过：不是自己的游戏');
      return true;
    }

    const response = await axios.post(`${API_BASE}/like/${gameId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.code === 0) {
      log.error('不应该允许给自己游戏点赞');
      return false;
    } else {
      log.success('正确阻止给自己游戏点赞: ' + response.data.message);
      return true;
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.success('正确返回400错误: ' + error.response.data.message);
      return true;
    } else {
      log.error('请求失败: ' + error.message);
      return false;
    }
  }
}

/**
 * 运行所有测试
 */
async function runTests() {
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}         点赞功能 API 测试${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);

  // 使用用户2的Token（用户2点赞用户1的游戏）
  const user1Token = generateTestToken(1, 'test_openid_1');
  const user2Token = generateTestToken(2, 'test_openid_2');

  log.info('使用测试用户1和用户2的Token');

  // 先获取一个游戏ID（使用用户1的游戏）
  let gameId = 1; // 假设游戏ID为1存在

  try {
    const gameResponse = await axios.get(`${API_BASE}/game/public?limit=1`);
    if (gameResponse.data.code === 0 && gameResponse.data.data.games.length > 0) {
      gameId = gameResponse.data.data.games[0].id;
      log.info(`使用游戏ID: ${gameId}`);
    }
  } catch (error) {
    log.error('获取游戏列表失败');
  }

  // 1. 用户2检查点赞状态（应该是未点赞）
  await testCheckLikeStatus(gameId, user2Token);

  // 2. 用户2点赞游戏
  const likeResult = await testLikeGame(gameId, user2Token);

  // 3. 再次检查点赞状态（应该是已点赞）
  if (likeResult) {
    await testCheckLikeStatus(gameId, user2Token);
  }

  // 4. 获取游戏点赞用户列表
  await testGetGameLikers(gameId);

  // 5. 获取用户2点赞的游戏列表
  await testGetUserLikedGames(user2Token);

  // 6. 测试重复点赞（应该失败）
  await testDuplicateLike(gameId, user2Token);

  // 7. 用户2取消点赞
  const unlikeResult = await testUnlikeGame(gameId, user2Token);

  // 8. 再次检查点赞状态（应该是未点赞）
  if (unlikeResult) {
    await testCheckLikeStatus(gameId, user2Token);
  }

  // 9. 测试未点赞就取消（应该失败）
  await testUnlikeBeforeLike(gameId, user2Token);

  // 10. 测试给自己游戏点赞（应该失败）
  await testLikeOwnGame(gameId, 1, user1Token);

  // 11. 用户2重新点赞，用于最终验证
  await testLikeGame(gameId, user2Token);

  // 12. 最终获取游戏点赞用户列表
  await testGetGameLikers(gameId);

  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  log.success('所有测试完成！');
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);
}

// 运行测试
runTests().catch(error => {
  log.error('测试运行失败: ' + error.message);
  process.exit(1);
});
