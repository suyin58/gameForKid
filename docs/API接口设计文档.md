# API 接口设计文档

## 一、基础规范

### 1.1 基础信息
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **API 版本**: v1

### 1.2 基础 URL
```
开发环境: http://localhost:3001/api/v1
生产环境: https://api.kidsgame.com/api/v1
```

### 1.3 认证方式
使用 JWT Token 认证：
```
Authorization: Bearer <token>
```

### 1.4 统一响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

## 二、用户系统接口

### 2.1 微信登录
```
POST /user/login
```
**请求体**:
```json
{
  "code": "微信登录code"
}
```
**响应**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "JWT token",
    "user": {
      "id": "用户ID",
      "openid": "微信openid",
      "nickname": "昵称",
      "avatar": "头像URL"
    }
  }
}
```

### 2.2 获取用户信息
```
GET /user/info
```
**响应**:
```json
{
  "code": 0,
  "data": {
    "id": "用户ID",
    "nickname": "昵称",
    "avatar": "头像URL",
    "gameCount": 10,
    "likeCount": 50
  }
}
```

### 2.3 更新用户信息
```
PUT /user/info
```
**请求体**:
```json
{
  "nickname": "新昵称",
  "avatar": "新头像URL"
}
```

### 2.4 获取配额信息
```
GET /user/quota
```
**响应**:
```json
{
  "code": 0,
  "data": {
    "generateCount": 5,
    "generateLimit": 10,
    "modifyCount": 8,
    "modifyLimit": 20,
    "resetAt": "2026-03-29T00:00:00Z"
  }
}
```

## 三、游戏管理接口

### 3.1 创建游戏
```
POST /games
```
**请求体**:
```json
{
  "title": "游戏标题",
  "description": "游戏描述",
  "code": "HTML游戏代码",
  "type": "casual",
  "thumbnail": "缩略图URL"
}
```
**响应**:
```json
{
  "code": 0,
  "data": {
    "id": "游戏ID",
    "title": "游戏标题",
    "createdAt": "2026-03-28T00:00:00Z"
  }
}
```

### 3.2 获取我的游戏列表
```
GET /games?page=1&limit=10
```
**响应**:
```json
{
  "code": 0,
  "data": {
    "total": 25,
    "games": [
      {
        "id": "游戏ID",
        "title": "游戏标题",
        "description": "游戏描述",
        "thumbnail": "缩略图URL",
        "type": "casual",
        "visibility": "private",
        "likeCount": 15,
        "playCount": 67,
        "createdAt": "2026-03-28T00:00:00Z"
      }
    ]
  }
}
```

### 3.3 获取游戏详情
```
GET /games/:id
```
**响应**:
```json
{
  "code": 0,
  "data": {
    "id": "游戏ID",
    "title": "游戏标题",
    "description": "游戏描述",
    "code": "HTML游戏代码",
    "type": "casual",
    "thumbnail": "缩略图URL",
    "visibility": "public",
    "likeCount": 15,
    "playCount": 67,
    "isLiked": true,
    "user": {
      "id": "用户ID",
      "nickname": "作者昵称",
      "avatar": "作者头像"
    },
    "createdAt": "2026-03-28T00:00:00Z"
  }
}
```

### 3.4 更新游戏
```
PUT /games/:id
```
**请求体**:
```json
{
  "title": "新标题",
  "description": "新描述",
  "code": "新代码"
}
```

### 3.5 删除游戏
```
DELETE /games/:id
```

### 3.6 发布游戏
```
POST /games/:id/publish
```
**请求体**:
```json
{
  "visibility": "public"
}
```

### 3.7 克隆游戏
```
POST /games/:id/clone
```
**响应**:
```json
{
  "code": 0,
  "data": {
    "id": "新游戏ID",
    "title": "原标题的副本"
  }
}
```

## 四、游戏广场接口

### 4.1 获取公开游戏列表
```
GET /games/public?page=1&limit=10&sort=newest&type=casual
```
**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `sort`: 排序方式（newest/latest/hottest）
- `type`: 游戏类型（casual/sports/education等）

**响应**:
```json
{
  "code": 0,
  "data": {
    "total": 100,
    "games": [
      {
        "id": "游戏ID",
        "title": "游戏标题",
        "description": "游戏描述",
        "thumbnail": "缩略图URL",
        "type": "casual",
        "likeCount": 15,
        "playCount": 67,
        "user": {
          "id": "用户ID",
          "nickname": "作者昵称"
        },
        "createdAt": "2026-03-28T00:00:00Z"
      }
    ]
  }
}
```

### 4.2 搜索游戏
```
GET /games/search?q=跳跃&page=1&limit=10
```
**查询参数**:
- `q`: 搜索关键词

## 五、AI 生成接口

### 5.1 生成游戏（SSE）
```
POST /ai/generate
```
**请求体**:
```json
{
  "description": "我想做一个跳跃游戏",
  "type": "casual"
}
```
**响应**: `text/event-stream` 流式返回
```
event: message
data: {"type": "command", "text": "> ai create"}

event: message
data: {"type": "info", "text": "正在初始化..."}

event: message
data: {"type": "success", "text": "✅ 游戏生成成功"}

event: done
data: {"code": "生成的游戏HTML代码"}
```

### 5.2 修改游戏（SSE）
```
POST /ai/modify
```
**请求体**:
```json
{
  "gameId": "游戏ID",
  "modifyDescription": "把背景改成蓝色"
}
```
**响应**: 同 5.1，流式返回

## 六、互动功能接口

### 6.1 点赞游戏
```
POST /like
```
**请求体**:
```json
{
  "gameId": "游戏ID"
}
```

### 6.2 取消点赞
```
DELETE /like/:gameId
```

### 6.3 检查点赞状态
```
GET /like/:gameId
```
**响应**:
```json
{
  "code": 0,
  "data": {
    "isLiked": true,
    "likeCount": 15
  }
}
```

### 6.4 记录游玩
```
POST /games/:id/play
```

## 七、系统接口

### 7.1 健康检查
```
GET /health
```
**响应**:
```json
{
  "status": "ok",
  "timestamp": "2026-03-28T00:00:00Z"
}
```

### 7.2 服务状态
```
GET /status
```
**响应**:
```json
{
  "database": "connected",
  "ai_service": "available",
  "redis": "connected"
}
```

## 八、错误码规范

| 错误码 | 说明 |
|-------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 429 | 配额不足 |
| 500 | 服务器错误 |
| 1001 | 内容违规 |
| 1002 | 游戏代码无效 |
