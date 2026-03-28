# 儿童AI游戏创作平台 - uni-app 版本

## 快速开始预览

### 方法一：使用 HBuilderX（推荐新手）

1. **下载 HBuilderX**
   - 访问 [https://www.dcloud.io/hbuilderx.html](https://www.dcloud.io/hbuilderx.html)
   - 下载"标准版"即可

2. **导入项目**
   - 打开 HBuilderX
   - 文件 → 打开目录 → 选择本项目文件夹

3. **运行预览**
   - 点击菜单：运行 → 运行到小程序模拟器 → 微信开发者工具
   - 或点击菜单：运行 → 运行到浏览器 → Chrome（H5 预览）

4. **首次运行需要**
   - 安装微信开发者工具
   - 在微信开发者工具中设置：设置 → 安全设置 → 安全服务 → 选择"不验证合法域名"

### 方法二：使用命令行（推荐开发者）

```bash
# 1. 安装依赖
npm install

# 2. 运行到 H5（浏览器预览，最快速）
npm run dev:h5

# 3. 运行到微信小程序
npm run dev:mp-weixin
# 然后用微信开发者工具打开 dist/dev/mp-weixin 目录
```

## 📱 预览方式对比

| 方式 | 优点 | 缺点 | 适用场景 |
|-----|------|------|---------|
| **H5 预览** | ⚡ 最快<br>🔍 调试方便<br>💻 无需其他工具 | 部分小程序 API 不可用 | 快速查看效果<br>样式调试 |
| **微信小程序** | ✅ 完整功能<br>📱 真实环境 | 需要微信开发者工具<br>需要安装依赖 | 最终测试<br>真机调试 |

## 🚀 推荐预览流程

1. **先 H5 预览**（快速查看效果）
   ```bash
   npm run dev:h5
   # 打开浏览器访问 http://localhost:5173
   ```

2. **再微信小程序预览**（真实环境测试）
   ```bash
   npm run dev:mp-weixin
   # 用微信开发者工具打开 dist/dev/mp-weixin 目录
   ```

## ⚠️ 注意事项

1. **tabbar 图标**
   - 当前 `pages.json` 配置了 tabbar，但图标文件不存在
   - 快速预览可以先注释掉 `pages.json` 中的 `tabBar` 配置
   - 或者创建 `static/tabbar/` 目录并添加对应图标

2. **微信小程序 appid**
   - `manifest.json` 中的 `appid` 为空
   - 真机预览需要在 [微信公众平台](https://mp.weixin.qq.com/) 注册并获取 appid

3. **平台差异**
   - H5 预览可以体验大部分功能
   - 某些小程序专属 API（如微信登录）在 H5 中不可用

## 🛠️ 项目结构

```
D:\claude\gameForKid\
├── src/
│   ├── pages/           # 页面
│   │   ├── index/       # 我的作品
│   │   ├── create/      # 创作游戏
│   │   ├── plaza/       # 游戏广场
│   │   └── play/        # 游戏试玩
│   └── styles/          # 全局样式
│       └── global.scss
├── static/              # 静态资源（需要手动创建）
│   └── tabbar/         # tabbar 图标
├── pages.json          # 页面配置
├── main.js             # 入口文件
├── App.vue             # 应用配置
├── manifest.json       # 应用配置
└── package.json        # 依赖配置
```

## 📖 更多信息

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
