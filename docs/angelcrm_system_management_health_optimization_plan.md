# AngelCRM 系统管理与前后端健康度全面优化计划

更新时间：2026-07-07

## 1. 结论摘要

当前 AngelCRM 已经具备可运行的前后端雏形，前端页面覆盖较完整，后端也有统一 JSON 存储和通用 CRUD API；本地检查中，`backend npm run build` 与 `frontend npm run build` 均可通过。

但从生产可用 CRM 的标准看，现在仍处于“演示系统 / 原型后端”阶段，核心短板集中在四类：

1. 系统管理权限没有闭环：只有登录校验，缺少“超管 / 角色 / 数据范围 / 操作权限”的后端强校验。
2. 数据迁移包属于高危能力：`/api/data/export` 与 `/api/data/import` 当前未接入认证与超管校验，必须立即收口。
3. 大量管理功能仍是静态展示：设置、团队、邀请、导入、通知、角色权限等页面没有完整后端能力承接。
4. 后端领域能力不足：通用 CRUD 没有业务校验、审计、流程状态机、权限策略、数据一致性和测试保障。

建议先做“权限与数据安全止血”，再推进“真实系统管理后台”，最后完成“CRM 业务后端化和数据库化”。

## 2. 当前架构画像

### 2.1 前端

- 技术栈：React + TypeScript + Vite + Ant Design + Zustand。
- 登录态：JWT 存储在 `localStorage`，请求由 `frontend/src/api/client.ts` 注入 Authorization。
- 数据访问：`frontend/src/services/storageService.ts` 已封装 API 仓储。
- 状态管理：`frontend/src/store/useDataStore.ts` 启动时并发拉取主要业务表。
- 页面现状：
  - 客户、线索、商机、订单、合同、付款等页面已有部分真实 create/update/delete 调用。
  - 报表、工作队列、国家报表、产品、团队、设置中的许多数据仍直接来自 `frontend/src/mocks/crmData.ts`。
  - 路由保护只判断是否登录，不判断角色权限。

### 2.2 后端

- 技术栈：Express 5 + TypeScript + JWT + JSON file store。
- API 结构：
  - `/api/auth/login`、`/api/auth/me`
  - `/api/data/export`、`/api/data/import`
  - `/api/:entity` 通用 CRUD：users、accounts、contacts、leads、opportunities、orders、contracts、payments 等。
- 数据存储：`backend/src/data/jsonStore.ts` 按实体读写 JSON 文件，单文件写入有 mutex。
- 数据模型：`backend/src/data/seedData.ts` 定义当前 demo 实体；`backend/docs/schema.sql` 已有 PostgreSQL 方向的完整 schema 草案。

### 2.3 部署

- Docker Compose 包含 frontend、backend 两个服务。
- 后端持久化为 Docker volume：`angel-crm-data:/app/data`。
- 前端 Nginx 将 `/api/` 反代到 backend。
- `start.sh` 与 `update.sh` 可一键部署 / 更新，但当前更新脚本依赖未鉴权的数据导入导出接口。

## 3. 高风险问题清单

| 优先级 | 问题 | 现状 | 风险 | 处理策略 |
| --- | --- | --- | --- | --- |
| P0 | 数据迁移接口未鉴权 | `/api/data/export`、`/api/data/import` 未使用 `authMiddleware` | 任意访问者可导出或覆盖全量数据 | 立即加登录校验 + 超管校验 + 审计 |
| P0 | 通用 CRUD 只校验登录 | `createGenericRouter` 没有角色和数据范围判断 | 普通用户可改用户、财务、合同等敏感数据 | 建立权限矩阵和实体级策略 |
| P0 | 固定演示密码 | 所有用户只用 `demo2026` 登录 | 账号不可控，离职 / 分权 / 密码安全都无法实现 | 引入密码哈希与用户密码字段 |
| P0 | JWT 默认密钥 | 默认 `angel-crm-dev-secret-change-me` 或 compose 默认值 | token 可被伪造 | 生产启动必须校验强 `JWT_SECRET` |
| P1 | 设置页大多不可保存 | 角色、部门、通知、账号设置等为静态 UI | 管理后台形同虚设 | 逐项补 API 与持久化 |
| P1 | 前端权限只靠菜单/UI | `ProtectedRoute` 只判断登录 | 用户可直接访问 URL | 前后端双层权限，但以后端为准 |
| P1 | 缺少审计闭环 | `auditLogs` 是 seed 数据，没有自动记录 | 无法追责导入、删除、改合同等高危动作 | 写操作统一审计 |
| P1 | JSON 存储缺少数据约束 | 无外键、无唯一约束、无事务 | 数据容易脏、丢、错连 | 短期 zod 校验，长期 PostgreSQL |
| P2 | 无测试 | 仓库无业务测试文件 | 更新靠手测，回归风险高 | 加后端 API 测试和前端关键流 E2E |
| P2 | 报表仍读 mock | WorkQueue、Report、CountryReports 等混用静态数据 | 页面数字与真实后端不一致 | 报表 API 后端聚合 |

## 4. 系统管理权限设计

### 4.1 角色建议

当前代码中只有 `Admin`、`Sales`、`Finance`、`Supply Chain`、`Orders`、`Legal`、`Marketing`、`Executive`、`Operations`。建议升级为两层模型：

1. 系统内置角色：
   - `SuperAdmin`：系统级超管，唯一拥有迁移包、角色权限、组织结构、系统参数、账号重置等能力。
   - `Admin`：业务管理员，可管用户与部分基础资料，但不能导入覆盖全量数据。
   - `Executive`：只读全局经营数据与报表。
   - `CountryManager`：可管理授权市场的数据。
   - `SalesManager`：可管理团队和客户。
   - `Sales`：只能维护本人或被授权客户。
   - `Finance`：付款、发票、收款状态。
   - `Legal`：合同审核和合同模板。
   - `SupplyChain`：订单履约、发货、库存相关字段。
   - `Marketing`：市场活动、线索。
   - `Operations`：安装、项目更新、服务跟进。
   - `ReadOnly`：只读查看。

2. 能力权限：
   - `system.settings.manage`
   - `system.roles.manage`
   - `system.users.manage`
   - `system.migration.export`
   - `system.migration.import`
   - `audit.read`
   - `accounts.read/write/delete/assign`
   - `contracts.read/write/approve`
   - `orders.read/write/ship`
   - `payments.read/write/confirm`
   - `reports.global.read`
   - `reports.market.read`

角色只是默认权限包，最终以后端能力权限为准。

### 4.2 超管专属能力

以下能力必须只允许 `SuperAdmin`：

- 导出完整迁移包。
- 导入迁移包并覆盖数据。
- 重置系统数据、清空数据、恢复备份。
- 管理角色权限矩阵。
- 修改组织结构、市场范围、全局系统参数。
- 停用 / 删除用户。
- 重置其他用户密码。
- 查看完整审计日志。
- 生成长期 API token 或系统集成密钥。

### 4.3 数据范围

除超管外，所有角色都应带数据范围：

- `global`：全局，仅 Executive/SuperAdmin 可用。
- `market`：指定市场，如 SG、TH、US。
- `department`：本部门。
- `team`：本人及下属。
- `owner`：本人负责的数据。

后端每次读写都需要把 `req.user` 转换成 `PermissionContext`，再执行过滤或拒绝。

## 5. 后端优化计划

### 阶段 0：安全止血，1 天内完成

目标：先堵住全量数据外泄与误覆盖风险。

任务：

- 给 `backend/src/routes/data.ts` 所有接口加 `authMiddleware`。
- 新增 `requireRole(['SuperAdmin'])` 或 `requirePermission('system.migration.export/import')`。
- 前端 `SettingsPage` 导入导出改用 `apiClient`，确保带 token。
- 菜单和路由临时隐藏非超管的 Settings / Import / Invite / Team 管理入口。
- `update.sh` 改为使用一次性维护 token，或改成容器内文件级备份，不再调用裸奔 API。
- 迁移包导入前校验：
  - `version`
  - `exportedAt`
  - `data`
  - entity 白名单
  - 数组类型
  - 可选 checksum
- 写入审计日志：谁、何时、从哪个 IP、导出/导入了什么版本。

验收：

- 未登录访问 `/api/data/export` 返回 401。
- 非超管访问返回 403。
- 超管访问成功并生成 audit log。
- 前端普通用户看不到迁移包入口，直接访问也会被拦截。

### 阶段 1：权限中间件与基础安全，2-4 天

目标：把“登录”升级为“认证 + 授权 + 数据范围”。

任务：

- 新增 `backend/src/middleware/permission.ts`：
  - `requireAuth`
  - `requireRole`
  - `requirePermission`
  - `requireEntityAccess(entity, action)`
- JWT payload 增加：
  - `role`
  - `permissions`
  - `marketScopes`
  - `department`
  - `managerId`
- 登录后返回 `claims`，前端根据 claims 控制菜单和按钮。
- 引入密码哈希：
  - 用户数据增加 `passwordHash`
  - 默认管理员首次启动时从环境变量初始化密码
  - 移除所有用户共用 `demo2026` 的生产逻辑
- 生产环境强制要求：
  - `JWT_SECRET` 长度不低于 32
  - `ADMIN_INITIAL_PASSWORD` 必填或已存在管理员
- 增加登录失败限流和统一错误响应。

验收：

- Sales 不能访问 `/api/users` 写接口。
- Finance 不能删除客户。
- SupplyChain 不能确认收款。
- 所有高危失败请求都返回 403 并记录审计。

### 阶段 2：替换通用 CRUD 为领域 API，1-2 周

目标：CRM 不是表格编辑器，必须把业务规则放到后端。

建议拆分：

- `accounts`
  - 创建客户、编辑客户、分配 owner、回收公海、领取公海。
  - 校验客户 code 唯一、owner 存在、market 合法。
- `leads`
  - 线索创建、评分、转客户、转商机、标记丢失。
  - 转化动作要一次性创建 account/contact/opportunity，并审计。
- `opportunities`
  - 阶段推进、赢单、输单、预计金额、预计关闭日期。
  - 阶段状态机防止乱跳。
- `contracts`
  - 合同创建、法务审核、到期提醒、关联商机和客户。
- `orders`
  - 下单、PI、PO、发货、报关、完成。
  - 订单金额从 order items 聚合。
- `payments`
  - 收款计划、确认收款、逾期提醒。
  - Finance 专属确认动作。
- `settings`
  - markets、departments、roles、targets、templates、notifications。
- `audit`
  - 分页查询、筛选、导出。

技术要求：

- 所有写接口用 zod schema 校验。
- 所有写接口统一补 `createdAt`、`updatedAt`、`createdBy`、`updatedBy`。
- 删除优先软删除，避免误删业务链路。
- API 返回分页结构：`{ data, page, pageSize, total }`。
- 所有列表支持后端查询、排序、分页，不再全量拉取。

### 阶段 3：数据库化，1-3 周

目标：从 JSON 文件存储升级为真正可运营的数据层。

当前 `backend/docs/schema.sql` 已经有 PostgreSQL 设计方向，应继续复用并落地。

任务：

- 引入 PostgreSQL 与 ORM / 查询层：
  - 可选：Prisma、Drizzle、Kysely。
  - 建议优先 Prisma：迁移、类型、开发效率更适合当前阶段。
- 把 JSON seed 数据迁移成数据库 seed。
- 实现 JSON 迁移包到 PostgreSQL 的 importer。
- 增加数据库备份策略：
  - 每日自动备份。
  - 更新前自动备份。
  - 保留最近 N 份。
  - 支持从备份恢复到临时库预检。
- 对关键字段加约束：
  - email unique
  - account code unique
  - contract no unique
  - order number unique
  - 外键关系
  - enum / check constraints

验收：

- 容器重启数据不丢。
- 多用户并发写入不互相覆盖。
- 数据链路断裂会被数据库拒绝。
- 迁移包可以导出、导入、校验、回滚。

## 6. 前端优化计划

### 6.1 权限前端化，但不替代后端

任务：

- 新增 `frontend/src/auth/permissions.ts`：
  - `can(permission)`
  - `canAny(permissions)`
  - `canRoute(path)`
- `ProtectedRoute` 升级为：
  - 未登录跳登录。
  - 登录但无权限显示 403 页面。
- `AppLayout` 菜单按后端 claims 过滤。
- 所有按钮级动作按权限显示 / 禁用：
  - 删除客户
  - 导入迁移包
  - 邀请用户
  - 确认收款
  - 合同审批
  - 角色编辑

### 6.2 移除页面级 mock 依赖

优先级：

1. SettingsPage：角色、部门、市场、目标、模板、通知、审计、账号资料。
2. TeamPage：用户列表、停用、重置密码、分配角色。
3. InvitePage：真实创建用户 / 邀请链接。
4. ImportPage：改为受控的系统迁移 / 批量导入中心，权限限制到超管或业务管理员。
5. Reports：WorkQueue、CountryReports、ExecutiveReport、Dashboard 改为后端聚合 API。
6. Products、Retail、Pool、ProjectUpdates：接入真实 store。

### 6.3 数据请求体验

任务：

- 把 `useDataStore.load()` 的全量并发拉取改为页面按需拉取。
- 列表页支持：
  - loading skeleton
  - error retry
  - empty state
  - pagination
  - search debounce
  - server-side filter
- 所有写入后刷新当前查询，不只是在 zustand 本地 append。
- 引入统一错误提示：
  - 401：跳登录
  - 403：无权限
  - 409：唯一冲突
  - 422：表单校验失败
  - 500：服务异常

### 6.4 系统管理页面重做

建议 Settings 拆成真正的系统管理模块：

- `/app/admin/users`
- `/app/admin/roles`
- `/app/admin/markets`
- `/app/admin/departments`
- `/app/admin/targets`
- `/app/admin/templates`
- `/app/admin/notifications`
- `/app/admin/audit`
- `/app/admin/migration`
- `/app/account-settings`

这样可以避免“所有高危功能都塞在 Settings 一个页面里”，权限也更清晰。

## 7. 数据迁移包设计

迁移包不是 CSV，也不只是 JSON dump。建议定义为带元信息、校验和、版本兼容、可预检的系统备份包。

### 7.1 格式

```json
{
  "type": "angel-crm-migration",
  "version": "1.0.0",
  "appVersion": "2026.07.07",
  "exportedAt": "2026-07-07T10:30:00.000Z",
  "exportedBy": {
    "id": "u1",
    "email": "admin@angel.cn"
  },
  "checksum": "sha256:...",
  "entities": {
    "users": { "count": 12 },
    "accounts": { "count": 10 }
  },
  "data": {}
}
```

### 7.2 导入流程

1. 上传文件。
2. 前端调用 `/api/admin/migration/validate`。
3. 后端只做预检，不写入：
   - 文件类型。
   - 版本兼容。
   - checksum。
   - entity 白名单。
   - schema 校验。
   - 影响统计。
4. 前端展示影响范围。
5. 超管输入确认短语，如 `CONFIRM IMPORT`。
6. 后端先自动创建当前数据备份。
7. 后端执行导入。
8. 写审计日志。
9. 返回导入报告。

### 7.3 更新脚本策略

短期：

- `update.sh` 不应再调用无认证导入导出接口。
- 可以在容器运行时通过 `docker cp` 或 volume 路径备份 `/app/data`。

长期：

- 提供 CLI：
  - `npm run backup`
  - `npm run restore -- backup-file`
  - `npm run migrate`
- 服务端 API 迁移只给超管在 UI 使用。

## 8. 测试与质量保障

### 8.1 后端测试

最低覆盖：

- auth：
  - 登录成功 / 失败。
  - token 缺失 / 过期 / 伪造。
- permission：
  - SuperAdmin 可以导入导出。
  - Sales 不能导入导出。
  - Finance 只能写 payments 相关字段。
- domain：
  - lead 转化。
  - opportunity 阶段推进。
  - order 状态流转。
  - payment 确认。
- audit：
  - 每个写操作都有审计。
- migration：
  - 导出结构正确。
  - 导入前校验失败不会写入。
  - 导入成功可恢复完整数据。

推荐工具：

- Vitest 或 Node test runner。
- Supertest 做 Express API 测试。
- 临时 DATA_DIR 或测试数据库隔离数据。

### 8.2 前端测试

最低覆盖：

- 登录和退出。
- 无权限访问 admin 页面展示 403。
- 超管可看到迁移包，普通用户不可见。
- 创建客户、创建商机、创建订单。
- 表单校验错误展示。
- 后端 403 时提示无权限。

推荐工具：

- Playwright 做 E2E。
- React Testing Library 做关键组件。

### 8.3 CI

每次提交必须跑：

```bash
cd backend && npm run build
cd frontend && npm run build
```

补充脚本：

- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- Docker build smoke test。

## 9. 运维与部署健康度

### 9.1 环境变量

生产必填：

- `JWT_SECRET`
- `ADMIN_INITIAL_EMAIL`
- `ADMIN_INITIAL_PASSWORD`
- `CLIENT_URL`
- `DATABASE_URL`，数据库化后
- `BACKUP_DIR`

生产禁止：

- 使用默认 JWT secret。
- 使用统一演示密码。
- 在 README 中暴露生产默认账号密码。

### 9.2 健康检查

当前 `/health` 只返回服务存活。建议扩展：

- `/health/live`：进程存活。
- `/health/ready`：数据目录 / 数据库可写、依赖可用。
- `/api/admin/system/status`：仅超管可看：
  - app version
  - build time
  - database status
  - data volume usage
  - latest backup
  - failed jobs

### 9.3 日志

后端应输出结构化日志：

- request id
- user id
- role
- method
- path
- status
- latency
- ip

高危操作必须写业务审计，不只写 stdout。

## 10. 推荐实施排期

### 第 1 周：安全与管理后台骨架

- P0 数据迁移接口鉴权。
- 超管角色与 permission claims。
- 菜单 / 路由 / 按钮权限。
- 用户管理 API 第一版。
- 审计日志自动记录。
- 更新脚本改为安全备份策略。

### 第 2 周：系统管理真实落地

- 角色权限管理。
- 市场 / 部门 / 年度目标管理。
- 模板与通知设置持久化。
- 账号资料和密码修改。
- Settings 拆分为 admin 子页面。

### 第 3-4 周：业务后端化

- 替换通用 CRUD 的高风险模块：
  - users
  - accounts
  - leads
  - opportunities
  - contracts
  - orders
  - payments
- 后端 zod 校验。
- 分页、搜索、筛选。
- 业务状态机和审计。

### 第 5-6 周：数据库化与测试

- PostgreSQL + migration。
- JSON 数据迁移。
- 备份恢复。
- 后端 API 测试。
- Playwright E2E。
- CI。

## 11. 交付验收清单

### 权限

- [ ] 未登录不能访问任何业务 API。
- [ ] 非超管不能访问迁移包接口。
- [ ] 普通用户不能通过 URL 进入 admin 页面。
- [ ] 每个写操作都有后端权限判断。
- [ ] 关键实体按市场 / owner / team 过滤数据。

### 系统管理

- [ ] 用户可创建、停用、重置密码、分配角色。
- [ ] 角色权限矩阵可保存并立即生效。
- [ ] 市场、部门、年度目标可维护。
- [ ] 文档模板、通知设置可维护。
- [ ] 审计日志可筛选、分页、导出。

### 数据

- [ ] 迁移包可导出、预检、导入、审计。
- [ ] 导入前自动备份。
- [ ] 导入失败不污染现有数据。
- [ ] 更新脚本不依赖未授权 API。
- [ ] 数据库有外键和唯一约束。

### 前端

- [ ] 页面不再直接依赖 mock 数据做业务展示。
- [ ] 列表支持服务端分页和筛选。
- [ ] 写入失败有明确错误提示。
- [ ] 403 有专门页面。
- [ ] 关键流程 E2E 通过。

### 后端

- [ ] 所有写接口有 schema 校验。
- [ ] 所有高危接口有审计。
- [ ] build、test、Docker build 均通过。
- [ ] health ready 能检测数据层。
- [ ] 生产默认密钥检查生效。

## 12. 优先修改文件建议

第一批：

- `backend/src/middleware/auth.ts`
- `backend/src/middleware/permission.ts`
- `backend/src/routes/data.ts`
- `backend/src/routes/auth.ts`
- `backend/src/routes/generic.ts`
- `frontend/src/api/client.ts`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/layouts/AppLayout.tsx`
- `frontend/src/pages/SettingsPage.tsx`
- `update.sh`

第二批：

- `backend/src/routes/users.ts`
- `backend/src/routes/admin.ts`
- `backend/src/routes/audit.ts`
- `backend/src/routes/migration.ts`
- `backend/src/services/auditService.ts`
- `backend/src/services/permissionService.ts`
- `frontend/src/pages/AdminUsersPage.tsx`
- `frontend/src/pages/AdminRolesPage.tsx`
- `frontend/src/pages/AdminMigrationPage.tsx`

第三批：

- PostgreSQL schema / migrations。
- 业务领域 routes 和 services。
- 测试目录。

## 13. 健康度评分

这是基于当前代码阅读和构建检查的工程判断，分数用于排优先级，不是最终质量评价。

| 维度 | 当前评分 | 判断 |
| --- | ---: | --- |
| 可运行性 | 75/100 | 前后端 build 通过，Docker 结构完整 |
| 前端完整度 | 55/100 | 页面覆盖较多，但 mock 和静态管理功能偏多 |
| 后端完整度 | 35/100 | 有通用 CRUD，但缺领域规则、权限、校验、审计 |
| 权限安全 | 20/100 | 登录有了，但授权几乎没有，迁移接口高危 |
| 数据可靠性 | 30/100 | JSON 文件适合原型，不适合多人生产 CRM |
| 运维可靠性 | 45/100 | 有脚本和 health，但备份/密钥/更新安全需要重做 |
| 测试保障 | 10/100 | 暂未发现业务测试 |

## 14. 下一步建议

建议立即启动 P0 修复：

1. 定义 `SuperAdmin` 与权限 claims。
2. 保护 `/api/data/export` 和 `/api/data/import`。
3. 前端迁移包入口只给超管。
4. 更新脚本改为安全备份。
5. 建立审计日志写入。

这一步完成后，再开始重做 Settings / Team / Invite 等系统管理功能。否则继续堆 UI，会把风险越堆越高。
