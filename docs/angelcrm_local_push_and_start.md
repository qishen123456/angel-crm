# AngelCRM 本地推送与启动说明

更新时间：2026-07-07

## 1. 项目位置

- 本地目录：`/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm`
- GitHub 仓库：`https://github.com/qishen123456/angel-crm.git`
- 默认分支：`main`

进入项目目录：

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm"
```

## 2. 手动推送代码

### 2.1 最常用命令

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm"
git status
git add .
git commit -m "feat: 本次修改说明"
git push origin main
```

这套适合你已经确认本地改动都要提交的时候直接用。

### 2.2 推荐的安全推送顺序

如果担心远程分支已经有新代码，推荐用下面这套：

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm"
git status
git add .
git commit -m "feat: 本次修改说明"
git pull --rebase origin main
git push origin main
```

说明：

- `git status`：先看哪些文件变了。
- `git add .`：把当前目录下改动加入暂存区。
- `git commit -m "..."`：生成一次提交记录。
- `git pull --rebase origin main`：先把远程最新代码接回来，减少分叉。
- `git push origin main`：把本地提交推到 GitHub。

### 2.3 只推送指定文件

如果你不想把全部改动一起推，可以手动指定：

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm"
git status
git add backend/src/routes/data.ts frontend/src/pages/SettingsPage.tsx docs
git commit -m "feat: 数据迁移包优化"
git push origin main
```

### 2.4 查看远程仓库是否正确

```bash
git remote -v
```

当前仓库远程地址应为：

```bash
origin  https://github.com/qishen123456/angel-crm.git
origin  https://github.com/qishen123456/angel-crm.git
```

### 2.5 国内网络推送慢时

如果你本机需要代理再推送，可以先临时执行：

```bash
export ALL_PROXY=http://127.0.0.1:7897
export http_proxy=http://127.0.0.1:7897
export https_proxy=http://127.0.0.1:7897
```

然后再执行 `git push origin main`。

如果当前终端不想走代理，可以执行：

```bash
unset ALL_PROXY http_proxy https_proxy
```

## 3. 本地启动项目

### 3.1 Docker 一键启动

这是最省心的启动方式：

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm"
bash start.sh
```

启动完成后访问：

- 前端：`http://localhost:8888`
- 后端 API：`http://localhost:3001`

默认账号：

- 邮箱：`admin@angel.cn`
- 密码：`demo2026`

### 3.2 Docker 常用命令

手动启动容器：

```bash
docker compose up -d --build
```

查看运行状态：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f
```

停止服务：

```bash
docker compose down
```

### 3.3 本地开发模式启动

适合前后端分开调试。

后端：

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm/backend"
npm install
npm run dev
```

后端默认端口：`3001`

前端：

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm/frontend"
npm install
npm run dev
```

前端开发端口：`5173`

开发模式访问：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3001`

## 4. 构建命令

后端构建：

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm/backend"
npm run build
```

前端构建：

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm/frontend"
npm run build
```

## 5. 本地更新项目

如果 GitHub 上已经有最新代码，本地要同步并自动重建容器：

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm"
bash update.sh
```

`update.sh` 当前会做这些事：

1. 备份容器内 `/app/data`
2. 拉取远程最新代码
3. 重建 Docker 容器
4. 恢复数据目录
5. 做健康检查和登录测试

## 6. 建议你平时这样操作

### 6.1 改完代码后手动推送

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm"
git status
git add .
git commit -m "feat: 本次修改说明"
git push origin main
```

### 6.2 本地验证后再启动

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm/backend"
npm run build

cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm/frontend"
npm run build
```

然后回到项目根目录：

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm"
bash start.sh
```

## 7. 常见问题

### 7.1 `nothing to commit`

说明你没有新的改动，不需要提交。

### 7.2 `failed to push`

通常是下面几种原因：

- 远程已经有新提交，先执行 `git pull --rebase origin main`
- GitHub 认证失效
- 本机网络需要代理

### 7.3 Docker 启动失败

先看日志：

```bash
docker compose logs -f
```

或者看脚本日志：

```bash
ls -la "./logs"
```

## 8. 最短可用版本

如果你只想记一套最简单命令，就记这个：

### 推送

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm"
git add .
git commit -m "feat: 本次修改说明"
git push origin main
```

### 启动

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm"
bash start.sh
```
