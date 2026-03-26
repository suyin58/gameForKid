# 前后端接口交互规范文档

## 📋 文档信息

| 项目名称 | 儿童AI游戏创作平台 |
|---------|------------------|
| 文档版本 | v1.0 |
| 创建日期 | 2026-03-23 |
| 适用范围 | 前端（uni-app）与后端（Node.js）API交互 |

---

## 一、通用规范

### 1.1 基础协议

| 项目 | 说明 |
|-----|------|
| **协议** | HTTP / HTTPS |
| **数据格式** | JSON |
| **字符编码** | UTF-8 |
| **时间格式** | ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) |
| **时区** | UTC (协调世界时) |

### 1.2 基础URL

```
开发环境: http://localhost:3001/api
生产环境: https://api.kidsgame.com/api
```

### 1.3 API版本控制

当前版本：`v1`

版本通过请求头或URL路径控制（推荐URL路径）：
```
/api/v1/user/login
```

---

## 二、请求规范

### 2.1 请求头（Request Headers）

#### 必须包含的请求头

```http
Content-Type: application/json
Accept: application/json
```

#### 认证请求头（需要登录的接口）

```http
Authorization: Bearer <token>
```

**示例：**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 微信小程序特殊请求头

```http
X-WX-Openid: <用户openid>
X-WX-Unionid: <用户unionid>  // 可选
```

---

### 2.2 认证方式

#### JWT Token 认证

**Token获取流程：**
1. 用户微信登录成功
2. 后端签发 JWT Token
3. 前端存储 Token
4. 后续请求在 Header 中携带 Token

**Token格式：**
```javascript
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": "用户ID",
    "openid": "微信openid",
    "exp": 1719876543  // 过期时间戳
  }
}
```

**Token有效期：**
- 开发环境：30天
- 生产环境：7天

**Token刷新：**
- Token过期后需重新登录
- 暂不支持刷新Token机制

---

### 2.3 请求参数格式

#### URL 参数

**示例：** `/api/games/public?page=1&limit=20&type=casual`

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| page | Integer | 否 | 页码，从1开始 |
| limit | Integer | 否 | 每页数量，默认20，最大50 |
| type | String | 否 | 筛选条件 |

#### Request Body 参数

**Content-Type:** `application/json`

**示例：**
```json
{
  "title": "跳跃小游戏",
  "description": "一只可爱的小兔子...",
  "type": "casual"
}
```

---

### 2.4 分页规范

#### 请求参数

```json
{
  "page": 1,
  "limit": 20
}
```

#### 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**分页参数说明：**
- `page`: 当前页码（从1开始）
- `limit`: 每页数量（默认20，最大50）
- `total`: 总记录数
- `totalPages`: 总页数
- `hasNext`: 是否有下一页
- `hasPrev`: 是否有上一页

---

### 2.5 排序规范

#### 请求参数

```json
{
  "sortBy": "createdAt",
  "order": "desc"
}
```

**支持的字段：**
- `createdAt`: 创建时间
- `likeCount`: 点赞数
- `playCount`: 游玩次数
- `updatedAt`: 更新时间

**排序方向：**
- `asc`: 升序
- `desc`: 降序（默认）

---

## 三、响应规范

### 3.1 统一响应格式

#### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    // 业务数据
  },
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

**字段说明：**
- `code`: 业务状态码（0表示成功）
- `message`: 响应消息
- `data`: 业务数据
- `timestamp`: 服务器时间戳

#### 错误响应

```json
{
  "code": 400,
  "message": "参数验证失败",
  "data": null,
  "errors": [
    {
      "field": "title",
      "message": "游戏标题不能为空"
    }
  ],
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

---

### 3.2 HTTP状态码

| 状态码 | 说明 | 使用场景 |
|-------|------|---------|
| **200** | OK | 请求成功 |
| **201** | Created | 资源创建成功 |
| **400** | Bad Request | 请求参数错误 |
| **401** | Unauthorized | 未登录或Token过期 |
| **403** | Forbidden | 无权限访问 |
| **404** | Not Found | 资源不存在 |
| **409** | Conflict | 资源冲突（如重复创建） |
| **422** | Unprocessable Entity | 参数格式正确但语义错误 |
| **429** | Too Many Requests | 请求过于频繁 |
| **500** | Internal Server Error | 服务器内部错误 |
| **503** | Service Unavailable | 服务维护中 |

---

### 3.3 业务错误码

| 错误码 | 说明 | HTTP状态码 |
|-------|------|-------------|
| **0** | 成功 | 200 |
| **1001** | 参数错误 | 400 |
| **1002** | 参数缺失 | 400 |
| **1003** | 参数格式错误 | 400 |
| **1004** | 数据验证失败 | 422 |
| **2001** | 未登录 | 401 |
| **2002** | Token过期 | 401 |
| **2003** | Token无效 | 401 |
| **3001** | 用户不存在 | 404 |
| **3002** | 用户已存在 | 409 |
| **3003** | 密码错误 | 401 |
| **4001** | 游戏不存在 | 404 |
| **4002** | 游戏无权限 | 403 |
| **4003** | 游戏已删除 | 404 |
| **5001** | AI生成失败 | 500 |
| **5002** | AI服务超时 | 504 |
| **5003** | 内容审核失败 | 422 |
| **5004** | AI配额不足 | 429 |
| **5005** | Stream连接中断 | 500 |
| **5006** | 描述内容不合规 | 422 |
| **9999** | 服务器内部错误 | 500 |

---

### 3.4 特殊响应场景

#### 204 No Content

**使用场景：** 删除操作成功，无返回数据

**响应：**
```http
HTTP/1.1 204 No Content
```

#### 429 Too Many Requests

**使用场景：** 接口限流

**响应：**
```json
{
  "code": 429,
  "message": "请求过于频繁，请稍后再试",
  "data": {
    "retryAfter": 60  // 秒
  },
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

---

## 四、接口详细说明

### 4.1 用户相关接口

#### 4.1.1 微信登录

**接口：** `POST /api/v1/user/login`

**说明：** 微信小程序登录，需要先调用 wx.login() 获取 code

**无需认证**

**请求参数：**
```json
{
  "code": "微信登录code",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像URL"
  }
}
```

**参数说明：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| code | String | 是 | wx.login() 获取的code |
| userInfo | Object | 否 | 用户信息（可选） |
| userInfo.nickName | String | 否 | 微信昵称 |
| userInfo.avatarUrl | String | 否 | 微信头像 |

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "JWT_TOKEN_STRING",
    "user": {
      "id": "1",
      "openid": "oXXXX...",
      "nickname": "小明",
      "avatar": "https://...",
      "bio": "",
      "gameCount": 0,
      "likeCount": 0,
      "createdAt": "2026-03-23T07:33:18.280Z",
      "isNewUser": true  // 是否新用户
    }
  },
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

**错误响应：**
```json
{
  "code": 2001,
  "message": "code无效或已过期",
  "data": null,
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

---

#### 4.1.2 获取用户信息

**接口：** `GET /api/v1/user/info`

**说明：** 获取当前登录用户的信息

**需要认证：** ✅ 是

**请求头：**
```http
Authorization: Bearer <token>
```

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "1",
    "openid": "oXXXX...",
    "nickname": "小明",
    "avatar": "https://api.dicebear.com/.../svg?seed=Felix",
    "bio": "喜欢创作小游戏",
    "gameCount": 3,
    "likeCount": 15,
    "createdAt": "2026-03-20T10:30:00.000Z",
    "lastLoginAt": "2026-03-23T07:33:18.280Z"
  },
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

**错误响应（401）：**
```json
{
  "code": 2001,
  "message": "未登录",
  "data": null,
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

---

#### 4.1.3 更新用户信息

**接口：** `PUT /api/v1/user/info`

**说明：** 更新当前用户的信息

**需要认证：** ✅ 是

**请求头：**
```http
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "nickname": "新昵称",
  "avatar": "新头像URL",
  "bio": "个人简介"
}
```

**参数说明：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| nickname | String | 否 | 昵称（1-50字符） |
| avatar | String | 否 | 头像URL |
| bio | String | 否 | 个人简介（最多200字符） |

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": "1",
    "nickname": "新昵称",
    "avatar": "新头像URL",
    "bio": "个人简介",
    "updatedAt": "2026-03-23T07:33:18.280Z"
  },
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

---

### 4.2 游戏相关接口

#### 4.2.1 获取我的游戏列表

**接口：** `GET /api/v1/games`

**说明：** 获取当前用户创建的游戏列表

**需要认证：** ✅ 是

**请求头：**
```http
Authorization: Bearer <token>
```

**请求参数：**
```http
/api/v1/games?page=1&limit=20&visibility=all
```

**参数说明：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| limit | Integer | 否 | 每页数量，默认20 |
| visibility | String | 否 | 过滤条件：all/private/public，默认all |

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "1",
        "title": "跳跃吃胡萝卜",
        "description": "一只可爱的小兔子...",
        "type": "casual",
        "thumbnail": "https://...",
        "visibility": "private",
        "likeCount": 12,
        "playCount": 45,
        "createdAt": "2026-03-20T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

---

#### 4.2.2 创建游戏

**接口：** `POST /api/v1/games`

**说明：** 创建新游戏（保存草稿或AI生成后保存）

**需要认证：** ✅ 是

**请求头：**
```http
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "title": "跳跃小游戏",
  "description": "一只可爱的小兔子，要躲避障碍物吃到胡萝卜",
  "code": "<!DOCTYPE html>...</html>",
  "type": "casual"
}
```

**参数说明：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| title | String | 是 | 游戏标题（1-50字符） |
| description | String | 否 | 游戏描述（最多500字符） |
| code | String | 是 | HTML游戏代码 |
| type | String | 否 | 游戏类型，默认casual |

**type枚举值：**
```javascript
'casual'     // 休闲
'sports'      // 运动
'education'  // 教育
'creative'    // 创意
'fighting'    // 格斗
'war'         // 战争
'adventure'   // 冒险
```

**成功响应（201）：**
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": "4",
    "userId": "1",
    "title": "跳跃小游戏",
    "description": "...",
    "code": "<!DOCTYPE html>...",
    "type": "casual",
    "visibility": "private",
    "likeCount": 0,
    "playCount": 0,
    "createdAt": "2026-03-23T07:33:18.280Z"
  },
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

**错误响应（400）：**
```json
{
  "code": 1001,
  "message": "参数验证失败",
  "errors": [
    {
      "field": "title",
      "message": "游戏标题不能为空"
    },
    {
      "field": "code",
      "message": "游戏代码不能为空"
    }
  ],
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

---

#### 4.2.3 获取游戏详情

**接口：** `GET /api/v1/games/:id`

**说明：** 获取指定游戏的详细信息

**需要认证：** ✅ 是

**请求参数：**
- `id`: 游戏ID（路径参数）

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "1",
    "title": "跳跃吃胡萝卜",
    "description": "一只可爱的小兔子...",
    "code": "<!DOCTYPE html>...",
    "type": "casual",
    "thumbnail": "https://...",
    "visibility": "public",
    "isCloned": false,
    "likeCount": 12,
    "playCount": 45,
    "createdAt": "2026-03-20T10:30:00.000Z",
    "updatedAt": "2026-03-23T07:33:18.280Z",
    "user": {
      "id": "1",
      "nickname": "小明",
      "avatar": "https://..."
    }
  },
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

**错误响应（404）：**
```json
{
  "code": 4001,
  "message": "游戏不存在",
  "data": null,
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

---

#### 4.2.4 更新游戏

**接口：** `PUT /api/v1/games/:id`

**说明：** 更新游戏信息

**需要认证：** ✅ 是

**请求参数：**
```json
{
  "title": "新标题",
  "description": "新描述"
}
```

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": "1",
    "title": "新标题",
    "updatedAt": "2026-03-23T07:33:18.280Z"
  }
}
```

---

#### 4.2.5 删除游戏

**接口：** `DELETE /api/v1/games/:id`

**说明：** 删除游戏

**需要认证：** ✅ 是

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

---

#### 4.2.6 发布到广场

**接口：** `POST /api/v1/games/:id/publish`

**说明：** 将私有游戏发布到游戏广场

**需要认证：** ✅ 是

**请求参数：**
```json
{
  "title": "游戏名称",
  "description": "游戏简介",
  "type": "casual"
}
```

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "发布成功",
  "data": {
    "id": "1",
    "visibility": "public",
    "publishedAt": "2026-03-23T07:33:18.280Z"
  }
}
```

---

#### 4.2.7 获取广场游戏列表

**接口：** `GET /api/v1/games/public`

**说明：** 获取游戏广场的公开游戏列表

**无需认证**

**请求参数：**
```http
/api/v1/games/public?page=1&limit=20&type=casual&sort=likeCount
```

**参数说明：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| page | Integer | 否 | 页码，默认1 |
| limit | Integer | 否 | 每页数量，默认20 |
| type | String | 否 | 游戏类型筛选 |
| sort | String | 否 | 排序：createdAt/likeCount/playCount，默认createdAt |

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "1",
        "title": "跳跃吃胡萝卜",
        "type": "casual",
        "thumbnail": "https://...",
        "likeCount": 12,
        "playCount": 45,
        "createdAt": "2026-03-20T10:30:00.000Z",
        "user": {
          "id": "1",
          "nickname": "小明",
          "avatar": "https://..."
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

#### 4.2.8 克隆游戏

**接口：** `POST /api/v1/games/:id/clone`

**说明：** 克隆广场游戏到我的作品

**需要认证：** ✅ 是

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "克隆成功",
  "data": {
    "id": "5",
    "title": "跳跃吃胡萝卜的副本",
    "isCloned": true,
    "clonedFrom": "1",
    "createdAt": "2026-03-23T07:33:18.280Z"
  }
}
```

---

### 4.3 配额相关接口

#### 4.3.1 获取配额信息

**接口：** `GET /api/v1/quota`

**说明：** 获取当前用户的AI配额使用情况

**需要认证：** ✅ 是

**请求头：**
```http
Authorization: Bearer <token>
```

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "generate": {
      "used": 5,
      "remaining": 5,
      "limit": 10
    },
    "modify": {
      "used": 10,
      "remaining": 10,
      "limit": 20
    },
    "resetAt": "2026-03-24T00:00:00.000Z",
    "quotaType": "free"
  },
  "timestamp": "2026-03-23T07:33:18.280Z"
}
```

**字段说明：**
| 字段 | 说明 |
|-----|------|
| generate.used | 今日已使用生成次数 |
| generate.remaining | 生成剩余次数 |
| generate.limit | 生成配额上限 |
| modify.used | 今日已使用修改次数 |
| modify.remaining | 修改剩余次数 |
| modify.limit | 修改配额上限 |
| resetAt | 配额重置时间（次日凌晨0点） |
| quotaType | 用户类型（free/vip） |

**配额限制规则：**

| 用户类型 | 生成配额 | 修改配额 |
|---------|---------|---------|
| 免费用户 (free) | 10次/天 | 20次/天 |
| VIP用户 (vip) | 50次/天 | 100次/天 |

---

### 4.4 AI生成相关接口

#### 4.4.1 健康检查

**接口：** `GET /health`

**说明：** 检查后端服务状态

**无需认证**

**成功响应（200）：**
```json
{
  "status": "ok",
  "timestamp": "2026-03-23T07:33:18.280Z",
  "version": "1.0.0"
}
```

---

#### 4.4.2 AI生成游戏（Stream模式）

**接口：** `POST /api/v1/ai/generate`

**说明：** 根据用户描述生成游戏代码，使用Server-Sent Events (SSE)实时推送生成进度

**需要认证：** ✅ 是

**注意：** 此接口会扣除用户的生成配额

**请求头：**
```http
Authorization: Bearer <token>
Accept: text/event-stream
```

**请求参数：**
```json
{
  "description": "我想做一个跳跃游戏，主角是一只小兔子，要躲避障碍物吃到胡萝卜"
}
```

**参数说明：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| description | String | 是 | 游戏描述（10-500字符） |
| mode | String | 否 | 生成模式：create（新建）/modify（修改），默认create |
| gameId | String | 否 | mode=modify时必填，要修改的游戏ID |

**Stream响应格式（text/event-stream）：**

```
data: {"type":"status","message":"正在分析描述..."}

data: {"type":"step","step":1,"message":"识别游戏类型: 动作游戏"}

data: {"type":"step","step":2,"message":"生成游戏引擎..."}

data: {"type":"progress","progress":50,"message":"正在生成游戏逻辑..."}

data: {"type":"complete","data":{"gameId":"6","title":"跳跃吃胡萝卜","code":"<!DOCTYPE html>...","type":"casual"}}
```

**事件类型说明：**

| 类型 | 说明 | 示例 |
|-----|------|------|
| status | 状态更新 | `{"type":"status","message":"正在生成..."}` |
| step | 步骤进度 | `{"type":"step","step":1,"message":"初始化项目..."}` |
| progress | 百分比进度 | `{"type":"progress","progress":50,"message":"生成中..."}` |
| complete | 生成完成 | `{"type":"complete","data":{...游戏数据...}}` |
| error | 生成失败 | `{"type":"error","message":"AI生成失败"}` |

**成功响应（最后一条消息）：**
```json
{
  "type": "complete",
  "data": {
    "gameId": "6",
    "title": "跳跃吃胡萝卜",
    "description": "一只可爱的小兔子...",
    "code": "<!DOCTYPE html>...",
    "type": "casual",
    "thumbnail": "data:image/svg+xml;base64,...",
    "createdAt": "2026-03-23T07:33:18.280Z"
  }
}
```

**错误响应：**
```json
{
  "type": "error",
  "code": 5001,
  "message": "AI生成失败，请重新描述"
}
```

**前端调用示例：**

```javascript
async function generateGame(description) {
  const response = await fetch('/api/v1/ai/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify({ description })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        handleStreamMessage(data);
      }
    }
  }
}

function handleStreamMessage(data) {
  switch (data.type) {
    case 'status':
      updateStatus(data.message);
      break;
    case 'step':
      addStepLog(data.message);
      break;
    case 'progress':
      updateProgress(data.progress);
      break;
    case 'complete':
      showGameResult(data.data);
      break;
    case 'error':
      showError(data.message);
      break;
  }
}
```

---

#### 4.4.3 修改游戏（Stream模式）

**接口：** `POST /api/v1/ai/modify`

**说明：** 基于现有游戏修改生成新版本，使用SSE实时推送进度

**需要认证：** ✅ 是

**注意：** 此接口会扣除用户的修改配额

**请求头：**
```http
Authorization: Bearer <token>
Accept: text/event-stream
```

**请求参数：**
```json
{
  "gameId": "6",
  "modifyDescription": "把兔子换成恐龙，胡萝卜换成肉，增加双倍积分"
}
```

**参数说明：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| gameId | String | 是 | 要修改的游戏ID |
| modifyDescription | String | 是 | 修改描述（10-500字符） |

**Stream响应格式：**

```
data: {"type":"status","message":"正在加载游戏配置..."}

data: {"type":"step","step":1,"message":"分析修改需求..."}

data: {"type":"step","step":2,"message":"更新游戏逻辑..."}

data: {"type":"complete","data":{"gameId":"6","title":"跳跃吃肉","code":"<!DOCTYPE html>..."}}
```

**成功响应（最后一条消息）：**
```json
{
  "type": "complete",
  "data": {
    "gameId": "6",
    "title": "跳跃吃肉",
    "description": "一只恐龙...",
    "code": "<!DOCTYPE html>...",
    "type": "casual",
    "updatedAt": "2026-03-23T07:33:18.280Z"
  }
}
```

**错误响应：**
```json
{
  "type": "error",
  "code": 4001,
  "message": "游戏不存在或无权限修改"
}
```

---

### 4.5 互动相关接口

#### 4.5.1 点赞/取消点赞

**接口：** `POST /api/v1/like`

**说明：** 点赞或取消点赞游戏

**需要认证：** ✅ 是

**请求参数：**
```json
{
  "gameId": "1",
  "action": "toggle"
}
```

**参数说明：**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| gameId | Integer | 是 | 游戏ID |
| action | String | 是 | 操作：like（点赞）/unlike（取消）/toggle（切换） |

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "liked": true,
    "likeCount": 13
  }
}
```

---

#### 4.5.2 记录游玩次数

**接口：** `POST /api/v1/games/:id/play`

**说明：** 记录游戏被游玩的次数

**无需认证**

**成功响应（200）：**
```json
{
  "code": 0,
  "message": "记录成功",
  "data": {
    "playCount": 46
  }
}
```

---

### 4.6 Stream接口特殊说明

#### 4.6.1 Server-Sent Events (SSE) 规范

AI生成相关接口使用SSE技术实现实时进度推送，前端需要特殊处理。

**连接特性：**
- 长连接，生成过程保持连接
- 单向推送，服务器 → 客户端
- 自动重连机制（浏览器原生支持）

**超时设置：**
- 连接超时：5分钟
- 生成超时：3分钟
- 心跳间隔：30秒

#### 4.6.2 前端SSE连接管理

**推荐实现方式：**

```javascript
class AIStreamGenerator {
  constructor(token) {
    this.token = token;
    this.abortController = null;
  }

  async generate(description, onMessage, onError, onComplete) {
    this.abortController = new AbortController();

    try {
      const response = await fetch('/api/v1/ai/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ description }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete?.();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              await onMessage(data);

              // 收到complete或error消息后结束
              if (data.type === 'complete' || data.type === 'error') {
                onComplete?.(data);
                return;
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation cancelled');
      } else {
        onError?.(error);
      }
    }
  }

  cancel() {
    this.abortController?.abort();
  }
}

// 使用示例
const generator = new AIStreamGenerator(token);

await generator.generate(
  description,
  (data) => {
    // 处理每条消息
    console.log('Progress:', data.message);
  },
  (error) => {
    // 错误处理
    console.error('Error:', error);
  },
  (result) => {
    // 完成
    if (result?.type === 'complete') {
      console.log('Game generated:', result.data);
    }
  }
);

// 取消生成
// generator.cancel();
```

#### 4.6.3 断线重连策略

```javascript
class ReconnectableGenerator {
  constructor(token) {
    this.token = token;
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  async generateWithRetry(description, handlers) {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.generate(description, handlers);
        return; // 成功则返回
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error);

        if (attempt === this.maxRetries) {
          handlers.onError?.(error);
          return;
        }

        // 指数退避
        await new Promise(resolve =>
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1))
        );
      }
    }
  }
}
```

#### 4.6.4 uni-app中的SSE实现

```javascript
// uni-app不支持原生EventSource，使用封装
export function aiGenerate(description) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    let eventData = '';

    const requestTask = uni.request({
      url: `${BASE_URL}/ai/generate`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { description },
      enableChunked: true, // 启用分块传输
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(resultData);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });

    // 处理流式数据（需要配合插件）
    // 注意：uni-app原生不支持SSE，建议使用H5端或原生插件
  });
}
```

---

## 五、错误处理规范

### 5.1 错误响应格式

所有错误响应都遵循统一格式：

```json
{
  "code": <错误码>,
  "message": "<错误描述>",
  "data": null,
  "errors": [
    {
      "field": "<字段名>",
      "message": "<错误描述>"
    }
  ],
  "timestamp": "<ISO 8601时间戳>"
}
```

### 5.2 前端错误处理建议

```javascript
// 前端统一错误处理
try {
  const response = await api.games.create(data)
} catch (error) {
  switch (error.code) {
    case 2001: // 未登录
      // 跳转登录
      uni.navigateTo({ url: '/pages/login' })
      break
    case 4001: // 游戏不存在
      uni.showToast({ title: '游戏不存在' })
      break
    case 5001: // AI生成失败
      uni.showToast({ title: '生成失败，请重试' })
      break
    default:
      uni.showToast({ title: error.message || '请求失败' })
  }
}
```

---

## 六、前端调用示例

### 6.1 封装API调用

```javascript
// src/services/game.js
import request from '@/utils/request'

export default {
  // 获取我的游戏
  getMyGames(params = {}) {
    return request.get('/games', params)
  },

  // 创建游戏
  createGame(data) {
    return request.post('/games', data)
  },

  // 发布到广场
  publishGame(id, publishData) {
    return request.post(`/games/${id}/publish`, publishData)
  }
}
```

### 6.2 Store调用示例

```javascript
// src/store/modules/game.js
import { gameApi } from '@/services'

export const useGameStore = defineStore('game', () => {
  const games = ref([])

  // 获取我的游戏
  const fetchMyGames = async (page = 1) => {
    const res = await gameApi.getMyGames({ page, limit: 20 })
    games.value = res.data.items
  }

  // 创建游戏
  const createGame = async (gameData) => {
    const res = await gameApi.createGame(gameData)
    games.value.unshift(res.data)
    return res.data
  }

  return {
    games,
    fetchMyGames,
    createGame
  }
})
```

---

## 七、数据验证规则

### 7.1 游戏标题

```javascript
{
  type: String,
  required: true,
  minLength: 1,
  maxLength: 50,
  pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/
}
```

### 7.2 游戏描述

```javascript
{
  type: String,
  required: false,
  maxLength: 500
}
```

### 7.3 游戏代码

```javascript
{
  type: String,
  required: true,
  minLength: 50,
  // 验证是否包含HTML标签
  pattern: /<html|<body|<script/i
}
```

---

## 八、接口限流规则

### 8.1 限流策略

| 接口类型 | 限流规则 |
|---------|---------|
| AI生成接口（Stream） | 每用户每天最多10次，同时只能有1个生成任务 |
| AI修改接口（Stream） | 每用户每天最多20次 |
| 登录接口 | 每IP每分钟最多10次 |
| 游戏CRUD | 每用户每分钟最多20次 |
| 游戏广场 | 每IP每分钟最多60次 |

**AI生成配额说明：**
- 免费用户：每天10次生成 + 20次修改
- VIP用户：每天50次生成 + 100次修改
- 配额每天0点重置
- 修改不计入生成配额

### 8.2 限流响应

**HTTP状态码：** 429 Too Many Requests

```json
{
  "code": 429,
  "message": "请求过于频繁，请稍后再试",
  "data": {
    "retryAfter": 60,
    "limit": "每分钟最多3次"
  }
}
```

---

## 九、接口测试工具

### 9.1 推荐工具

- **Postman** - 接口测试
- **curl** - 命令行测试
- **UniApp自带的网络请求工具**

### 9.2 测试环境配置

**Postman环境变量：**
```
base_url = http://localhost:3001/api/v1
token = YOUR_JWT_TOKEN
```

---

## 十、文档更新记录

| 版本 | 日期 | 更新内容 | 更新人 |
|-----|------|---------|-------|
| v1.0 | 2026-03-23 | 初始版本 | - |
| v1.1 | 2026-03-23 | 添加AI生成Stream接口、健康检查接口、错误码更新 | - |

---

**文档结束**

**注意事项：**
1. 所有时间戳使用 ISO 8601 格式
2. 所有接口返回数据中的时间戳都是 UTC 时区
3. 前端需要处理时区转换
4. Token 有效期请参考具体接口说明
5. 建议前端统一处理错误响应
