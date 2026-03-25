# 前后端联调 E2E 测试指南

## 🎯 测试目标

测试前端与后端API的集成，验证以下功能：
1. 游戏广场数据展示
2. 游戏详情查看
3. 搜索和排序功能
4. 点赞功能
5. 播放次数记录
6. 游戏克隆功能
7. API响应格式验证

---

## 📋 前提条件

### ✅ 已完成
- 后端 API 路径已修复
- 前端 API 调用已修复
- 测试数据已准备
- Playwright 已安装

### 🔧 需要手动执行

#### 1. 启动后端服务器

```bash
cd D:/claude/gameForKid/server
npm start
```

**验证：** 访问 http://localhost:3001/health 应该返回 `{"status":"ok"}`

#### 2. 启动前端开发服务器

```bash
cd D:/claude/gameForKid
npm run dev:h5
```

**验证：** 浏览器自动打开，访问 http://localhost:5173

---

## 🚀 运行测试

### 方法1：运行所有测试

```bash
cd D:/claude/gameForKid/tests
npx playwright test
```

### 方法2：运行特定测试

```bash
cd D:/claude/gameForKid/tests
npx playwright test -g "游戏广场"
npx playwright test -g "点赞功能"
npx playwright test -g "数据一致性"
```

### 方法3：查看测试报告

测试完成后，在浏览器中打开：
```
tests/playwright-report/index.html
```

---

## 📊 测试用例说明

### 游戏广场功能 (1-4)
1. **游戏广场加载** - 验证页面能正常访问
2. **游戏详情查看** - 验证API返回完整游戏数据
3. **游戏搜索** - 验证关键词搜索功能
4. **游戏排序** - 验证按点赞数排序功能

### 游戏互动功能 (5-8)
5. **游戏详情获取** - 验证获取完整游戏信息
6. **点赞功能** - 验证点赞操作和状态更新
7. **播放次数** - 验证播放计数器正确递增
8. **游戏克隆** - 验证克隆功能和"我的作品"更新

### 数据一致性 (9)
9. **数据一致性验证** - 验证API响应数据完整性

### API格式验证 (10)
10. **API响应格式** - 验证统一响应结构

---

## 🔍 测试 Token

测试使用以下Token（已自动注入）：

**User1 (ID: 1001):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMDEsIm9wZW5pZCI6InRlc3RfdXNlcl8xIiwiaWF0IjoxNzc0Mzk2Mjg1LCJleHAiOjE3NzY5ODI4ODl9.x-bkLQ7Yj99HcenwBecDOesKfVwvTQ-9rTtxYCSIXEM
```

**User2 (ID: 1002):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMDIsIm9wZW5pZCI6InRlc3RfdXNlcl8yIiwiaWF0IjoxNzc0Mzk2Mjg1LCJleHAiOjE3NzY5ODI4ODl9.1DhOvkZE_2R5BOhh9F0bwNtlZ3ZRrVpcmU9q762Zes
```

---

## 📝 测试数据

### 测试游戏
1. **打地鼠游戏** (ID: 1) - casual 类型
2. **数学益智游戏** (ID: 2) - education 类型
3. **拼图挑战** (ID: 3) - puzzle 类型

### 测试用户
- **User 1** (ID: 1001) - 创建了3个游戏
- **User 2** (ID: 1002) - 用于测试点赞和克隆

---

## ❌ 常见问题

### 1. 后端服务器未启动

**错误：** `fetch failed` 或 `ECONNREFUSED`

**解决：**
```bash
cd D:/claude/gameForKid/server
npm start
```

### 2. 测试数据未准备

**错误：** `找不到测试数据`

**解决：**
```bash
cd D:/claude/gameForKid/server
node prepare-test-data.js
```

### 3. 前端服务器未启动

**错误：** 无法访问前端页面

**解决：**
```bash
cd D:/claude/gameForKid
npm run dev:h5
```

### 4. Token 过期

**错误：** API 返回 401 Unauthorized

**解决：** 重新运行 `node prepare-test-data.js` 生成新Token

---

## 📈 预期测试结果

所有测试应该通过（✅），控制台输出类似：

```
✅ 成功获取 3 个游戏
✅ 搜索成功，找到 3 个游戏
✅ 排序功能正常，点赞数降序排列
✅ 游戏详情获取成功: 打地鼠游戏
✅ 点赞功能正常，状态已更新
✅ 播放次数记录正常
✅ 游戏克隆成功: 打地鼠游戏 (副本)
✅ 克隆的游戏已出现在"我的作品"中
✅ 所有游戏数据结构完整
✅ 排序逻辑正确
✅ /api/v1/game/public - 响应格式正确
```

---

## 🎉 测试完成后的清理

测试完成后，可以查看：
- **测试报告**: `tests/playwright-report/index.html`
- **测试截图**: `tests/test-results/` 目录

---

**测试人员**: ___________
**测试日期**: ___________
**测试结果**: ___________
