# AngelCRM 宝塔机一键更新说明

更新时间：2026-07-07

## 1. 服务器项目目录

宝塔服务器上项目目录默认按下面这个来：

```bash
cd /www/wwwroot/angel-crm
```

如果你的项目不在这个目录，先把路径替换成你服务器真实路径。

## 2. 宝塔机一键更新

这是最常用的一行命令，直接在宝塔终端执行：

```bash
cd /www/wwwroot/angel-crm && unset ALL_PROXY http_proxy https_proxy && chmod +x start.sh update.sh && bash update.sh
```

这条命令会做几件事：

1. 进入项目目录
2. 清掉代理变量，避免服务器走本地代理配置
3. 给脚本加执行权限
4. 执行 `update.sh`

当前 `update.sh` 已经包含：

1. 先检查 GitHub 是否能连接，失败时不会停止容器。
2. 备份容器内 `/app/data`。
3. 切换到远程最新代码。
4. 重建 Docker 容器。
5. 恢复数据目录。
6. 做健康检查和登录测试。

## 3. 宝塔机首次启动

如果是第一次部署，执行：

```bash
cd /www/wwwroot/angel-crm && unset ALL_PROXY http_proxy https_proxy && chmod +x start.sh update.sh && bash start.sh
```

启动完成后默认访问地址：

- 前端：`http://服务器IP:8888`
- 后端：`http://服务器IP:3001`

默认账号：

- 邮箱：`admin@angel.cn`
- 密码：`demo2026`

## 4. 分步更新命令

如果你不想一口气跑一整条，可以分开执行：

```bash
cd /www/wwwroot/angel-crm
unset ALL_PROXY http_proxy https_proxy
chmod +x start.sh update.sh
bash update.sh
```

## 5. 强制同步最新版

如果服务器仓库已经被改乱了，或者 `git pull` / `update.sh` 提示本地文件冲突，可以用下面这套强制同步。

注意：这会覆盖服务器项目目录里的代码改动，只保留 GitHub `main` 上的版本。

```bash
cd /www/wwwroot/angel-crm
unset ALL_PROXY http_proxy https_proxy
git fetch origin main
git reset --hard origin/main
chmod +x start.sh update.sh
bash start.sh
```

适合场景：

- 服务器有人手改过文件
- 上次更新中断
- 本地工作区脏了，无法正常拉取

## 6. 查看更新是否成功

### 6.1 看容器状态

```bash
cd /www/wwwroot/angel-crm
docker compose ps
```

### 6.2 看实时日志

```bash
cd /www/wwwroot/angel-crm
docker compose logs -f
```

### 6.3 看脚本日志

```bash
cd /www/wwwroot/angel-crm
ls -la logs
```

## 7. 宝塔机最短命令

如果你只记一条，就记这个更新命令：

```bash
cd /www/wwwroot/angel-crm && unset ALL_PROXY http_proxy https_proxy && bash update.sh
```

如果你只记一条启动命令，就记这个：

```bash
cd /www/wwwroot/angel-crm && unset ALL_PROXY http_proxy https_proxy && bash start.sh
```

## 8. 常见问题

### 8.1 `Permission denied`

先执行：

```bash
cd /www/wwwroot/angel-crm
chmod +x start.sh update.sh
```

### 8.2 `docker: command not found`

说明服务器没装 Docker 或 Docker 没启动，需要先在宝塔机安装 Docker / Docker Compose。

### 8.3 更新后网页打不开

先看日志：

```bash
cd /www/wwwroot/angel-crm
docker compose logs -f
```

再确认端口 `8888` 和 `3001` 是否被服务器防火墙或宝塔安全组拦住。

### 8.4 GitHub 连接超时

如果看到类似错误：

```bash
Failed to connect to github.com port 443: Connection timed out
```

说明宝塔服务器当前连不上 GitHub，不是 CRM 代码本身坏了。新版 `update.sh` 会先检查 GitHub 连接，连不上就直接退出，不会先停容器。

先看服务是否还在：

```bash
cd /www/wwwroot/angel-crm
docker compose ps
```

再做健康检查：

```bash
curl -s http://localhost:8888/api/health
```

如果服务正常，等网络恢复后重新执行：

```bash
cd /www/wwwroot/angel-crm && unset ALL_PROXY http_proxy https_proxy && bash update.sh
```

如果服务器一直连不上 GitHub，需要检查：

- 服务器 DNS 是否能解析 `github.com`
- 宝塔或服务器安全组是否拦截 443 出站
- 云服务器所在网络是否屏蔽 GitHub
- 是否需要给服务器配置可用代理

## 9. 推荐你以后这样用

### 日常更新

```bash
cd /www/wwwroot/angel-crm && unset ALL_PROXY http_proxy https_proxy && bash update.sh
```

### 更新失败后重置

```bash
cd /www/wwwroot/angel-crm && unset ALL_PROXY http_proxy https_proxy && git fetch origin main && git reset --hard origin/main && bash start.sh
```
