@echo off
REM ========================================
REM 快速启动脚本 - 方案1单容器部署
REM ========================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   儿童AI游戏创作平台 - 快速部署
echo   方案1：单容器（应用 + SQLite）
echo ========================================
echo.

REM 检查Docker是否安装
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] Docker未安装！
    echo.
    echo 请先安装Docker：
    echo 1. 访问 https://www.docker.com/products/docker-desktop/
    echo 2. 下载并安装 Docker Desktop for Windows
    echo 3. 重启计算机
    echo 4. 运行此脚本
    echo.
    pause
    exit /b 1
)

echo [检查] Docker已安装
docker --version

REM 检查Docker是否运行
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] Docker未运行！
    echo.
    echo 请启动Docker Desktop：
    echo 1. 从开始菜单打开 Docker Desktop
    echo 2. 等待Docker启动完成
    echo 3. 运行此脚本
    echo.
    pause
    exit /b 1
)

echo [检查] Docker正在运行
echo.

REM 创建必要的目录
if not exist "data" mkdir data
if not exist "logs" mkdir logs

echo [步骤1] 构建Docker镜像...
echo 这可能需要几分钟时间...
docker compose -f docker-compose-simple.yml build
if %errorlevel% neq 0 (
    echo [错误] 镜像构建失败
    pause
    exit /b 1
)
echo [完成] 镜像构建成功
echo.

echo [步骤2] 启动服务...
docker compose -f docker-compose-simple.yml up -d
if %errorlevel% neq 0 (
    echo [错误] 服务启动失败
    pause
    exit /b 1
)
echo [完成] 服务启动成功
echo.

echo [步骤3] 等待服务就绪...
timeout /t 5 /nobreak >nul

echo [步骤4] 健康检查...
curl -s http://localhost:3001/health >nul 2>nul
if %errorlevel% equ 0 (
    echo [成功] 服务运行正常！
    echo.
    echo ========================================
    echo   部署成功！
    echo ========================================
    echo.
    echo 服务地址：
    echo   - API: http://localhost:3001
    echo   - 健康检查: http://localhost:3001/health
    echo.
    echo 常用命令：
    echo   - 查看日志: docker-compose -f docker-compose-simple.yml logs -f
    echo   - 停止服务: docker-compose -f docker-compose-simple.yml down
    echo   - 重启服务: docker-compose -f docker-compose-simple.yml restart
    echo   - 查看状态: docker-compose -f docker-compose-simple.yml ps
    echo.
    echo 数据目录：
    echo   - 数据库: ./data/kidsgame.db
    echo   - 日志: ./logs/
    echo.
) else (
    echo [警告] 健康检查失败，但服务可能正在启动中
    echo.
    echo 请等待30秒后手动检查：
    echo   curl http://localhost:3001/health
    echo.
    echo 或查看日志：
    echo   docker-compose -f docker-compose-simple.yml logs
)

echo 按任意键打开日志...
pause >nul

REM 打开日志跟踪
start "Docker日志" cmd /k "docker-compose -f docker-compose-simple.yml logs -f"

endlocal
