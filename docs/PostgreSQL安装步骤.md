# PostgreSQL 完整安装和配置步骤

## 📋 当前状态

✅ 已准备的文件：
- `docs/PostgreSQL安装指南.md` - 详细安装说明
- `server/.env.postgresql` - PostgreSQL环境配置
- `server/src/config/database-pg.js` - PostgreSQL连接配置
- `server/src/scripts/init-pg.sql` - 数据库表结构SQL
- `server/src/scripts/init-db.js` - 数据库初始化脚本
- `server/src/scripts/seed-pg.js` - 种子数据脚本

---

## 🚀 完整安装步骤（请按顺序执行）

### 步骤1: 下载PostgreSQL安装包

**方式A: 使用我提供的链接**
```
https://get.enterprisedb.com/postgresql/postgresql-16.1-1-windows-x64.exe
```

**方式B: 访问官网下载**
```
https://www.postgresql.org/download/windows/
```
选择：Version 16.1 → Windows → x86-64 → 下载安装包

---

### 步骤2: 运行安装程序

双击下载的 `.exe` 文件，按向导操作：

#### 2.1 安装目录
```
点击 Browse → 选择：D:\Program Files\PostgreSQL\16
点击 Next
```

#### 2.2 数据目录
```
保持默认或选择：D:\Program Files\PostgreSQL\16\data
点击 Next
```

#### 2.3 设置密码
```
密码：Postgres123!
（记住这个密码，后面会用到）
点击 Next
```

#### 2.4 端口号
```
端口：5432
（如果被占用会提示，可以改用5433）
点击 Next
```

#### 2.5 高级选项
```
✅ 勾选 Stack Builder （可选）
✅ 勾选 pgAdmin 4 （推荐安装）
点击 Next
```

#### 2.6 开始安装
```
点击 Next → 等待 2-5 分钟 → 点击 Finish
```

---

### 步骤3: 创建数据库

安装完成后，打开 **SQL Shell (psql)**：

```bash
# 会提示输入信息
Server [localhost]:
Database [postgres]:
Port [5432]:
Username [postgres]:
Password: [输入你设置的密码：Postgres123!]
```

进入后执行：

```sql
-- 创建数据库
CREATE DATABASE kidsgame;

-- 验证创建成功
\l

-- 退出
\q
```

---

### 步骤4: 配置环境变量

**检查PATH是否自动添加：**

打开新的 **CMD** 或 **PowerShell**：
```bash
psql --version
```

如果显示版本号，说明PATH已配置 ✅

如果提示命令不存在，手动添加：
1. 右键 "此电脑" → 属性
2. 高级系统设置 → 环境变量
3. 系统变量 → Path → 编辑 → 新建
4. 添加：`D:\Program Files\PostgreSQL\16\bin`
5. 确定保存，重新打开终端

---

### 步骤5: 配置项目

```bash
# 1. 复制PostgreSQL环境配置
cd server
cp .env.postgresql .env

# 2. 编辑.env文件（如果密码不是Postgres123!）
# 修改 PG_PASSWORD=你设置的密码

# 3. 安装PostgreSQL依赖
npm install pg

# 4. 初始化数据库（创建表结构）
npm run db:init

# 5. 生成测试数据
npm run db:seed
```

---

### 步骤6: 测试连接

```bash
# 启动服务器
npm run dev
```

应该看到：
```
✅ PostgreSQL连接成功
   主机: localhost:5432
   数据库: kidsgame
🚀 服务器启动成功
```

---

## ⚠️ 常见问题

### Q1: 端口5432被占用？
**A:** 安装时选择端口5433，然后修改`.env`中的PG_PORT=5433

### Q2: 找不到psql命令？
**A:** 检查环境变量PATH是否包含`D:\Program Files\PostgreSQL\16\bin`

### Q3: 数据库连接失败？
**A:** 检查以下几点：
1. PostgreSQL服务是否启动（在服务管理器中查看postgresql-x64-16）
2. .env中的密码是否正确
3. 数据库kidsgame是否已创建

### Q4: 需要重置密码？
**A:** 在SQL Shell中执行：
```sql
ALTER USER postgres PASSWORD '新密码';
```

---

## 📝 重要信息记录

安装完成后，记录以下信息：

```
安装目录: D:\Program Files\PostgreSQL\16
数据目录: D:\Program Files\PostgreSQL\16\data
端口号:   5432
用户名:   postgres
密码:     Postgres123! (或你设置的密码)
数据库名: kidsgame
```

---

## ✅ 完成检查清单

完成以下步骤后告诉我：

- [ ] PostgreSQL已安装到D盘
- [ ] 数据库kidsgame已创建
- [ ] .env已配置PostgreSQL连接信息
- [ ] 已运行 `npm install pg`
- [ ] 已运行 `npm run db:init`
- [ ] 已运行 `npm run db:seed`
- [ ] 服务器成功启动

---

## 🎯 下一步

安装完成后，我会：
1. 修改server.js使用PostgreSQL
2. 创建用户系统的Service和Controller
3. 开始功能3的开发

**准备好了吗？开始安装PostgreSQL！** 🚀
