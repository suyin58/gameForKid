# 快速启动指南

## 🚀 最简单的方式（推荐）

### Windows 用户
双击运行 `start.bat` 文件

### Mac/Linux 用户
```bash
chmod +x start.sh
./start.sh
```

浏览器会自动打开 http://localhost:5173

---

## 📋 手动启动（如果自动脚本失败）

### 步骤 1: 检查环境
```bash
node -v
```
确保 Node.js 版本 >= 16.0.0

### 步骤 2: 安装依赖
```bash
npm install
```

如果安装失败，使用淘宝镜像：
```bash
npm install --registry=https://registry.npmmirror.com
```

### 步骤 3: 启动预览
```bash
npm run dev:h5
```

浏览器访问: http://localhost:5173

---

## 🐛 常见问题

### Q1: 端口 5173 被占用
**A:** 修改 `vite.config.js` 中的端口号，或者运行：
```bash
npx kill-port 5173
npm run dev:h5
```

### Q2: 样式显示不正常
**A:** 清除浏览器缓存，按 Ctrl+Shift+R 强制刷新

### Q3: npm install 失败
**A:** 尝试以下方案：
```bash
# 方案 1: 清除缓存
npm cache clean --force
npm install

# 方案 2: 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install

# 方案 3: 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

### Q4: 页面空白
**A:** 检查浏览器控制台（F12）是否有错误信息

### Q5: 点击按钮没反应
**A:** 这是正常的，因为后端 API 还没有连接。前端已经展示完整 UI

---

## 📱 预览微信小程序

### 步骤 1: 编译小程序
```bash
npm run dev:mp-weixin
```

### 步骤 2: 打开微信开发者工具
1. 打开微信开发者工具
2. 导入项目，选择目录：`dist/dev/mp-weixin`
3. 点击"编译"

### 步骤 3: 设置（首次运行）
微信开发者工具 → 设置 → 安全设置 → 安全服务 → 不验证合法域名

---

## 🎯 功能说明

当前版本包含：
- ✅ 我的作品页面（游戏列表）
- ✅ 创作游戏页面（输入框、预览区、Stream 输出效果）
- ✅ 游戏广场页面（排序、游戏列表）
- ✅ 游戏试玩页面（全屏显示）

暂未实现（需要后端）：
- ❌ 用户登录
- ❌ 数据保存
- ❌ AI 生成游戏
- ❌ 微信分享

---

## 💡 开发建议

1. **先看 demo.html**
   - 直接用浏览器打开 `demo.html`
   - 可以看到完整的交互效果

2. **H5 预览**
   - 使用 `npm run dev:h5`
   - 最快的预览方式

3. **小程序预览**
   - 使用 `npm run dev:mp-weixin`
   - 真实环境测试

---

## 📞 需要帮助？

如果遇到其他问题，请检查：
1. Node.js 版本是否正确
2. 依赖是否完整安装
3. 浏览器控制台是否有错误
4. 终端是否有报错信息
