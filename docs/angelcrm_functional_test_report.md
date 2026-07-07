# AngelCRM 功能测试报告

测试时间：2026-07-07

## 1. 测试目标

本次测试目标是验证近期权限、安全和系统管理相关改动是否正常：

- 后端能否正常构建。
- 前端能否正常构建。
- 更新脚本语法是否正常。
- 登录是否正常。
- 迁移包接口是否已受保护。
- 普通角色是否被限制高危操作。
- 销售角色的数据范围是否生效。
- 写操作是否产生审计日志。
- 产品、项目更新、零售、发票、考勤、公海、工作队列是否真实写入后端。

## 2. 测试环境

测试使用临时数据目录，不影响真实数据：

```bash
DATA_DIR=/tmp/angelcrm-smoke-data
PORT=3101
CLIENT_URL=http://localhost:5173
JWT_SECRET=angel-crm-smoke-test-secret-please-change
```

说明：

- 当前执行环境默认禁止监听和连接本地端口，因此启动临时后端和执行 HTTP 冒烟测试时使用了受控的提升权限。
- 测试没有连接生产数据库，也没有改动 Docker volume 真实数据。

## 3. 构建测试

### 3.1 后端构建

命令：

```bash
cd backend
npm run build
```

结果：通过。

### 3.2 前端构建

命令：

```bash
cd frontend
npm run build
```

结果：通过。

### 3.3 更新脚本语法

命令：

```bash
bash -n update.sh
```

结果：通过。

## 4. 功能冒烟测试

测试脚本：

```bash
node scripts/smoke-test.mjs
```

测试地址：

```bash
http://127.0.0.1:3101
```

### 4.1 测试结果

| 编号 | 测试项 | 结果 |
| --- | --- | --- |
| 1 | 健康检查接口返回 ok | 通过 |
| 2 | 错误密码被拒绝 | 通过 |
| 3 | 管理员登录返回权限 claims | 通过 |
| 4 | 销售登录返回正确角色和市场 | 通过 |
| 5 | 未登录访问迁移包导出返回 401 | 通过 |
| 6 | 销售访问迁移包导出返回 403 | 通过 |
| 7 | 管理员访问迁移包导出成功 | 通过 |
| 8 | 销售客户列表被数据范围过滤 | 通过 |
| 9 | 销售不能删除客户 | 通过 |
| 10 | 财务不能创建线索 | 通过 |
| 11 | 销售可以创建线索 | 通过 |
| 12 | 写操作产生审计日志 | 通过 |
| 13 | 供应链可以创建产品 | 通过 |
| 14 | 运营可以创建项目更新 | 通过 |
| 15 | 市场可以创建零售月报 | 通过 |
| 16 | 财务可以创建发票申请 | 通过 |
| 17 | 销售可以创建考勤记录 | 通过 |
| 18 | 销售可以领取公海客户 | 通过 |
| 19 | 供应链可以推进订单状态 | 通过 |

实际输出：

```text
PASS health endpoint returns ok
PASS bad password is rejected
PASS admin login returns permissions
PASS sales login returns scoped role
PASS migration export requires login
PASS migration export rejects sales
PASS migration export allows admin
PASS sales account list is scoped (admin=10, sales=5)
PASS sales cannot delete account
PASS finance cannot create lead
PASS sales can create lead
PASS write operations create audit logs
PASS supply chain can create product
PASS operations can create project update
PASS marketing can create retail monthly record
PASS finance can create invoice
PASS sales can create attendance record
PASS sales can claim pool account
PASS supply chain can advance order status

19 smoke tests passed.
```

## 5. 本次验证结论

当前改动在核心权限链路上是正常的：

- 后端服务可构建。
- 前端应用可构建。
- 迁移包接口不再裸奔。
- 普通业务角色不能执行超管动作。
- 通用 CRUD 写权限已生效。
- 客户列表数据范围已生效。
- 写操作审计已生效。
- 第一批假按钮已改成真实后端写入：产品、项目更新、零售、发票、考勤、公海、工作队列。

## 6. 仍需补充的测试

当前测试是冒烟测试，不等于完整测试。后续建议补充：

- 前端 Playwright E2E：
  - 登录。
  - 非超管看不到系统管理入口。
  - 非超管直接访问系统设置显示 403。
  - 创建客户、创建线索、创建订单流程。
- 后端 API 单元测试：
  - 每个角色对每个实体的读写权限矩阵。
  - 迁移包导入异常格式。
  - 审计日志失败时的行为。
  - 用户停用后 token 失效。
- 数据迁移测试：
  - 导出后再导入。
  - 导入未知表拒绝。
  - 导入非数组数据拒绝。
  - 导入失败不污染原数据。

## 7. 当前最大风险

虽然本轮测试通过，但项目仍有生产化风险：

1. 用户仍共用 demo 密码。
2. JSON 文件存储没有事务和外键。
3. 线索转化等业务流程还不是真领域 API。
4. 部分页面仍使用 mock 数据。
5. 删除还没有全面改成软删除 / 作废。

建议下一阶段优先实现独立密码哈希和用户停用校验。
