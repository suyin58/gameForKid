#!/bin/bash

echo "========================================"
echo "儿童AI游戏创作平台 - 快速启动"
echo "========================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "[1/3] 检测 Node.js 版本..."
node -v

echo ""
echo "[2/3] 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "[错误] 依赖安装失败！"
    echo "可能的解决方案:"
    echo "1. 检查网络连接"
    echo "2. 使用淘宝镜像: npm install --registry=https://registry.npmmirror.com"
    exit 1
fi

echo ""
echo "[3/3] 启动 H5 预览..."
echo ""
echo "========================================"
echo "预览地址: http://localhost:5173"
echo "按 Ctrl+C 可以停止预览"
echo "========================================"
echo ""

npm run dev:h5
