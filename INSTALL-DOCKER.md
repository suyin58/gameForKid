# Docker 安装指南

## 🐳 在Windows上安装Docker

### 方法一：使用Docker Desktop（推荐）

1. **下载Docker Desktop**
   - 访问：https://www.docker.com/products/docker-desktop/
   - 点击 "Download for Windows"
   - 下载 `Docker Desktop Installer.exe`

2. **安装步骤**
   ```
   1. 双击运行安装程序
   2. 勾选 "Use WSL 2 instead of Hyper-V"（推荐）
   3. 点击 "OK" 开始安装
   4. 安装完成后重启计算机
   5. 启动 Docker Desktop
   ```

3. **验证安装**
   ```cmd
   # 打开PowerShell或命令提示符
   docker --version
   docker compose version
   ```

### 方法二：使用命令行自动安装

创建 `install-docker.bat` 文件并运行：

```batch
@echo off
echo 正在检查Docker安装状态...

where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Docker已安装
    docker --version
    exit /b 0
)

echo Docker未安装，请访问以下地址下载安装：
echo https://www.docker.com/products/docker-desktop/
echo.
echo 或者使用Chocolatey安装：
echo choco install docker-desktop
echo.

pause
```

### 方法三：使用Chocolatey安装（需要管理员权限）

```powershell
# 1. 以管理员身份打开PowerShell
# 2. 安装Chocolatey（如果未安装）
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 3. 安装Docker Desktop
choco install docker-desktop -y

# 4. 重启计算机
shutdown /r /t 10
```

---

## 🐳 在Linux上安装Docker

### Ubuntu/Debian

```bash
# 1. 更新包索引
sudo apt-get update

# 2. 安装依赖
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 3. 添加Docker官方GPG密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. 设置仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. 安装Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 6. 验证安装
sudo docker run hello-world

# 7. 将用户添加到docker组（避免每次都使用sudo）
sudo usermod -aG docker $USER
newgrp docker
```

### CentOS/RHEL

```bash
# 1. 安装yum-utils
sudo yum install -y yum-utils

# 2. 添加Docker仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 3. 安装Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 4. 启动Docker
sudo systemctl start docker
sudo systemctl enable docker

# 5. 将用户添加到docker组
sudo usermod -aG docker $USER
```

---

## 🐳 在macOS上安装Docker

1. **下载Docker Desktop for Mac**
   - 访问：https://www.docker.com/products/docker-desktop/
   - 下载 `Docker.dmg`
   - 拖拽到Applications文件夹

2. **启动Docker Desktop**
   - 从Applications启动Docker
   - 点击顶部菜单栏的Docker图标
   - 等待Docker启动完成

3. **验证安装**
   ```bash
   docker --version
   docker compose version
   ```

---

## ✅ 安装后验证

安装完成后，运行以下命令验证：

```bash
# 检查Docker版本
docker --version

# 检查Docker Compose版本
docker compose version

# 测试运行
docker run hello-world

# 查看系统信息
docker info
```

预期输出：
```
Docker version 24.0.0 or higher
Docker Compose version v2.20.0 or higher
```

---

## 🚀 安装完成后

Docker安装完成后，返回项目目录执行：

```bash
# 1. 进入项目目录
cd D:/claude/gameForKid

# 2. 构建镜像
docker compose build backend

# 3. 启动服务
docker compose up -d backend

# 4. 查看日志
docker compose logs -f backend

# 5. 验证服务
curl http://localhost:3001/health
```

---

## 🔧 常见问题

### Q1: WSL 2未安装
**解决方案:**
```powershell
# 以管理员身份运行PowerShell
wsl --install
```

### Q2: 虚拟化未启用
**解决方案:**
1. 重启电脑
2. 进入BIOS设置
3. 启用虚拟化技术（VT-x或AMD-V）

### Q3: Docker服务未启动
**解决方案:**
```cmd
# 检查Docker服务状态
sc query docker

# 启动Docker服务
sc start docker
```

### Q4: 权限错误
**解决方案:**
```bash
# Linux/Mac: 使用sudo或添加用户到docker组
sudo docker compose build

# Windows: 以管理员身份运行命令提示符
```

---

## 📚 更多资源

- [Docker官方文档](https://docs.docker.com/)
- [Docker Desktop下载](https://www.docker.com/products/docker-desktop/)
- [Docker Compose文档](https://docs.docker.com/compose/)
- [WSL 2安装指南](https://docs.microsoft.com/en-us/windows/wsl/install)

---

**安装Docker后，请告知我，我将帮您继续构建镜像！** 🚀
