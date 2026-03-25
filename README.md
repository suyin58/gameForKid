# 儿童AI游戏创作平台

> 让不会编程的6-14岁儿童也能创作属于自己的HTML小游戏

## 📖 项目简介

这是一个基于 **uni-app** 开发的微信小程序，通过 **AI辅助** 和 **语音交互**，让儿童发挥想象力，创作并分享自己的小游戏。

### 核心功能

- 🎤 **语音创作** - 通过语音描述游戏想法，AI自动生成游戏代码
- 🎮 **游戏试玩** - 实时体验生成的游戏
- 🌐 **游戏广场** - 浏览和试玩他人创作的游戏
- 📋 **克隆学习** - 克隆他人游戏，基于此继续创作
- ❤️ **社交互动** - 点赞、发布、分享

## 🏗️ 技术架构

### 前端

- **框架**: uni-app (Vue 3 + Composition API)
- **状态管理**: Pinia
- **UI**: 自定义组件库 + CSS变量
- **工具**: Vite

### 后端（待开发）

- **运行环境**: Node.js
- **Web框架**: Express/Koa
- **数据库**: MongoDB
- **AI服务**: GPT-4 / Claude

## 📁 项目结构

```
src/
├── pages/                    # 页面
│   ├── index/               # 首页（我的作品）
│   ├── create/              # 创作页
│   ├── square/              # 游戏广场
│   ├── play/                # 游戏试玩
│   └── publish/             # 发布表单
│
├── components/              # 组件
│   ├── game-card/          # 游戏卡片
│   ├── voice-input/        # 语音输入
│   ├── game-webview/       # 游戏容器
│   ├── loading-animation/  # 加载动画
│   └── empty-state/        # 空状态
│
├── services/               # API服务层
│   ├── user.js            # 用户API
│   ├── game.js            # 游戏API
│   └── ai.js              # AI生成API
│
├── store/                  # 状态管理
│   └── modules/
│       ├── user.js        # 用户状态
│       ├── game.js        # 游戏状态
│       └── app.js         # 应用状态
│
├── utils/                  # 工具函数
│   ├── request.js         # 网络请求
│   ├── voice.js           # 语音识别
│   ├── storage.js         # 本地存储
│   └── validator.js       # 表单验证
│
├── config/                 # 配置文件
│   ├── constants.js       # 常量定义
│   └── env.js             # 环境配置
│
├── styles/                 # 全局样式
│   └── global.scss        # 全局样式
│
├── mixins/                 # 页面混入
│   └── index.js
│
├── App.vue                # 应用入口
├── main.js                # 主入口文件
├── pages.json             # 页面配置
└── manifest.json          # 应用配置
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式 - 微信小程序

```bash
npm run dev:mp-weixin
```

然后使用微信开发者工具打开 `dist/dev/mp-weixin` 目录。

### 开发模式 - H5

```bash
npm run dev:h5
```

访问 http://localhost:3000

### 生产构建

```bash
# 微信小程序
npm run build:mp-weixin

# H5
npm run build:h5
```

## 📝 开发指南

### 添加新页面

1. 在 `src/pages/` 创建页面目录
2. 在 `src/pages.json` 注册页面路由
3. 实现页面逻辑和UI

### 添加新组件

1. 在 `src/components/` 创建组件目录
2. 使用 Vue 3 Composition API 编写组件
3. 在页面中引入使用

### 状态管理

使用 Pinia 进行状态管理：

```javascript
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
userStore.userInfo
userStore.wechatLogin()
```

### API调用

通过服务层调用API：

```javascript
import { gameApi } from '@/services'

const res = await gameApi.getMyGames()
```

## 🎨 设计规范

### 颜色

```scss
--primary-color: #FF6B6B;    // 主题色
--success-color: #51CF66;    // 成功
--warning-color: #FFD43B;    // 警告
--danger-color: #FF6B6B;     // 危险
```

### 间距

```scss
--spacing-xs: 8rpx;
--spacing-sm: 16rpx;
--spacing-md: 24rpx;
--spacing-lg: 32rpx;
--spacing-xl: 48rpx;
```

### 圆角

```scss
--radius-sm: 8rpx;
--radius-md: 16rpx;
--radius-lg: 24rpx;
--radius-xl: 32rpx;
```

## 🔧 配置说明

### 环境配置

编辑 `src/config/env.js` 修改API地址：

```javascript
const env = {
  development: {
    baseURL: 'http://localhost:3001/api'
  },
  production: {
    baseURL: 'https://api.kidsgame.com'
  }
}
```

### 微信小程序配置

编辑 `src/manifest.json` 填写微信小程序 appid：

```json
{
  "mp-weixin": {
    "appid": "your-appid"
  }
}
```

## 📱 页面说明

### 首页（我的作品）

- 展示用户创作的所有游戏
- 进入创作页和游戏广场的入口

### 创作页

- 语音输入游戏描述
- 调用AI生成游戏代码
- 跳转到试玩页

### 游戏广场

- 浏览所有公开游戏
- 支持搜索和排序
- 试玩和克隆游戏

### 游戏试玩页

- webview加载HTML游戏
- 保存、发布、克隆等操作
- 自己的游戏可重新生成

### 发布页

- 填写游戏信息
- 选择游戏类型
- 发布到广场

## 🔐 权限说明

### 微信小程序权限

- `scope.userLocation` - 位置信息（可选）
- `startRecord` - 开始录音
- `translateVoice` - 语音识别

## 🛠️ 常见问题

### 语音识别不工作

1. 检查麦克风权限是否开启
2. 确认网络连接正常
3. 微信小程序需要真机调试

### 游戏加载失败

1. 检查后端API是否正常运行
2. 确认游戏代码格式正确
3. 查看控制台错误信息

### 样式不生效

1. 确认已引入全局样式 `@/styles/global.scss`
2. 检查CSS变量是否定义
3. 使用 `lang="scss"` 属性

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请提交 Issue 或联系项目维护者。

---

**让每个孩子都能成为游戏创作者！** 🎮✨
