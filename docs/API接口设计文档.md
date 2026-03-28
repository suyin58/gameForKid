# 前后端接口设计文档

## 节点 1：设计基础架构和通用规范

**Prompt**：
设计 API 的基础架构，包括：
- 基础 URL（开发/生产环境）
- 请求/响应格式规范
- 认证方式（JWT）
- 错误码规范
- 通用响应结构

## 节点 2：设计用户系统接口

**Prompt**：
设计用户相关的接口：
- POST /api/v1/user/login - 微信登录（code 换取 token）
- GET /api/v1/user/info - 获取当前用户信息
- PUT /api/v1/user/info - 更新用户信息（昵称、头像）
- GET /api/v1/user/quota - 获取用户配额（每日生成/修改次数）

## 节点 3：设计游戏管理接口

**Prompt**：
设计游戏 CRUD 接口：
- POST /api/v1/games - 创建游戏
- GET /api/v1/games - 获取我的游戏列表（分页）
- GET /api/v1/games/:id - 获取游戏详情
- PUT /api/v1/games/:id - 更新游戏
- DELETE /api/v1/games/:id - 删除游戏

## 节点 4：设计游戏广场接口

**Prompt**：
设计游戏广场相关接口：
- GET /api/v1/games/public - 获取公开游戏列表
- 查询参数：page, limit, sort（最新/最热）, type（游戏类型）
- GET /api/v1/games/search - 搜索游戏
- POST /api/v1/games/:id/publish - 发布/设为私密
- POST /api/v1/games/:id/clone - 克隆游戏到我的作品

## 节点 5：设计 AI 生成接口

**Prompt**：
设计 AI 游戏生成接口（SSE 流式响应）：
- POST /api/v1/ai/generate - 生成新游戏
- 请求体：{ description, type }
- 响应：text/event-stream 流式返回生成过程
- POST /api/v1/ai/modify - 修改已有游戏
- 请求体：{ gameId, modifyDescription }

## 节点 6：设计互动功能接口

**Prompt**：
设计用户互动接口：
- POST /api/v1/like - 点赞游戏
- 请求体：{ gameId }
- DELETE /api/v1/like/:gameId - 取消点赞
- GET /api/v1/like/:gameId - 检查点赞状态
- POST /api/v1/games/:id/play - 记录游玩次数

## 节点 7：设计健康检查接口

**Prompt**：
设计系统状态接口：
- GET /health - 健康检查
- GET /api/v1/status - 服务状态（数据库、AI 服务等）

## 节点 8：设计数据模型规范

**Prompt**：
定义所有数据模型：
- User 模型（用户信息、配额）
- Game 模型（游戏信息、代码、缩略图）
- Like 模型（点赞记录）
- UserDailyQuota 模型（每日配额）

## 节点 9：设计错误处理规范

**Prompt**：
设计统一的错误处理：
- 错误码定义（400, 401, 403, 404, 500 等）
- 错误响应格式
- 业务错误码（配额不足、内容违规等）

## 节点 10：验证接口设计的完整性

**Prompt**：
验证接口设计是否覆盖所有 demo.html 的交互场景：
- 用户操作是否都有对应的 API
- 数据流向是否清晰
- 是否有遗漏的功能点
