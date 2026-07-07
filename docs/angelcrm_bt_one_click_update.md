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

1. 备份容器内 `/app/data`
2. 拉取远程最新代码
3. 重建 Docker 容器
4. 恢复数据目录
5. 做健康检查和登录测试

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

## 9. 推荐你以后这样用

### 日常更新

```bash
cd /www/wwwroot/angel-crm && unset ALL_PROXY http_proxy https_proxy && bash update.sh
```

### 更新失败后重置

```bash
cd /www/wwwroot/angel-crm && unset ALL_PROXY http_proxy https_proxy && git fetch origin main && git reset --hard origin/main && bash start.sh
```
