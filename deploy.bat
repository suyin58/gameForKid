@echo off
REM ========================================
REM 儿童AI游戏创作平台 - Docker部署脚本 (Windows)
REM ========================================

setlocal enabledelayedexpansion

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="build" goto build
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="update" goto update
if "%1"=="backup" goto backup
if "%1"=="health" goto health
if "%1"=="cleanup" goto cleanup
goto help

:build
echo [INFO] 构建Docker镜像...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo [ERROR] 镜像构建失败
    exit /b 1
)
echo [INFO] 镜像构建完成
goto end

:start
echo [INFO] 启动服务...
docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] 服务启动失败
    exit /b 1
)
echo [INFO] 服务启动完成
docker-compose ps
goto end

:stop
echo [INFO] 停止服务...
docker-compose down
if %errorlevel% neq 0 (
    echo [ERROR] 服务停止失败
    exit /b 1
)
echo [INFO] 服务已停止
goto end

:restart
echo [INFO] 重启服务...
docker-compose restart
if %errorlevel% neq 0 (
    echo [ERROR] 服务重启失败
    exit /b 1
)
echo [INFO] 服务已重启
goto end

:logs
echo [INFO] 查看服务日志（Ctrl+C退出）...
docker-compose logs -f
goto end

:update
echo [INFO] 更新服务...
git pull
if %errorlevel% neq 0 (
    echo [ERROR] 代码拉取失败
    exit /b 1
)
call :build
docker-compose up -d
echo [INFO] 服务已更新
goto end

:backup
echo [INFO] 备份数据...
set BACKUP_DIR=backups\%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
mkdir "%BACKUP_DIR%" 2>nul

if exist "data" (
    xcopy data "%BACKUP_DIR%\data\" /E /I /Y
    echo [INFO] 数据库已备份到: %BACKUP_DIR%
)

if exist "logs" (
    xcopy logs "%BACKUP_DIR%\logs\" /E /I /Y
    echo [INFO] 日志已备份到: %BACKUP_DIR%
)
goto end

:health
echo [INFO] 执行健康检查...
curl -f http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] 后端服务正常
) else (
    echo [ERROR] 后端服务异常
    exit /b 1
)
goto end

:cleanup
echo [INFO] 清理未使用的资源...
docker system prune -f
echo [INFO] 清理完成
goto end

:help
echo 儿童AI游戏创作平台 - Docker部署脚本 (Windows)
echo.
echo 用法: deploy.bat [命令]
echo.
echo 命令:
echo   build       构建Docker镜像
echo   start       启动服务
echo   stop        停止服务
echo   restart     重启服务
echo   logs        查看日志
echo   update      更新服务（拉取代码并重新构建）
echo   backup      备份数据
echo   health      健康检查
echo   cleanup     清理未使用的Docker资源
echo   help        显示此帮助信息
echo.
echo 示例:
echo   deploy.bat build    # 构建镜像
echo   deploy.bat start    # 启动服务
echo   deploy.bat logs     # 查看日志
echo.
goto end

:end
endlocal
