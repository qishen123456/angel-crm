# AngelCRM 项目说明书

更新时间：2026-07-07

## 1. 项目定位

AngelCRM 是面向海外市场销售运营的 CRM 系统，目标不是简单客户通讯录，而是覆盖：

- 客户与联系人管理
- 市场活动与线索
- 销售商机
- 合同
- 订单
- 收款
- 项目更新
- 国家 / 高管报表
- 系统管理、审计、数据迁移

当前项目已经具备可运行的前后端原型，并正在从 demo 系统向生产系统改造。

## 2. 技术架构

### 2.1 前端

- React
- TypeScript
- Vite
- Ant Design
- Zustand
- Axios

主要目录：

- `frontend/src/app`：路由入口。
- `frontend/src/layouts`：主布局、侧边栏、顶部操作。
- `frontend/src/pages`：业务页面。
- `frontend/src/store`：登录态和业务数据状态。
- `frontend/src/services/storageService.ts`：前端 API 仓储封装。
- `frontend/src/auth/permissions.ts`：前端权限判断。
- `frontend/src/mocks/crmData.ts`：当前仍保留类型和部分 demo 数据来源。

### 2.2 后端

- Node.js
- Express
- TypeScript
- JWT
- JSON 文件持久化

主要目录：

- `backend/src/server.ts`：服务入口和路由挂载。
- `backend/src/routes/auth.ts`：登录与当前用户。
- `backend/src/routes/generic.ts`：通用实体 CRUD。
- `backend/src/routes/data.ts`：迁移包导入导出。
- `backend/src/middleware/auth.ts`：认证与超管判断。
- `backend/src/middleware/permission.ts`：角色与实体权限矩阵。
- `backend/src/services/auditService.ts`：写操作审计。
- `backend/src/services/scopeService.ts`：读数据范围过滤。
- `backend/src/data/jsonStore.ts`：JSON 文件读写。
- `backend/src/data/seedData.ts`：种子数据和类型定义。

### 2.3 部署

- Docker Compose 启动前端 Nginx 和后端服务。
- 后端数据默认保存在 Docker volume `angel-crm-data:/app/data`。
- 前端 Nginx 将 `/api/` 代理到后端。

## 3. 当前权限模型

### 3.1 登录

当前仍使用 demo 密码：

- 邮箱：`admin@angel.cn`
- 密码：`demo2026`

其他 seed 用户也临时共用 `demo2026`。这只是过渡状态，后续必须改为独立密码哈希。

### 3.2 角色

当前支持角色：

- `SuperAdmin`
- `Admin`
- `Sales`
- `Finance`
- `Supply Chain`
- `Orders`
- `Legal`
- `Marketing`
- `Executive`
- `Operations`

当前兼容规则：

- `Admin` 暂时等同超管，避免旧管理员账号被锁出。
- 后续建议正式拆分 `SuperAdmin` 与 `Admin`。

### 3.3 写权限

后端已经接入实体级写权限：

- `Admin/SuperAdmin`：所有实体写入、删除、迁移包。
- `Sales`：客户、联系人、线索、商机、活动、终端用户、日报。
- `Marketing`：活动、线索、活动记录、日报。
- `Finance`：收款、日报。
- `Legal`：合同、文档模板、日报。
- `Orders`：订单、项目更新、日报。
- `Supply Chain`：订单、项目更新、产品、日报。
- `Operations`：项目更新、活动、终端用户、日报。
- `Executive`：只读。

删除目前只允许 `Admin/SuperAdmin`。

### 3.4 读范围

当前读范围策略：

- `Admin/SuperAdmin/Executive`：全局可读。
- 普通角色：
  - 客户按 `ownerId`、`market`、未分配客户过滤。
  - 联系人、商机、订单、合同、付款、活动、终端用户、项目更新按可见客户链路过滤。
  - 用户、产品、通知、模板、日报暂时作为公共引用数据保留全量读。

## 4. 当前已修复的关键问题

### 4.1 数据迁移包安全

已修复：

- `/api/data/export` 需要登录。
- `/api/data/export` 需要超管。
- `/api/data/import` 需要登录。
- `/api/data/import` 需要超管。
- 导入会校验未知实体和数组格式。
- 导入导出会写审计日志。

### 4.2 更新脚本安全

`update.sh` 已改为通过 `docker cp` 备份 / 恢复 `/app/data`，不再依赖裸 API 导入导出。

### 4.3 前端管理入口

已修复：

- 非超管隐藏系统管理入口。
- 非超管访问管理路由显示 403。
- 顶部“新建”菜单按创建权限过滤。

### 4.4 写操作审计

通用 CRUD 写操作已写入 `auditLogs`：

- create
- update
- replace
- delete

## 5. 仍然缺失的关键能力

### 5.1 独立账号密码

当前最大生产化缺口。必须实现：

- `passwordHash`
- 修改密码
- 重置密码
- 首次登录强制改密
- 停用用户后 token 失效
- 登录失败限流

### 5.2 真实系统管理后台

设置页仍有大量静态内容。建议拆成：

- 用户管理
- 角色权限
- 市场部门
- 年度目标
- 文档模板
- 通知策略
- 审计日志
- 数据迁移
- 个人账号设置

### 5.3 业务领域 API

当前很多流程仍是通用 CRUD，需要改成领域动作：

- 线索转化
- 商机推进
- 合同审批
- 订单履约
- 收款确认
- 客户归档

### 5.4 数据库

JSON 文件存储适合原型，不适合长期多人使用。建议后续升级 PostgreSQL。

## 6. 本地启动

### 6.1 Docker 启动

```bash
cd /Users/ltq/Desktop/ambitious/4.Lin_project/2.CRM系统/11.海外CRM/crm
bash start.sh
```

访问：

- 前端：`http://localhost:8888`
- 后端：`http://localhost:3001`

### 6.2 本地开发启动

后端：

```bash
cd backend
npm install
npm run dev
```

前端：

```bash
cd frontend
npm install
npm run dev
```

## 7. 构建验证

后端：

```bash
cd backend
npm run build
```

前端：

```bash
cd frontend
npm run build
```

脚本语法：

```bash
bash -n update.sh
```

## 8. 功能冒烟测试

项目新增了测试脚本：

```bash
node scripts/smoke-test.mjs
```

默认测试地址为：

```bash
http://127.0.0.1:3101
```

如果后端运行在其他地址：

```bash
BASE_URL=http://127.0.0.1:3001 node scripts/smoke-test.mjs
```

测试覆盖：

- 健康检查。
- 错误密码拒绝。
- 管理员登录。
- 销售登录。
- 财务登录。
- 迁移包未登录拒绝。
- 销售导出迁移包拒绝。
- 管理员导出迁移包成功。
- 销售客户列表被数据范围过滤。
- 销售不能删除客户。
- 财务不能创建线索。
- 销售可以创建线索。
- 写入会产生审计日志。
- 供应链可以创建产品。
- 运营可以创建项目更新。
- 市场可以创建零售月报。
- 财务可以创建发票申请。
- 销售可以创建考勤记录。
- 销售可以领取公海客户。
- 供应链可以推进订单状态。

## 9. 推荐上线前检查清单

- [ ] `npm run build` 前后端通过。
- [ ] `scripts/smoke-test.mjs` 通过。
- [ ] 非超管无法访问迁移包接口。
- [ ] 非超管看不到系统管理入口。
- [ ] 普通角色无法删除客户。
- [ ] 写操作产生审计日志。
- [ ] `update.sh` 备份目录正常生成。
- [ ] 服务器 `JWT_SECRET` 已设置为强随机值。

## 10. 下一步优先级

建议优先顺序：

1. 独立密码哈希和用户停用校验。
2. 用户管理页面真实化。
3. 审计日志页面真实读取。
4. 删除改软删除 / 作废。
5. 线索转化改成真实业务流程。
6. PostgreSQL 数据层。
