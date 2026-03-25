/**
 * 游戏CRUD API测试脚本
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
 * 测试创建游戏
 */
async function testCreateGame(token) {
  log.title('测试创建游戏');

  try {
    const sampleCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>测试游戏</title>
</head>
<body>
  <h1>Hello World!</h1>
  <script>
    console.log('游戏开始');
  </script>
</body>
</html>`;

    const response = await axios.post(`${API_BASE}/game`,
      {
        title: '测试游戏',
        description: '这是一个测试游戏',
        code: sampleCode,
        type: 'casual',
        visibility: 'public'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.data.code === 0) {
      log.success('创建游戏成功');
      console.log('   游戏信息:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      log.error('创建游戏失败: ' + response.data.message);
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
 * 测试获取游戏详情
 */
async function testGetGameById(gameId, token) {
  log.title('测试获取游戏详情');

  try {
    const response = await axios.get(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.code === 0) {
      log.success('获取游戏详情成功');
      console.log('   游戏详情:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      log.error('获取游戏详情失败: ' + response.data.message);
      return null;
    }
  } catch (error) {
    log.error('请求失败: ' + error.message);
    return null;
  }
}

/**
 * 测试获取公开游戏列表
 */
async function testGetPublicGames() {
  log.title('测试获取公开游戏列表');

  try {
    const response = await axios.get(`${API_BASE}/game/public?limit=10`);

    if (response.data.code === 0) {
      log.success('获取公开游戏列表成功');
      console.log(`   游戏数量: ${response.data.data.games.length}`);
      console.log(`   总数: ${response.data.data.total}`);
      if (response.data.data.games.length > 0) {
        console.log('   第一个游戏:', JSON.stringify(response.data.data.games[0], null, 2));
      }
      return response.data.data.games;
    } else {
      log.error('获取公开游戏列表失败: ' + response.data.message);
      return [];
    }
  } catch (error) {
    log.error('请求失败: ' + error.message);
    return [];
  }
}

/**
 * 测试获取用户游戏列表
 */
async function testGetMyGames(token) {
  log.title('测试获取当前用户游戏列表');

  try {
    const response = await axios.get(`${API_BASE}/game/my`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.code === 0) {
      log.success('获取用户游戏列表成功');
      console.log(`   游戏数量: ${response.data.data.games.length}`);
      return response.data.data.games;
    } else {
      log.error('获取用户游戏列表失败: ' + response.data.message);
      return [];
    }
  } catch (error) {
    log.error('请求失败: ' + error.message);
    return [];
  }
}

/**
 * 测试更新游戏
 */
async function testUpdateGame(gameId, token) {
  log.title('测试更新游戏');

  try {
    const response = await axios.put(`${API_BASE}/game/${gameId}`,
      {
        title: '测试游戏（已更新）',
        description: '这是更新后的描述'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.data.code === 0) {
      log.success('更新游戏成功');
      console.log('   更新后信息:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      log.error('更新游戏失败: ' + response.data.message);
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
 * 测试增加播放次数
 */
async function testPlayGame(gameId) {
  log.title('测试增加游戏播放次数');

  try {
    const response = await axios.post(`${API_BASE}/game/${gameId}/play`);

    if (response.data.code === 0) {
      log.success('增加播放次数成功');
      return true;
    } else {
      log.error('增加播放次数失败: ' + response.data.message);
      return false;
    }
  } catch (error) {
    log.error('请求失败: ' + error.message);
    return false;
  }
}

/**
 * 测试克隆游戏
 */
async function testCloneGame(gameId, token) {
  log.title('测试克隆游戏');

  try {
    const response = await axios.post(`${API_BASE}/game/${gameId}/clone`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.code === 0) {
      log.success('克隆游戏成功');
      console.log('   新游戏信息:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      log.error('克隆游戏失败: ' + response.data.message);
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
 * 测试删除游戏
 */
async function testDeleteGame(gameId, token) {
  log.title('测试删除游戏');

  try {
    const response = await axios.delete(`${API_BASE}/game/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.code === 0) {
      log.success('删除游戏成功');
      return true;
    } else {
      log.error('删除游戏失败: ' + response.data.message);
      return false;
    }
  } catch (error) {
    log.error('请求失败: ' + error.message);
    if (error.response) {
      console.log('   错误详情:', error.response.data);
    }
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runTests() {
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}         游戏CRUD API 测试${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);

  // 使用用户1的Token
  const testToken = generateTestToken(1, 'test_openid_1');
  log.info('使用测试用户1的Token');

  // 1. 获取公开游戏列表（先查看现有游戏）
  await testGetPublicGames();

  // 2. 创建新游戏
  const newGame = await testCreateGame(testToken);

  if (newGame) {
    // 3. 获取游戏详情
    await testGetGameById(newGame.id, testToken);

    // 4. 获取用户游戏列表
    await testGetMyGames(testToken);

    // 5. 更新游戏
    await testUpdateGame(newGame.id, testToken);

    // 6. 增加播放次数
    await testPlayGame(newGame.id);

    // 7. 再次获取游戏详情查看播放次数
    await testGetGameById(newGame.id, testToken);

    // 8. 克隆游戏（使用用户2的Token）
    const user2Token = generateTestToken(2, 'test_openid_2');
    log.info('\n切换到测试用户2进行克隆测试');
    const clonedGame = await testCloneGame(newGame.id, user2Token);

    if (clonedGame) {
      // 9. 删除克隆的游戏
      await testDeleteGame(clonedGame.id, user2Token);
    }

    // 10. 删除原游戏
    await testDeleteGame(newGame.id, testToken);
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
