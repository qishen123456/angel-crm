# Angel CRM - 一键部署指南

## 🚀 快速开始

### 环境要求

- Docker 24.0+
- Docker Compose 2.0+
- Git

### 一键启动

```bash
# 克隆项目
git clone https://github.com/qishen123456/angel-crm.git
cd angel-crm

# 一键启动（Linux/Mac）
./start.sh

# 或一键启动（Windows PowerShell）
.\start.ps1

# 或一键启动（Windows CMD）
start.bat
```

### 一键更新

当代码有更新时，无需手动操作，执行以下脚本即可自动拉取最新代码并重建容器：

```bash
# 一键更新（Linux/Mac）
./update.sh

# 或一键更新（Windows PowerShell）
.\update.ps1

# 或一键更新（Windows CMD）
update.bat
```

**更新流程**:
1. 从 GitHub 拉取最新代码
2. 停止现有容器
3. 清理旧镜像
4. 重新构建并启动容器
5. 测试服务是否正常

### 访问地址

- **前端页面**: http://localhost:8888
- **后端 API**: http://localhost:3001

### 默认登录

- **邮箱**: admin@angel.cn
- **密码**: demo2026

---

## 📁 项目结构

```
angel-crm/
├── backend/           # 后端服务 (Node.js + TypeScript)
│   ├── src/           # 源代码
│   ├── data/          # 数据存储目录（JSON 文件）
│   ├── Dockerfile     # 后端 Docker 构建配置
│   └── package.json   # 后端依赖
├── frontend/          # 前端应用 (React + TypeScript + Ant Design)
│   ├── src/           # 源代码
│   ├── Dockerfile     # 前端 Docker 构建配置
│   ├── nginx.conf     # Nginx 配置（代理 API 请求）
│   └── package.json   # 前端依赖
├── docker-compose.yml # Docker Compose 配置
├── start.sh           # Linux/Mac 一键启动脚本
├── start.ps1          # Windows PowerShell 一键启动脚本
├── start.bat          # Windows CMD 一键启动脚本
└── README.md          # 项目说明文档
```

---

## 🛠️ Docker 部署

### 使用 Docker Compose

```bash
# 构建并启动（首次运行）
docker compose up -d --build

# 启动（已构建过）
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 停止并删除数据卷
docker compose down -v
```

### 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 (Nginx) | 8080 | Web 界面访问 |
| 后端 (Node.js) | 3001 | API 服务 |

### 数据持久化

后端数据存储在 `backend/data/` 目录下，使用 JSON 文件持久化。

```bash
# 查看数据目录
ls backend/data/
```

---

## 🐳 Docker 镜像构建

### 手动构建

```bash
# 构建后端镜像
docker build -t crm-backend ./backend

# 构建前端镜像
docker build -t crm-frontend ./frontend
```

### 环境变量

后端支持以下环境变量：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3001 | 服务端口 |
| DATA_DIR | /app/data | 数据存储目录 |
| NODE_ENV | production | 运行环境 |

---

## 🔧 开发模式

### 本地开发

```bash
# 启动后端
cd backend
npm install
npm run dev

# 启动前端（新终端）
cd frontend
npm install
npm run dev
```

### 构建生产版本

```bash
# 构建后端
cd backend
npm run build

# 构建前端
cd frontend
npm run build
```

---

## 📝 API 接口

### 认证接口

```bash
# 登录
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@angel.cn",
  "password": "demo2026"
}

# 响应
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 数据接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/accounts | GET/POST | 客户账户 |
| /api/contacts | GET/POST | 联系人 |
| /api/leads | GET/POST | 线索 |
| /api/opportunities | GET/POST | 商机 |
| /api/contracts | GET/POST | 合同 |
| /api/payments | GET/POST | 付款 |
| /api/campaigns | GET/POST | 市场活动 |
| /api/activities | GET/POST | 跟进记录 |
| /api/endUsers | GET/POST | 终端用户 |

---

## 📦 技术栈

- **前端**: React 18, TypeScript, Ant Design, Zustand, Vite
- **后端**: Node.js 20, TypeScript, Express, JWT
- **数据库**: JSON 文件存储
- **容器**: Docker, Docker Compose, Nginx

---

## 🐛 常见问题

### Docker 镜像加速

本项目已默认使用阿里云镜像源，构建速度更快：

- **Node.js**: `registry.cn-hangzhou.aliyuncs.com/library/node:20-slim`
- **Nginx**: `registry.cn-hangzhou.aliyuncs.com/library/nginx:alpine`
- **npm**: `https://registry.npmmirror.com`

如需手动配置 Docker 镜像源：

```json
{
  "registry-mirrors": [
    "https://registry.cn-hangzhou.aliyuncs.com",
    "https://hub-mirror.c.163.com"
  ]
}
```

### 宝塔服务器部署

```bash
# 1. 进入项目目录
cd /www/wwwroot/angel-crm

# 2. 清除代理（服务器不需要代理）
unset ALL_PROXY http_proxy https_proxy

# 3. 拉取最新代码
git pull origin main

# 4. 启动服务
chmod +x start.sh update.sh
bash start.sh
```

### 更新代码

```bash
cd /www/wwwroot/angel-crm
unset ALL_PROXY http_proxy https_proxy
bash update.sh
```

### 端口冲突

如果端口被占用，修改 `docker-compose.yml` 中的端口映射：

```yaml
services:
  frontend:
    ports:
      - "8081:80"  # 修改为未占用端口
```

### 数据丢失

确保 `backend/data/` 目录存在且有写入权限。

### 日志查看

```bash
# 查看脚本日志
ls -la ./logs/
cat ./logs/start-*.log

# 查看 Docker 日志
docker logs angel-crm-backend
docker logs angel-crm-frontend
```

---

## 📄 许可证

MIT License
