@echo off
REM ========================================
REM Docker 自动下载和安装脚本
REM 适用于 Windows 10/11
REM ========================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Docker Desktop 自动安装脚本
echo ========================================
echo.

REM 检查是否以管理员身份运行
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] 建议以管理员身份运行此脚本
    echo.
    echo 右键点击此文件，选择"以管理员身份运行"
    echo.
    pause
    exit /b 0
)

REM 检查Docker是否已安装
where docker >nul 2>nul
if %errorlevel% equ 0 (
    echo [信息] Docker已安装
    docker --version
    echo.
    goto :check_running
)

echo [步骤1] 检查系统要求...
echo.

REM 检查Windows版本
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo Windows版本: %VERSION%

REM 检查WSL
wsl --status >nul 2>&1
if %errorlevel% neq 0 (
    echo [信息] WSL未安装，将在Docker安装时自动安装
)

echo [完成] 系统检查通过
echo.

echo [步骤2] 下载Docker Desktop...
echo.

REM Docker Desktop下载链接（Windows）
set DOCKER_URL=https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

set INSTALLER=%TEMP%\DockerDesktopInstaller.exe

echo 正在下载Docker Desktop...
echo 下载地址: %DOCKER_URL%
echo 保存位置: %INSTALLER%
echo.

REM 使用PowerShell下载
powershell -Command "& {Invoke-WebRequest -Uri '%DOCKER_URL%' -OutFile '%INSTALLER%'}"

if not exist "%INSTALLER%" (
    echo [错误] 下载失败！
    echo.
    echo 请手动下载并安装：
    echo 1. 访问 https://www.docker.com/products/docker-desktop/
    echo 2. 点击 "Download for Windows"
    echo 3. 运行下载的安装程序
    echo.
    pause
    exit /b 1
)

echo [完成] Docker Desktop下载完成
echo.

echo [步骤3] 安装Docker Desktop...
echo.
echo 正在启动安装程序...
echo.

start /wait "" "%INSTALLER%" install --quiet

if %errorlevel% equ 0 (
    echo [完成] Docker Desktop安装成功！
) else (
    echo [警告] 安装可能未完成，请手动检查
)

REM 清理安装文件
del "%INSTALLER%" 2>nul

echo.
echo ========================================
echo   安装完成！
echo ========================================
echo.
echo 重要提示：
echo.
echo 1. 重启计算机
echo.
echo 2. 重启后启动 Docker Desktop
echo    - 从开始菜单搜索 "Docker Desktop"
echo    - 或双击桌面上的 Docker 图标
echo.
echo 3. 等待Docker启动完成（顶部状态栏出现鲸鱼图标）
echo.
echo 4. 验证安装
echo    打开新的命令提示符或PowerShell
echo    运行: docker --version
echo.

goto :end

:check_running
echo [检查] Docker是否正在运行...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo [成功] Docker正在运行
    echo.
    echo 您可以继续部署项目了！
    echo.
    echo 下一步:
    echo   运行: quick-deploy.bat
    echo.
) else (
    echo [信息] Docker已安装但未运行
    echo.
    echo 请启动Docker Desktop:
    echo   1. 从开始菜单搜索 "Docker Desktop"
    echo   2. 点击启动
    echo   3. 等待Docker启动完成
    echo.
    echo 启动后，运行此脚本再次检查
)

:end
pause
