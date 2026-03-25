# PostgreSQL 安装指南 - Windows

## 📋 安装前准备

**安装路径：** `D:\Program Files\PostgreSQL\16`

**所需空间：** 约 500MB

---

## 🔧 详细安装步骤

### 1. 运行安装程序

双击下载的 `postgresql-16.1-1-windows-x64.exe`

### 2. 安装向导设置

#### 步骤2.1 - Installation Directory
```
点击 "Browse..." 选择安装目录：
D:\Program Files\PostgreSQL\16
```

#### 步骤2.2 - Data Directory
```
数据目录（建议默认或自定义）：
D:\Program Files\PostgreSQL\16\data
```

#### 步骤2.3 - Password
```
设置超级用户密码：
用户名: postgres
密码: [请输入你的密码，记住它！]
建议: Postgres123!
```

#### 步骤2.4 - Port
```
端口号: 5432 (默认)
确保端口未被占用
```

#### 步骤2.5 - Advanced Options
```
✅ 勾选 "Install stack builder"  (可选)
✅ 勾选 "Configure pgAdmin 4" (可选，但推荐)
```

#### 步骤2.6 - 准备安装
```
点击 "Next" 开始安装
等待 2-5 分钟
```

---

### 3. 安装完成验证

安装完成后，打开 **命令提示符（CMD）** 或 **PowerShell**：

```bash
# 检查PostgreSQL版本
psql --version

# 应该显示：psql (PostgreSQL) 16.1
```

---

## 🔐 配置环境变量（如果自动配置失败）

### 添加到PATH
1. 右键 "此电脑" → 属性
2. 高级系统设置 → 环境变量
3. 系统变量 → Path → 编辑
4. 添加：`D:\Program Files\PostgreSQL\16\bin`
5. 确定保存

---

## 🧪 测试连接

```bash
# 连接数据库
psql -U postgres

# 输入密码后应该看到：
# postgres=#

# 创建测试数据库
CREATE DATABASE kidsgame;

# 查看数据库
\l

# 退出
\q
```

---

## 📝 重要信息记录

```
安装路径: D:\Program Files\PostgreSQL\16
数据目录: D:\Program Files\PostgreSQL\16\data
端口号:   5432
用户名:   postgres
密码:     [你设置的密码]
数据库名: kidsgame
```

---

## 🚀 下一步

安装完成后，通知我，我会：
1. 修改后端代码适配PostgreSQL
2. 创建数据表结构
3. 运行种子数据
4. 测试功能2

---

## ⚠️ 常见问题

### Q1: 端口5432被占用？
A: 安装时选择其他端口如5433

### Q2: 找不到psql命令？
A: 检查环境变量PATH是否包含bin目录

### Q3: 忘记密码？
A: 需要重新安装或重置密码

---

**安装完成后请告诉我！** 🎉
