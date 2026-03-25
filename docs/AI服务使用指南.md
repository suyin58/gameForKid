# AI游戏生成服务 - 使用指南

## 📋 概述

AI游戏生成服务已集成到后端，支持通过OpenAI API自动生成和修改儿童游戏。

## 🔧 配置步骤

### 1. 配置OpenAI API密钥

在 `server/.env` 文件中添加：

```bash
# OpenAI配置
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选，默认OpenAI官方API
OPENAI_MODEL=gpt-4o-mini  # 或 gpt-4, gpt-3.5-turbo等
```

**支持的API提供商：**
- OpenAI官方：`https://api.openai.com/v1`
- Azure OpenAI：配置你的Azure端点
- 国内代理：配置兼容OpenAI的代理地址

### 2. 测试AI服务

```bash
cd server
npm run test:ai
```

如果配置正确，你应该看到：
```
🧪 开始测试AI服务...
测试1: 初始化AI服务
✅ AI服务初始化成功
...
🎉 所有测试完成！
```

## 🎮 API接口

### 1. 生成游戏

**端点：** `POST /api/v1/ai/generate`

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "description": "我想做一个跳跳游戏，小兔子要躲避障碍物",
  "type": "casual"  // 可选：casual/education/puzzle/sports/adventure
}
```

**响应：** Server-Sent Events (SSE) 流式响应

```javascript
// 状态消息
{ type: 'status', message: '📋 正在分析描述...' }
{ type: 'status', message: '🎨 设计游戏角色...' }
{ type: 'status', message: '🎮 生成游戏逻辑...' }

// 完成消息
{
  type: 'complete',
  data: {
    title: '跳跃小游戏',
    description: '我想做一个跳跳游戏...',
    code: '<!DOCTYPE html>...',
    type: 'casual'
  }
}

// 错误消息
{ type: 'error', code: 5001, message: 'AI生成失败，请重试' }
```

### 2. 修改游戏

**端点：** `POST /api/v1/ai/modify`

**请求体：**
```json
{
  "gameId": 1,
  "modifyDescription": "把游戏难度调高一点，添加计时功能"
}
```

**响应：** 同样是SSE流式响应

## 📝 配额系统

AI生成和修改会扣除用户配额：
- **生成配额**：每次生成扣除1个配额
- **修改配额**：每次修改扣除1个配额

配额在用户注册时自动初始化（默认5个生成配额，10个修改配额）。

## 🎯 游戏类型

| 类型 | 说明 | 示例 |
|-----|------|------|
| `casual` | 休闲游戏 | 点击类、收集类游戏 |
| `education` | 教育游戏 | 数学、语言学习游戏 |
| `puzzle` | 益智游戏 | 记忆、逻辑推理游戏 |
| `sports` | 运动游戏 | 反应、协调训练游戏 |
| `adventure` | 冒险游戏 | 探索、闯关游戏 |

## 🛡️ 安全特性

1. **内容过滤**：自动过滤不当内容
2. **代码注入检测**：检测潜在的安全风险
3. **代码长度限制**：最大500KB
4. **配额限制**：防止滥用

## 📊 监控和日志

AI服务操作会记录详细日志：
```
🎮 用户 1 请求生成游戏: 跳跳游戏
✅ 游戏生成成功
✅ 已扣除用户 1 的生成配额
```

## 🔍 故障排除

### 问题1：AI服务不可用

**错误消息：** `AI服务暂时不可用，请稍后重试`

**解决方案：**
1. 检查 `OPENAI_API_KEY` 是否配置
2. 检查API密钥是否有效
3. 检查网络连接
4. 查看服务器日志

### 问题2：生成超时

**错误消息：** `AI生成失败，请重试`

**解决方案：**
1. OpenAI API响应时间过长
2. 网络不稳定
3. 重新尝试

### 问题3：配额不足

**错误消息：** `生成配额不足`

**解决方案：**
- 用户需要等待配额恢复（每天自动恢复）
- 或管理员手动增加配额

## 📚 开发模式

在开发环境中，如果未配置API密钥，服务器仍会启动，但AI功能会返回友好错误。

**开发环境提示：**
```
⚠️  AI服务未配置，生成功能将不可用
   请设置环境变量 OPENAI_API_KEY 以启用AI功能
```

## 🎨 Prompt模板

Prompt模板位于 `src/prompts/game-prompts.js`，包含：
- 系统提示词（角色定义、核心原则）
- 游戏类型特定提示词
- 生成和修改模板

可以自定义这些模板来调整生成质量。

## 🚀 下一步

1. **配置API密钥**：在`.env`文件中添加你的OpenAI API密钥
2. **测试服务**：运行`npm run test:ai`
3. **集成前端**：在小程序中调用生成接口
4. **优化Prompt**：根据实际生成效果调整Prompt模板
