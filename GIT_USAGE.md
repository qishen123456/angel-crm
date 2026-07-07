# AngelCRM Git 使用说明

## 仓库信息

- GitHub 仓库：`https://github.com/qishen123456/angel-crm.git`
- 本地目录：`/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm`
- 默认分支：`main`

## 进入项目目录

```bash
cd "/Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm"
```

## 常用推送命令

先看改了什么：

```bash
git status
```

推送全部改动：

```bash
git add .
git commit -m "feat: 本次修改说明"
git push origin main
```

只推送指定文件：

```bash
git add backend/src frontend/src docs
git commit -m "feat: 本次修改说明"
git push origin main
```

## 推送前先同步远程

如果远程也有人改过，建议先执行：

```bash
git pull --rebase origin main
```

如果你已经提交了本地代码，推荐顺序：

```bash
git status
git add .
git commit -m "feat: 本次修改说明"
git pull --rebase origin main
git push origin main
```

## 查看远程地址

```bash
git remote -v
```

当前 `origin`：

```bash
origin  https://github.com/qishen123456/angel-crm.git
```

## 补充

- 如果提示 `nothing to commit`，说明当前没有新的文件改动。
- 如果推送时报认证问题，先确认本机 GitHub 账号已登录。
- 更完整的本地启动、更新、推送流程，请看 `docs/angelcrm_local_push_and_start.md`。
