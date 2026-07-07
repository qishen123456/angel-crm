const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3101'

const results = []

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json') ? await response.json() : await response.text()
  return { response, body }
}

function expect(name, condition, details = '') {
  results.push({ name, ok: Boolean(condition), details })
}

async function login(email, password = 'demo2026') {
  const { response, body } = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    throw new Error(`Login failed for ${email}: ${response.status} ${JSON.stringify(body)}`)
  }
  return body
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

async function main() {
  const health = await request('/api/health')
  expect('health endpoint returns ok', health.response.status === 200 && health.body.status === 'ok')

  const badLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@angel.cn', password: 'wrong-password' }),
  })
  expect('bad password is rejected', badLogin.response.status === 401)

  const admin = await login('admin@angel.cn')
  const sales = await login('yangwen@angel.cn')
  const finance = await login('finance@angel.cn')
  const marketing = await login('olivia@angel.cn')
  const supply = await login('supply@angel.cn')
  const operations = await login('install@angel.cn')

  expect('admin login returns permissions', Array.isArray(admin.user.permissions) && admin.user.permissions.includes('system:migration:export'))
  expect('sales login returns scoped role', sales.user.role === 'Sales' && sales.user.market === 'SG')

  const exportNoToken = await request('/api/data/export')
  expect('migration export requires login', exportNoToken.response.status === 401)

  const exportAsSales = await request('/api/data/export', { headers: authHeaders(sales.token) })
  expect('migration export rejects sales', exportAsSales.response.status === 403)

  const exportAsAdmin = await request('/api/data/export', { headers: authHeaders(admin.token) })
  expect('migration export allows admin', exportAsAdmin.response.status === 200 && exportAsAdmin.body.type === 'angel-crm-migration')

  const adminAccounts = await request('/api/accounts', { headers: authHeaders(admin.token) })
  const salesAccounts = await request('/api/accounts', { headers: authHeaders(sales.token) })
  expect(
    'sales account list is scoped',
    adminAccounts.response.status === 200 &&
      salesAccounts.response.status === 200 &&
      salesAccounts.body.data.length > 0 &&
      salesAccounts.body.data.length < adminAccounts.body.data.length,
    `admin=${adminAccounts.body.data?.length}, sales=${salesAccounts.body.data?.length}`,
  )

  const salesDelete = await request('/api/accounts/a1', {
    method: 'DELETE',
    headers: authHeaders(sales.token),
  })
  expect('sales cannot delete account', salesDelete.response.status === 403)

  const financeLeadCreate = await request('/api/leads', {
    method: 'POST',
    headers: authHeaders(finance.token),
    body: JSON.stringify({
      name: 'Smoke Finance Lead',
      companyName: 'Smoke Finance Co',
      email: 'finance-smoke@example.com',
      status: 'new',
      source: 'website',
      ownerId: finance.user.id,
    }),
  })
  expect('finance cannot create lead', financeLeadCreate.response.status === 403)

  const salesLeadCreate = await request('/api/leads', {
    method: 'POST',
    headers: authHeaders(sales.token),
    body: JSON.stringify({
      name: 'Smoke Sales Lead',
      companyName: 'Smoke Sales Co',
      email: 'sales-smoke@example.com',
      status: 'new',
      source: 'website',
      ownerId: sales.user.id,
    }),
  })
  expect('sales can create lead', salesLeadCreate.response.status === 201 && salesLeadCreate.body.data?.id)

  const auditLogs = await request('/api/auditLogs', { headers: authHeaders(admin.token) })
  expect(
    'write operations create audit logs',
    auditLogs.response.status === 200 && auditLogs.body.data.some((item) => item.action === 'leads.create'),
  )

  const productCreate = await request('/api/products', {
    method: 'POST',
    headers: authHeaders(supply.token),
    body: JSON.stringify({
      sku: `SMOKE-${Date.now()}`,
      name: 'Smoke Test Product',
      category: 'commercial',
      line: 'commercial',
      spec: 'Smoke spec',
      unitPrice: 100,
      leadTime: '1 week',
      stock: 1,
      status: 'onSale',
    }),
  })
  expect('supply chain can create product', productCreate.response.status === 201 && productCreate.body.data?.id)

  const projectUpdateCreate = await request('/api/projectUpdates', {
    method: 'POST',
    headers: authHeaders(operations.token),
    body: JSON.stringify({
      accountId: 'a4',
      postedById: operations.user.id,
      stage: 'install',
      summary: 'Smoke project update',
      unitsInstalled: 1,
      createdAt: new Date().toISOString().slice(0, 10),
    }),
  })
  expect('operations can create project update', projectUpdateCreate.response.status === 201 && projectUpdateCreate.body.data?.id)

  const retailCreate = await request('/api/retailMonthly', {
    method: 'POST',
    headers: authHeaders(marketing.token),
    body: JSON.stringify({
      month: `2099-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`,
      soUnits: 1,
      strategicUnits: 1,
      netStoreAdds: 1,
      sellThroughRate: 1,
      events: 1,
      notes: 'Smoke retail monthly',
    }),
  })
  expect('marketing can create retail monthly record', retailCreate.response.status === 201 && retailCreate.body.data?.id)

  const invoiceCreate = await request('/api/invoices', {
    method: 'POST',
    headers: authHeaders(finance.token),
    body: JSON.stringify({
      no: `INV-SMOKE-${Date.now()}`,
      orderId: 'ord-2',
      accountId: 'a1',
      amountUsd: 100,
      status: 'pending_review',
      applicantId: finance.user.id,
      title: 'Smoke Invoice',
      taxId: 'SMOKE-TAX',
      createdAt: new Date().toISOString().slice(0, 10),
    }),
  })
  expect('finance can create invoice', invoiceCreate.response.status === 201 && invoiceCreate.body.data?.id)

  const attendanceCreate = await request('/api/attendanceRecords', {
    method: 'POST',
    headers: authHeaders(sales.token),
    body: JSON.stringify({
      userId: sales.user.id,
      type: 'in',
      time: '2099-01-01 09:00',
      location: 'Smoke Office',
      note: 'Smoke punch',
    }),
  })
  expect('sales can create attendance record', attendanceCreate.response.status === 201 && attendanceCreate.body.data?.id)

  const poolClaim = await request('/api/accounts/a9', {
    method: 'PATCH',
    headers: authHeaders(sales.token),
    body: JSON.stringify({ ownerId: sales.user.id }),
  })
  expect('sales can claim pool account', poolClaim.response.status === 200 && poolClaim.body.data?.ownerId === sales.user.id)

  const orderAdvance = await request('/api/orders/ord-3', {
    method: 'PATCH',
    headers: authHeaders(supply.token),
    body: JSON.stringify({ status: 'piIssued' }),
  })
  expect('supply chain can advance order status', orderAdvance.response.status === 200 && orderAdvance.body.data?.status === 'piIssued')

  const failed = results.filter((item) => !item.ok)
  for (const item of results) {
    const icon = item.ok ? 'PASS' : 'FAIL'
    console.log(`${icon} ${item.name}${item.details ? ` (${item.details})` : ''}`)
  }

  if (failed.length > 0) {
    console.error(`\n${failed.length} smoke test(s) failed.`)
    process.exit(1)
  }

  console.log(`\n${results.length} smoke tests passed.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
