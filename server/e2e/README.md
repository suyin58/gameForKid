# E2E 测试文档

## 📋 概述

本目录包含使用 Playwright 编写的端到端（E2E）测试用例。

## 🧪 测试工具

- **Playwright**: Microsoft 开发的现代 E2E 测试框架
- **Chromium**: 用于测试的浏览器
- **Node.js**: 运行环境

## 📁 目录结构

```
e2e/
├── helpers/
│   └── test-helper.js       # 测试辅助工具
├── user-system.spec.js      # 用户系统 E2E 测试（12个测试）
├── game-system.spec.js      # 游戏系统 E2E 测试（20个测试）
└── README.md                # 本文档
```

## 🚀 快速开始

### 安装依赖

```bash
npm install --save-dev @playwright/test
```

### 安装浏览器

```bash
npx playwright install chromium
```

### 运行所有测试

```bash
npx playwright test
```

### 运行特定测试文件

```bash
npx playwright test e2e/user-system.spec.js
```

### 生成 HTML 测试报告

```bash
npx playwright test --reporter=html
```

报告生成在 `playwright-report/index.html`

### 查看测试报告

```bash
npx playwright show-report
```

## 📊 测试覆盖

### 用户系统测试 (user-system.spec.js)

✅ **12个测试用例，全部通过**

1. **POST /api/v1/user/login** - 微信登录
   - 验证登录接口响应格式

2. **GET /api/v1/user/info** - 获取当前用户信息
   - 验证Token认证
   - 验证返回数据格式

3. **GET /api/v1/user/:userId** - 获取指定用户信息
   - 验证公开接口访问

4. **PUT /api/v1/user/info** - 更新用户信息
   - 验证数据更新
   - 验证数据持久化

5. **GET /api/v1/user/info** - 无效Token返回401
   - 验证Token验证机制

6. **GET /api/v1/user/info** - 未提供Token返回401
   - 验证认证要求

7. **GET /api/v1/user/:userId** - 用户ID格式验证
   - 验证参数校验

8. **PUT /api/v1/user/info** - 昵称长度验证
   - 验证数据验证

9. **完整用户流程** - 登录 → 查看信息 → 修改信息 → 验证
   - 验证端到端流程

10. **GET /api/v1/user/:userId** - 不存在的用户返回错误
    - 验证错误处理

11. **GET /api/v1/user/info** - Token过期返回401
    - 验证Token过期处理

12. **并发请求测试** - 多个用户同时获取信息
    - 验证并发处理

### 游戏系统测试 (game-system.spec.js)

✅ **20个测试用例，全部通过**

1. **POST /api/v1/game** - 创建游戏
   - 验证游戏创建成功
   - 验证返回数据格式

2. **GET /api/v1/game/my** - 获取我的游戏列表
   - 验证Token认证
   - 验证返回用户自己的游戏

3. **GET /api/v1/game/public** - 获取公开游戏广场列表
   - 验证无需认证即可访问
   - 验证返回公开游戏

4. **GET /api/v1/game/:gameId** - 获取游戏详情
   - 验证游戏详情获取
   - 验证包含点赞数和播放次数

5. **PUT /api/v1/game/:gameId** - 更新游戏
   - 验证游戏更新
   - 验证数据持久化

6. **DELETE /api/v1/game/:gameId** - 删除游戏
   - 验证删除功能
   - 验证删除后无法访问

7. **POST /api/v1/game/:gameId/play** - 增加播放次数
   - 验证播放次数递增

8. **POST /api/v1/game/:gameId/clone** - 克隆游戏
   - 验证克隆功能
   - 验证禁止克隆自己的游戏

9. **创建游戏验证** - 缺少必填字段
   - 验证code字段必填

10. **创建游戏验证** - 标题长度验证
    - 验证标题长度限制（1-50字符）

11. **创建游戏验证** - 描述长度验证
    - 验证描述长度限制（最多500字符）

12. **GET /api/v1/game/:gameId** - 游戏ID格式验证
    - 验证参数校验

13. **GET /api/v1/game/:gameId** - 获取不存在的游戏
    - 验证错误处理

14. **GET /api/v1/game/:gameId** - 未授权访问私有游戏
    - 验证权限控制（403错误）

15. **完整游戏流程** - 创建 → 查看 → 更新 → 克隆 → 删除
    - 验证端到端流程

16. **GET /api/v1/game/public** - 分页参数验证
    - 验证分页功能

17. **GET /api/v1/game/public** - 按类型筛选
    - 验证类型筛选功能

18. **POST /api/v1/game** - 未提供Token返回401
    - 验证认证要求

19. **并发创建游戏** - 多个用户同时创建游戏
    - 验证并发处理

20. **GET /api/v1/game/my** - 按可见性筛选
    - 验证可见性筛选功能

## 📝 测试结果

### 最新测试运行

#### 用户系统测试
```
✅ 12 passed (850ms)
```
所有测试用例通过，平均响应时间约70ms/测试。

#### 游戏系统测试
```
✅ 20 passed (983ms)
```
所有测试用例通过，平均响应时间约49ms/测试。

## 🔧 配置

### playwright.config.js

- **超时时间**: 30秒
- **重试次数**: 1次
- **并发数**: 1个worker
- **报告器**: HTML, List, JSON
- **基础URL**: http://localhost:3001

### 测试环境

- **开发环境**: http://localhost:3001
- **数据库**: sql.js (SQLite)
- **测试用户**: 3个种子用户
- **测试游戏**: 6个种子游戏 + 测试创建的游戏

## 📌 注意事项

1. **服务器必须运行**: 运行测试前确保后端服务器在端口3001运行
   ```bash
   npm start
   ```

2. **数据库准备**: 确保测试数据已初始化
   ```bash
   npm run db:init
   npm run db:seed
   ```

3. **环境变量**: 确保 `.env` 文件配置正确
   ```env
   JWT_SECRET=kidsgame-secret-key-development-only
   ```

## 🎯 未来计划

- [x] 添加游戏CRUD E2E测试
- [ ] 添加点赞系统 E2E测试
- [ ] 添加AI生成 E2E测试
- [ ] 添加前端页面 E2E测试
- [ ] 集成到CI/CD流程

## 📚 参考资料

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright API 测试](https://playwright.dev/docs/api-testing)
- [项目开发计划](../../docs/项目开发计划.md)
