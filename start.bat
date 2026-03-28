@echo off
echo ========================================
echo 儿童AI游戏创作平台 - 快速启动
echo ========================================
echo.

REM 检查 Node.js 是否安装
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] 检测 Node.js 版本...
node -v

echo.
echo [2/3] 安装项目依赖...
call npm install

if errorlevel 1 (
    echo.
    echo [错误] 依赖安装失败！
    echo 可能的解决方案:
    echo 1. 检查网络连接
    echo 2. 使用淘宝镜像: npm install --registry=https://registry.npmmirror.com
    pause
    exit /b 1
)

echo.
echo [3/3] 启动 H5 预览...
echo.
echo ========================================
echo 预览地址: http://localhost:5173
echo 按 Ctrl+C 可以停止预览
echo ========================================
echo.

call npm run dev:h5

pause
