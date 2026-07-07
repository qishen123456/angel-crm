export type PageKey =
  | 'today'
  | 'dashboard'
  | 'workqueue'
  | 'attendance'
  | 'campaigns'
  | 'leads'
  | 'retail'
  | 'accounts'
  | 'pool'
  | 'contacts'
  | 'endUsers'
  | 'pipeline'
  | 'logActivity'
  | 'projectUpdates'
  | 'contracts'
  | 'orders'
  | 'invoices'
  | 'payments'
  | 'products'
  | 'countryReports'
  | 'executiveReport'
  | 'import'
  | 'invite'
  | 'team'
  | 'settings'

export const pageTitles: Record<PageKey, string> = {
  today: 'pages.today',
  dashboard: 'pages.dashboard',
  workqueue: 'pages.workqueue',
  attendance: 'pages.attendance',
  campaigns: 'pages.campaigns',
  leads: 'pages.leads',
  retail: 'pages.retail',
  accounts: 'pages.accounts',
  pool: 'pages.pool',
  contacts: 'pages.contacts',
  endUsers: 'pages.endUsers',
  pipeline: 'pages.pipeline',
  logActivity: 'pages.logActivity',
  projectUpdates: 'pages.projectUpdates',
  contracts: 'pages.contracts',
  orders: 'pages.orders',
  invoices: 'pages.invoices',
  payments: 'pages.payments',
  products: 'pages.products',
  countryReports: 'pages.countryReports',
  executiveReport: 'pages.executiveReport',
  import: 'pages.import',
  invite: 'pages.invite',
  team: 'pages.team',
  settings: 'pages.settings',
}

export const accountTabs = [
  'overview',
  'contacts',
  'opportunities',
  'contracts',
  'orders',
  'payments',
  'activities',
  'campaigns',
  'documents',
]

export const settingsTabs = [
  'brand',
  'market',
  'department',
  'roles',
  'targets',
  'templates',
  'notifications',
  'audit',
  'account',
  'data',
]

// ---------------- Entities ----------------

export type MarketCode = 'SG' | 'HK' | 'MY' | 'TH' | 'ID' | 'MO' | 'US'

export const markets: { code: MarketCode; name: string; flag: string }[] = [
  { code: 'SG', name: '新加坡', flag: '🇸🇬' },
  { code: 'HK', name: '中国香港', flag: '🇭🇰' },
  { code: 'MY', name: '马来西亚', flag: '🇲🇾' },
  { code: 'TH', name: '泰国', flag: '🇹🇭' },
  { code: 'ID', name: '印度尼西亚', flag: '🇮🇩' },
  { code: 'MO', name: '中国澳门', flag: '🇲🇴' },
  { code: 'US', name: '美国', flag: '🇺🇸' },
]

export type UserRole =
  | 'SuperAdmin'
  | 'Admin'
  | 'Sales'
  | 'Finance'
  | 'Supply Chain'
  | 'Orders'
  | 'Legal'
  | 'Marketing'
  | 'Executive'
  | 'Operations'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  market?: MarketCode
  avatar: string
  status: 'active' | 'inactive'
  permissions?: string[]
}

export const users: User[] = [
  { id: 'u1', name: '系统管理员', email: 'admin@angel.cn', role: 'Admin', department: 'Admin', market: 'SG', avatar: '管理', status: 'active' },
  { id: 'u2', name: '杨文', email: 'yangwen@angel.cn', role: 'Sales', department: 'Sales', market: 'SG', avatar: '杨文', status: 'active' },
  { id: 'u3', name: '刘世宏', email: 'liush@angel.cn', role: 'Sales', department: 'Sales', market: 'TH', avatar: '世宏', status: 'active' },
  { id: 'u4', name: '杨森', email: 'yangsen@angel.cn', role: 'Sales', department: 'Sales', market: 'HK', avatar: '杨森', status: 'active' },
  { id: 'u5', name: 'Keith Harrington', email: 'keith@angel.cn', role: 'Sales', department: 'Sales', market: 'US', avatar: 'KH', status: 'active' },
  { id: 'u6', name: '苏蓬', email: 'supon@angel.cn', role: 'Sales', department: 'Sales', market: 'TH', avatar: '苏蓬', status: 'active' },
  { id: 'u7', name: 'Olivia Tan', email: 'olivia@angel.cn', role: 'Marketing', department: 'Marketing', market: 'SG', avatar: 'OT', status: 'active' },
  { id: 'u8', name: 'Stephen Liu', email: 'stephen@angel.cn', role: 'Executive', department: 'Executive', market: 'SG', avatar: 'SL', status: 'active' },
  { id: 'u9', name: '张财务', email: 'finance@angel.cn', role: 'Finance', department: 'Finance', market: 'SG', avatar: '财务', status: 'active' },
  { id: 'u10', name: '李法务', email: 'legal@angel.cn', role: 'Legal', department: 'Legal', market: 'SG', avatar: '法务', status: 'active' },
  { id: 'u11', name: '王供应链', email: 'supply@angel.cn', role: 'Supply Chain', department: 'Supply Chain', market: 'SG', avatar: '供应链', status: 'active' },
  { id: 'u12', name: '陈安装', email: 'install@angel.cn', role: 'Operations', department: 'Operations', market: 'TH', avatar: '安装', status: 'active' },
]

export interface Account {
  id: string
  code: string
  name: string
  market: MarketCode
  ownerId: string
  annualTargetUsd: number
  yearToDateUsd: number
  contractStatus: 'active' | 'expiring' | 'expired'
  contractExpiresAt?: string
  businessType: string
  opportunityNotes: string
  customerResources: string
  nextDigDirections: string
  paymentAccount?: {
    bankName: string
    accountNumber: string
    accountHolder: string
    swiftCode: string
    currency: string
  }
}

export const accounts: Account[] = [
  {
    id: 'a1',
    code: 'RAFF',
    name: 'Raffles Hospitality',
    market: 'SG',
    ownerId: 'u2',
    annualTargetUsd: 800000,
    yearToDateUsd: 620000,
    contractStatus: 'active',
    contractExpiresAt: '2026-12-31',
    businessType: 'commercial',
    opportunityNotes: '集团总部正在评估 5 年统一供应商方案。新加坡总部决定后，东南亚 14 家分店有望统一采购。当前在用机型为竞品 Watergen WG-30，客户反馈滤芯成本偏高。',
    customerResources: '集团旗下 14 家五星酒店（SG 5、HK 3、KL 2、BKK 2、JKT 2）；采购总监 Olivia Tan 与我司长期保持合作关系。',
    nextDigDirections: '1. 6 月底前完成集团框架协议初稿\n2. 推进 KL + BKK 分店试点装机\n3. 介绍新一代战略品 AHT-WPU-7000',
    paymentAccount: {
      bankName: 'DBS Bank Ltd',
      accountNumber: '0011-234567-001',
      accountHolder: 'Raffles Hospitality Pte Ltd',
      swiftCode: 'DBSSSGSG',
      currency: 'SGD',
    },
  },
  {
    id: 'a2',
    code: 'MARI',
    name: 'Marina Bay Sands',
    market: 'SG',
    ownerId: 'u2',
    annualTargetUsd: 1200000,
    yearToDateUsd: 540000,
    contractStatus: 'expiring',
    contractExpiresAt: '2026-07-08',
    businessType: 'commercial',
    opportunityNotes: '合同 22 天后到期，客户对当前 12 台机器满意度高（NPS 9/10）。客户透露 2026 Q4 将启动 SkyPark 扩建，需新增 18 台 dispenser。',
    customerResources: '新加坡最大综合度假村；3,000 客房 + 1,200 间会议厅；采购决策链清晰，Olivia（CFO）有最终决策权。',
    nextDigDirections: '1. 续约谈判中，争取 3 年期 + 涨价 5%\n2. SkyPark Phase 2 提前介入设计阶段\n3. 推荐战略品 AHT-WPU-7000 至 VIP 套房',
  },
  {
    id: 'a3',
    code: 'GENT',
    name: 'Genting Group',
    market: 'MY',
    ownerId: 'u2',
    annualTargetUsd: 600000,
    yearToDateUsd: 480000,
    contractStatus: 'active',
    contractExpiresAt: '2026-11-15',
    businessType: 'commercial',
    opportunityNotes: '年度框架谈判中，客户对零售场景也有兴趣。',
    customerResources: '马来西亚云顶集团，度假村 + 赌场 + F&B 多元场景。',
    nextDigDirections: '1. 推进年度框架协议续签\n2. 介绍零售机型进入云顶商场',
  },
  {
    id: 'a4',
    code: 'BANG',
    name: 'Bangkok Mall Group',
    market: 'TH',
    ownerId: 'u3',
    annualTargetUsd: 500000,
    yearToDateUsd: 240000,
    contractStatus: 'active',
    contractExpiresAt: '2026-10-30',
    businessType: 'commercial',
    opportunityNotes: '曼谷购物中心主餐饮层已安装 8 台 D2000，剩余 4 台下周安装。',
    customerResources: '曼谷核心商圈购物中心，F&B 集中。',
    nextDigDirections: '1. 完成剩余 4 台安装\n2. 地下室美食城电气容量问题跟进',
  },
  {
    id: 'a5',
    code: 'SOEK',
    name: 'Soekarno Retail Distribution',
    market: 'ID',
    ownerId: 'u3',
    annualTargetUsd: 400000,
    yearToDateUsd: 110000,
    contractStatus: 'expiring',
    contractExpiresAt: '2026-06-21',
    businessType: 'retail',
    opportunityNotes: '印尼经销商 Q2 备货已发货，准备开斋节促销。',
    customerResources: '雅加达南区主要家电经销商。',
    nextDigDirections: '1. 跟进终端动销\n2. 规划 Q3 返单',
  },
  {
    id: 'a6',
    code: 'HKHO',
    name: 'HK Hospitality Corp',
    market: 'HK',
    ownerId: 'u4',
    annualTargetUsd: 700000,
    yearToDateUsd: 520000,
    contractStatus: 'active',
    contractExpiresAt: '2026-09-15',
    businessType: 'commercial',
    opportunityNotes: '集团总部要求 15% 一次性 discount 作为框架协议条件，涉及 5 年合作金额约 $3.8M。当前权限为 8%，需 CSO 决策。',
    customerResources: '香港酒店集团，旗下 8 家中高端酒店。',
    nextDigDirections: '1. 申请折扣特例审批\n2. 准备 5 年框架协议草案',
  },
  {
    id: 'a7',
    code: 'MGMM',
    name: 'MGM Macau',
    market: 'MO',
    ownerId: 'u4',
    annualTargetUsd: 900000,
    yearToDateUsd: 380000,
    contractStatus: 'active',
    contractExpiresAt: '2026-12-20',
    businessType: 'commercial',
    opportunityNotes: '方案阶段，客户对 pricing pushback。',
    customerResources: '澳门大型综合度假村。',
    nextDigDirections: '1. 重新调整报价方案\n2. 安排高管拜访',
  },
  {
    id: 'a8',
    code: 'WEST',
    name: 'Westwind F&B',
    market: 'US',
    ownerId: 'u5',
    annualTargetUsd: 1500000,
    yearToDateUsd: 980000,
    contractStatus: 'active',
    contractExpiresAt: '2026-12-31',
    businessType: 'commercial',
    opportunityNotes: '已批准合同，首单 $108k 大货订单 PO 待收。',
    customerResources: '美国连锁 F&B 集团，西部 23 家门店。',
    nextDigDirections: '1. 催收 PO\n2. 准备生产排期',
  },
  {
    id: 'a9',
    code: 'PIVO',
    name: 'Pivot Industrial',
    market: 'US',
    ownerId: '',
    annualTargetUsd: 900000,
    yearToDateUsd: 0,
    contractStatus: 'expired',
    contractExpiresAt: '2026-01-15',
    businessType: 'industrial',
    opportunityNotes: '合同已到期，暂无续约计划。',
    customerResources: '美国工业客户。',
    nextDigDirections: '1. 评估是否重新激活',
  },
  {
    id: 'a10',
    code: 'JOHO',
    name: 'Johor Bahru F&B Holdings',
    market: 'MY',
    ownerId: '',
    annualTargetUsd: 250000,
    yearToDateUsd: 0,
    contractStatus: 'active',
    contractExpiresAt: '2026-12-31',
    businessType: 'commercial',
    opportunityNotes: '新客户，待分配销售负责人。',
    customerResources: '柔佛州 F&B 集团。',
    nextDigDirections: '1. 分配负责人\n2. 首次拜访',
  },
]

export interface Contact {
  id: string
  accountId: string
  name: string
  title: string
  email: string
  phone: string
  companyName?: string
  isPrimary: boolean
}

export const contacts: Contact[] = [
  { id: 'c1', accountId: 'a1', name: '陈美云', title: 'F&B Director', email: 'mary.tan@raffles.com', phone: '+65 9123 4567', isPrimary: true },
  { id: 'c2', accountId: 'a1', name: 'James Lee', title: 'Operations VP', email: 'james.lee@raffles.com', phone: '+65 9234 9876', isPrimary: false },
  { id: 'c3', accountId: 'a2', name: '林伟明', title: 'F&B Procurement Director', email: 'wm.lim@marinabaysands.sg', phone: '+65 9876 5432', isPrimary: true },
  { id: 'c4', accountId: 'a4', name: 'Somchai R.', title: 'Facilities Manager', email: 'somchai@bangkokmall.co.th', phone: '+66 81 234 5678', isPrimary: true },
  { id: 'c5', accountId: 'a6', name: 'David Wong', title: 'Procurement Director', email: 'david.wong@hkhosp.hk', phone: '+852 9123 4567', isPrimary: true },
  { id: 'c6', accountId: 'a8', name: 'Robert Lee', title: 'CEO', email: 'robert@westwindfb.us', phone: '+1 415 123 4567', isPrimary: true },
]

export interface Campaign {
  id: string
  code: string
  name: string
  type: string
  status: 'completed' | 'active'
  market: MarketCode
  budgetUsd: number
  actualSpendUsd: number
  ownerId: string
  leadCount: number
  convertedCount: number
  opportunityValueUsd: number
  startDate: string
  endDate: string
}

export const campaigns: Campaign[] = [
  { id: 'cmp-1', code: 'CMP-2026-Q1-DXB', name: 'GulfHost Dubai 2026 — Tradeshow', type: 'tradeshow', status: 'completed', market: 'US', budgetUsd: 65000, actualSpendUsd: 61800, ownerId: 'u7', leadCount: 18, convertedCount: 4, opportunityValueUsd: 950000, startDate: '2026-03-10', endDate: '2026-03-14' },
  { id: 'cmp-2', code: 'CMP-2026-Q2-LINKEDIN', name: 'LinkedIn ABM — SEA Hospitality CIOs', type: 'paidAds', status: 'active', market: 'SG', budgetUsd: 18000, actualSpendUsd: 11400, ownerId: 'u7', leadCount: 9, convertedCount: 1, opportunityValueUsd: 180000, startDate: '2026-05-01', endDate: '2026-07-01' },
  { id: 'cmp-3', code: 'CMP-2026-Q2-WEBINAR', name: 'Webinar: Water Quality Standards', type: 'webinar', status: 'completed', market: 'SG', budgetUsd: 4500, actualSpendUsd: 4120, ownerId: 'u7', leadCount: 11, convertedCount: 2, opportunityValueUsd: 320000, startDate: '2026-05-18', endDate: '2026-05-18' },
  { id: 'cmp-4', code: 'CMP-2026-Q2-REFERRAL', name: 'Q2 Distributor Referral Program', type: 'referral', status: 'active', market: 'SG', budgetUsd: 25000, actualSpendUsd: 12500, ownerId: 'u7', leadCount: 14, convertedCount: 3, opportunityValueUsd: 480000, startDate: '2026-04-15', endDate: '2026-06-30' },
]

export interface Lead {
  id: string
  name: string
  title: string
  companyName: string
  country: string
  email: string
  phone: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  source: string
  campaignId: string
  rating: number
  estimatedValueUsd: number
  ownerId: string
  lastContactedAt: string
  notes: string
  convertedAccountId?: string
  convertedOpportunityId?: string
}

export const leads: Lead[] = [
  { id: 'lead-1', name: 'Faisal Al-Rashid', title: 'Head of Procurement', companyName: 'Emirates Palace Hospitality Group', country: 'AE', email: 'faisal.alrashid@emiratespalace.ae', phone: '+971 50 123 4567', status: 'qualified', source: 'campaign', campaignId: 'cmp-1', rating: 5, estimatedValueUsd: 280000, ownerId: 'u5', lastContactedAt: '2026-06-13', notes: 'Met at GulfHost. Replacing entire dispenser fleet across 4 hotels Q3.' },
  { id: 'lead-2', name: '林伟明', title: 'F&B Procurement Director', companyName: 'Marina Bay Sands', country: 'SG', email: 'wm.lim@marinabaysands.sg', phone: '+65 9876 5432', status: 'contacted', source: 'campaign', campaignId: 'cmp-2', rating: 4, estimatedValueUsd: 180000, ownerId: 'u2', lastContactedAt: '2026-06-06', notes: 'LinkedIn DM responded. Demo scheduled next week.' },
  { id: 'lead-3', name: '陈慧珊', title: 'Director of Facilities', companyName: 'Bangkok International Hospital', country: 'TH', email: 's.chen@bih.co.th', phone: '+66 81 987 6543', status: 'new', source: 'campaign', campaignId: 'cmp-3', rating: 4, estimatedValueUsd: 120000, ownerId: 'u3', lastContactedAt: '-', notes: 'Webinar attendee — asked great questions about water hardness compliance.' },
  { id: 'lead-4', name: 'James Lee', title: 'Operations VP', companyName: 'Raffles Hospitality', country: 'SG', email: 'james.lee@raffles.com', phone: '+65 9234 9876', status: 'converted', source: 'offlineEvent', campaignId: 'cmp-1', rating: 5, estimatedValueUsd: 460000, ownerId: 'u2', lastContactedAt: '2026-03-08', notes: 'Originally met at F&B Asia 2025. Converted into Raffles full rollout deal.', convertedAccountId: 'a1', convertedOpportunityId: 'o13' },
]

export interface Opportunity {
  id: string
  accountId: string
  name: string
  amountUsd: number
  stage: string
  probability: number
  expectedCloseDate: string
  ownerId: string
}

export const opportunities: Opportunity[] = [
  { id: 'o11', accountId: 'a1', name: 'Raffles group supply framework', amountUsd: 460000, stage: 'negotiate', probability: 60, expectedCloseDate: '2026-06-30', ownerId: 'u2' },
  { id: 'o12', accountId: 'a1', name: 'BKK + KL pilot installation', amountUsd: 180000, stage: 'proposal', probability: 40, expectedCloseDate: '2026-07-15', ownerId: 'u2' },
  { id: 'o21', accountId: 'a2', name: 'Marina Bay renewal + SkyPark', amountUsd: 640000, stage: 'qualify', probability: 50, expectedCloseDate: '2026-08-15', ownerId: 'u2' },
  { id: 'o41', accountId: 'a4', name: 'Bangkok Mall D2000 rollout', amountUsd: 310000, stage: 'closedWon', probability: 100, expectedCloseDate: '2026-06-15', ownerId: 'u3' },
  { id: 'o61', accountId: 'a6', name: 'HK Hospitality 5-year framework', amountUsd: 3800000, stage: 'prospect', probability: 20, expectedCloseDate: '2026-09-30', ownerId: 'u4' },
  { id: 'o81', accountId: 'a8', name: 'Westwind F&B first order', amountUsd: 108000, stage: 'closedWon', probability: 100, expectedCloseDate: '2026-06-10', ownerId: 'u5' },
]

export interface Order {
  id: string
  orderNumber: string
  piNumber: string
  accountId: string
  requestedById: string
  items: { sku: string; name: string; qty: number; unitPrice: number }[]
  subtotalUsd: number
  status: string
  orderType: string
  orderKind: string
  poStatus: string
  createdAt: string
  shippedAt?: string
}

export const orders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'AHT-ORD-2026-0001',
    piNumber: 'PI-TH20260614',
    accountId: 'a4',
    requestedById: 'u6',
    items: [
      { sku: 'ANG-FB-D2000', name: 'Angel D2000 Commercial Dispenser', qty: 12, unitPrice: 2400 },
      { sku: 'ANG-INSTALL-STD', name: 'Standard Installation Service', qty: 12, unitPrice: 220 },
    ],
    subtotalUsd: 31440,
    status: 'piIssued',
    orderType: 'preWin',
    orderKind: 'bulk',
    poStatus: 'received',
    createdAt: '2026-06-13',
  },
  {
    id: 'ord-2',
    orderNumber: 'AHT-ORD-2026-0002',
    piNumber: 'PI-SG20260529',
    accountId: 'a1',
    requestedById: 'u2',
    items: [
      { sku: 'ANG-FB-D3000', name: 'Angel D3000 Pro Commercial Dispenser', qty: 6, unitPrice: 3600 },
      { sku: 'ANG-INSTALL-STD', name: 'Standard Installation Service', qty: 6, unitPrice: 350 },
    ],
    subtotalUsd: 23700,
    status: 'completed',
    orderType: 'firstOrder',
    orderKind: 'sample',
    poStatus: 'received',
    createdAt: '2026-05-27',
    shippedAt: '2026-06-02',
  },
  {
    id: 'ord-3',
    orderNumber: 'AHT-ORD-2026-0003',
    piNumber: '-',
    accountId: 'a8',
    requestedById: 'u5',
    items: [
      { sku: 'ANG-FB-D3000', name: 'Angel D3000 Pro Commercial Dispenser', qty: 30, unitPrice: 3600 },
    ],
    subtotalUsd: 108000,
    status: 'pendingPI',
    orderType: 'firstOrder',
    orderKind: 'bulk',
    poStatus: 'pending',
    createdAt: '2026-06-15',
  },
  {
    id: 'ord-4',
    orderNumber: 'AHT-ORD-2026-0004',
    piNumber: 'PI-SG20260609',
    accountId: 'a1',
    requestedById: 'u2',
    items: [
      { sku: 'ANG-FB-D3000', name: 'Angel D3000 Pro Commercial Dispenser', qty: 3, unitPrice: 3600 },
      { sku: 'ANG-FILTER-12M', name: '12-month Filter Pack', qty: 6, unitPrice: 680 },
    ],
    subtotalUsd: 13680,
    status: 'completed',
    orderType: 'reorder',
    orderKind: 'reorder',
    poStatus: 'received',
    createdAt: '2026-06-08',
    shippedAt: '2026-06-10',
  },
  {
    id: 'ord-5',
    orderNumber: 'AHT-ORD-2026-0005',
    piNumber: 'PI-ID20260527',
    accountId: 'a5',
    requestedById: 'u3',
    items: [
      { sku: 'ANG-RES-H500', name: 'Angel H500 Residential Whole-Home System', qty: 24, unitPrice: 1800 },
      { sku: 'ANG-RES-U200', name: 'Angel U200 Under-Sink Filter', qty: 60, unitPrice: 480 },
    ],
    subtotalUsd: 72000,
    status: 'completed',
    orderType: 'preWin',
    orderKind: 'bulk',
    poStatus: 'received',
    createdAt: '2026-05-25',
    shippedAt: '2026-05-30',
  },
]

export interface Contract {
  id: string
  contractNumber: string
  accountId: string
  name: string
  type: string
  status: string
  signEntity: string
  amountUsd: number
  paymentProgress: string
  paymentStatus: string
  expiryDate: string
}

export const contracts: Contract[] = [
  { id: 'con-1', contractNumber: 'CON-SG-2026-RAFF-01', accountId: 'a1', name: '年度采购框架', type: 'annualFramework', status: 'signed', signEntity: 'AHT SG', amountUsd: 800000, paymentProgress: '78%', paymentStatus: 'normal', expiryDate: '2026-12-31' },
  { id: 'con-2', contractNumber: 'CON-SG-2026-MARI-01', accountId: 'a2', name: 'Marina Bay 供应协议', type: 'supplyAgreement', status: 'expiring', signEntity: 'AHT SG', amountUsd: 1200000, paymentProgress: '45%', paymentStatus: 'normal', expiryDate: '2026-07-08' },
  { id: 'con-3', contractNumber: 'CON-MY-2026-GENT-01', accountId: 'a3', name: 'Genting 框架协议', type: 'annualFramework', status: 'signed', signEntity: 'AHT MY', amountUsd: 600000, paymentProgress: '80%', paymentStatus: 'normal', expiryDate: '2026-11-15' },
  { id: 'con-4', contractNumber: 'CON-ID-2026-SOEK-01', accountId: 'a5', name: 'Soekarno 经销协议', type: 'distributionAgreement', status: 'expiring', signEntity: 'AHT ID', amountUsd: 400000, paymentProgress: '28%', paymentStatus: 'overdueRisk', expiryDate: '2026-06-21' },
]

export interface Payment {
  id: string
  receivedAt: string
  accountId: string
  orderId: string
  amountUsd: number
  currency: string
  registeredById: string
  method: string
  status: string
}

export const payments: Payment[] = [
  { id: 'pay-1', receivedAt: '2026-05-28', accountId: 'a1', orderId: 'ord-2', amountUsd: 23700, currency: 'USD', registeredById: 'u9', method: 'wire', status: 'confirmed' },
  { id: 'pay-2', receivedAt: '2026-06-09', accountId: 'a1', orderId: 'ord-4', amountUsd: 6840, currency: 'USD', registeredById: 'u9', method: 'wire', status: 'receivable' },
  { id: 'pay-3', receivedAt: '2026-05-30', accountId: 'a5', orderId: 'ord-5', amountUsd: 72000, currency: 'USD', registeredById: 'u9', method: 'lc', status: 'confirmed' },
  { id: 'pay-4', receivedAt: '2026-06-12', accountId: 'a4', orderId: 'ord-1', amountUsd: 15720, currency: 'USD', registeredById: 'u9', method: 'wire', status: 'partial' },
]

export interface Invoice {
  id: string
  no: string
  orderId: string
  accountId: string
  amountUsd: number
  status: 'pending_review' | 'pending_issue' | 'issued' | 'rejected'
  applicantId: string
  title: string
  taxId: string
  createdAt: string
}

export const invoices: Invoice[] = [
  { id: 'inv1', no: 'INV-2026-0616-001', orderId: 'ord-1', accountId: 'a4', amountUsd: 12400, status: 'pending_review', applicantId: 'u3', title: 'Bangkok Mall Group', taxId: 'TH0105559000011', createdAt: '2026-06-16' },
  { id: 'inv2', no: 'INV-2026-0615-002', orderId: 'ord-2', accountId: 'a1', amountUsd: 8750, status: 'pending_issue', applicantId: 'u2', title: 'Raffles Hospitality Pte Ltd', taxId: 'SG201312345A', createdAt: '2026-06-15' },
  { id: 'inv3', no: 'INV-2026-0610-003', orderId: 'ord-4', accountId: 'a1', amountUsd: 32000, status: 'issued', applicantId: 'u2', title: 'Raffles Hospitality Pte Ltd', taxId: 'SG201312345A', createdAt: '2026-06-10' },
]

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  line: string
  spec: string
  unitPrice: number
  leadTime: string
  stock: number
  status: 'onSale' | 'discontinued' | 'rnd'
}

export const products: Product[] = [
  { id: 'p1', sku: 'ANG-FB-D3000', name: 'Angel D3000 Pro Commercial Dispenser', category: 'commercial', line: 'D 系列', spec: '3000L/天', unitPrice: 3600, leadTime: '3-4 周', stock: 86, status: 'onSale' },
  { id: 'p2', sku: 'ANG-FB-D2000', name: 'Angel D2000 Commercial Dispenser', category: 'commercial', line: 'D 系列', spec: '2000L/天', unitPrice: 2400, leadTime: '3-4 周', stock: 120, status: 'onSale' },
  { id: 'p3', sku: 'ANG-RES-H500', name: 'Angel H500 Residential Whole-Home System', category: 'residential', line: 'H 系列', spec: '500L/天', unitPrice: 1800, leadTime: '2-3 周', stock: 240, status: 'onSale' },
  { id: 'p4', sku: 'ANG-RES-U200', name: 'Angel U200 Under-Sink Filter', category: 'residential', line: 'U 系列', spec: '200L/天', unitPrice: 480, leadTime: '1-2 周', stock: 560, status: 'onSale' },
  { id: 'p5', sku: 'ANG-IND-W1000', name: 'Angel W1000 Industrial System', category: 'industrial', line: 'W 系列', spec: '10000L/天', unitPrice: 12000, leadTime: '6-8 周', stock: 12, status: 'onSale' },
  { id: 'p6', sku: 'ANG-WPU-7000', name: 'AHT-WPU-7000 Strategic Dispenser', category: 'strategic', line: 'WPU 系列', spec: '7000L/天', unitPrice: 8500, leadTime: '4-6 周', stock: 8, status: 'onSale' },
]

export interface EndUser {
  id: string
  accountId: string
  name: string
  location: string
  units: number
  installDate: string
  lastService: string
}

export const endUsers: EndUser[] = [
  { id: 'eu1', accountId: 'a1', name: 'Raffles Hotel Singapore', location: 'Singapore', units: 6, installDate: '2025-08-15', lastService: '2026-05-10' },
  { id: 'eu2', accountId: 'a1', name: 'Raffles Hotel Jakarta', location: 'Jakarta', units: 2, installDate: '2026-03-20', lastService: '2026-05-20' },
  { id: 'eu3', accountId: 'a2', name: 'Marina Bay Sands Tower 1', location: 'Singapore', units: 8, installDate: '2024-06-10', lastService: '2026-04-12' },
  { id: 'eu4', accountId: 'a4', name: 'Bangkok Mall Main F&B', location: 'Bangkok', units: 8, installDate: '2026-06-10', lastService: '2026-06-14' },
]

export interface ProjectUpdate {
  id: string
  accountId: string
  postedById: string
  stage: string
  summary: string
  unitsInstalled?: number
  createdAt: string
}

export const projectUpdates: ProjectUpdate[] = [
  { id: 'pu1', accountId: 'a4', postedById: 'u12', stage: 'install', summary: 'Installed 8 of 12 D2000 units at Bangkok Mall main F&B floor. Remaining 4 scheduled for next week.', unitsInstalled: 8, createdAt: '2026-06-14' },
  { id: 'pu2', accountId: 'a4', postedById: 'u12', stage: 'survey', summary: 'Completed site survey for the basement food court. Identified electrical capacity issue — flagged to procurement.', createdAt: '2026-06-06' },
  { id: 'pu3', accountId: 'a4', postedById: 'u12', stage: 'commissioning', summary: 'Commissioning of first batch complete. Quality test passed.', unitsInstalled: 8, createdAt: '2026-06-15' },
]

export interface Activity {
  id: string
  accountId?: string
  opportunityId?: string
  createdAt: string
  createdById: string
  type: string
  content: string
}

export const activities: Activity[] = [
  { id: 'act1', accountId: 'a1', createdAt: '2026-06-14', createdById: 'u2', type: 'email', content: '发送 F&B catalogue + reference list' },
  { id: 'act2', accountId: 'a1', createdAt: '2026-06-10', createdById: 'u2', type: 'meeting', content: '与 James Lee 确认试点安装范围' },
  { id: 'act3', accountId: 'a1', createdAt: '2026-05-30', createdById: 'u9', type: 'finance', content: '登记客户 PO 与付款通知' },
  { id: 'act4', accountId: 'a2', createdAt: '2026-06-12', createdById: 'u2', type: 'visit', content: 'Marina Bay Sands site visit — 12 dispenser positions confirmed.' },
  { id: 'act5', accountId: 'a4', createdAt: '2026-06-14', createdById: 'u3', type: 'phone', content: 'Bangkok Mall PO confirmed receipt.' },
]

export interface RetailMonthly {
  id: string
  month: string
  soUnits: number
  strategicUnits: number
  netStoreAdds: number
  sellThroughRate: number
  events: number
  notes: string
}

export const retailMonthly: RetailMonthly[] = [
  { id: 'rm1', month: '2026-06', soUnits: 286, strategicUnits: 92, netStoreAdds: 2, sellThroughRate: 78, events: 1, notes: '本月新增雅加达南区专卖店 2 家。' },
  { id: 'rm2', month: '2026-05', soUnits: 248, strategicUnits: 76, netStoreAdds: 1, sellThroughRate: 72, events: 0, notes: '-' },
  { id: 'rm3', month: '2026-04', soUnits: 210, strategicUnits: 58, netStoreAdds: 0, sellThroughRate: 68, events: 0, notes: '-' },
  { id: 'rm4', month: '2026-03', soUnits: 195, strategicUnits: 52, netStoreAdds: 1, sellThroughRate: 65, events: 0, notes: '-' },
]

export interface DailyReport {
  id: string
  userId: string
  date: string
  todaySummary: string
  tomorrowPlan: string
  customersContacted: string[]
  revenueUpdateNote: string
  moodRating: number
  submittedAt: string
}

export const dailyReports: DailyReport[] = [
  { id: 'dr1', userId: 'u1', date: '2026-06-16', todaySummary: 'Reviewed Q2 pipeline with all 3 regions. Approved Westwind contract.', tomorrowPlan: 'Board prep + Westwind kickoff call.', customersContacted: ['a8'], revenueUpdateNote: 'No new bookings — focus is leadership.', moodRating: 4, submittedAt: '2026-06-16T09:30:00Z' },
  { id: 'dr2', userId: 'u2', date: '2026-06-15', todaySummary: 'Marina Bay Sands site visit — 12 dispenser positions confirmed.', tomorrowPlan: 'Push Raffles reorder PI to client. Lunch with Genting.', customersContacted: ['a2', 'a1'], revenueUpdateNote: 'Raffles 翻单 PI sent ($13,680).', moodRating: 5, submittedAt: '2026-06-15T18:10:00Z' },
  { id: 'dr3', userId: 'u3', date: '2026-06-15', todaySummary: 'Bangkok Mall installation site survey complete.', tomorrowPlan: 'Bangkok PO follow-up, Aerowisata lead nurture.', customersContacted: ['a4', 'a5'], revenueUpdateNote: 'Bangkok Mall PO confirmed receipt.', moodRating: 4, submittedAt: '2026-06-15T17:40:00Z' },
]

export interface AttendanceRecord {
  id: string
  userId: string
  type: 'in' | 'out'
  time: string
  location: string
  note?: string
}

export const attendanceRecords: AttendanceRecord[] = [
  { id: 'att1', userId: 'u1', type: 'in', time: '2026-06-16 09:02', location: 'AHT Singapore Office', note: '' },
]

export interface DocumentTemplate {
  id: string
  type: string
  name: string
  description: string
  fileName: string
  isActive: boolean
}

export const documentTemplates: DocumentTemplate[] = [
  { id: 'dt1', type: 'PI', name: 'Standard Proforma Invoice (EN)', description: 'Default PI template used for distributor and direct sales orders.', fileName: 'AHT-PI-Template-EN-v2.docx', isActive: true },
  { id: 'dt2', type: 'PI', name: '标准形式发票（中文）', description: '默认 PI 模板（中文版），用于经销商及直销订单。', fileName: 'AHT-PI-Template-ZH-v2.docx', isActive: false },
  { id: 'dt3', type: 'contract', name: 'Distributor Contract Template', description: 'Used when on-boarding a new distributor partner.', fileName: 'AHT-Distributor-Contract-v3.docx', isActive: true },
  { id: 'dt4', type: 'quote', name: 'Sales Quotation Template', description: 'Standard sales quotation template.', fileName: 'AHT-Quote-Template-v1.docx', isActive: true },
]

export interface Notification {
  id: string
  title: string
  content: string
  createdAt: string
  read: boolean
}

export const notifications: Notification[] = [
  { id: 'n1', title: '合同即将到期', content: 'Marina Bay Sands 合同将在 22 天后到期，请及时处理续约。', createdAt: '2026-06-16', read: false },
  { id: 'n2', title: '折扣审批', content: 'HK Hospitality 15% 折扣申请待 CSO 审批。', createdAt: '2026-06-16', read: false },
  { id: 'n3', title: 'PO 待收', content: 'Westwind F&B 首单 PO 尚未收到。', createdAt: '2026-06-15', read: true },
]

export interface AuditLog {
  id: string
  userId: string
  action: string
  target: string
  createdAt: string
}

export const auditLogs: AuditLog[] = [
  { id: 'al1', userId: 'u1', action: '更新', target: '客户 Raffles Hospitality 档案', createdAt: '2026-06-16T10:00:00Z' },
  { id: 'al2', userId: 'u2', action: '创建', target: '订单 AHT-ORD-2026-0004', createdAt: '2026-06-08T14:20:00Z' },
  { id: 'al3', userId: 'u9', action: '确认', target: '收款 PAY-2026-0528', createdAt: '2026-05-28T09:15:00Z' },
]

export interface AnnualTarget {
  id: string
  market: MarketCode
  year: number
  revenueTargetUsd: number
  kpiTargetUsd: number
  strategicTargetUnits: number
}

export const annualTargets: AnnualTarget[] = [
  { id: 't1', market: 'SG', year: 2026, revenueTargetUsd: 1400000, kpiTargetUsd: 1160000, strategicTargetUnits: 120 },
  { id: 't2', market: 'MY', year: 2026, revenueTargetUsd: 1000000, kpiTargetUsd: 480000, strategicTargetUnits: 80 },
  { id: 't3', market: 'TH', year: 2026, revenueTargetUsd: 800000, kpiTargetUsd: 240000, strategicTargetUnits: 60 },
  { id: 't4', market: 'ID', year: 2026, revenueTargetUsd: 700000, kpiTargetUsd: 110000, strategicTargetUnits: 50 },
  { id: 't5', market: 'HK', year: 2026, revenueTargetUsd: 1200000, kpiTargetUsd: 520000, strategicTargetUnits: 90 },
  { id: 't6', market: 'MO', year: 2026, revenueTargetUsd: 900000, kpiTargetUsd: 380000, strategicTargetUnits: 70 },
  { id: 't7', market: 'US', year: 2026, revenueTargetUsd: 2500000, kpiTargetUsd: 980000, strategicTargetUnits: 200 },
]

export interface SystemSettings {
  id: string
  brandName: string
  brandSubtitle: string
  primaryColor: string
  dangerColor: string
  pageBackground: string
  sidebarBackground: string
  sidebarActiveBackground: string
  headerBackground: string
  notificationSettings: {
    email: boolean
    contractExpiry: boolean
    orderStatus: boolean
    dailyReport: boolean
  }
  updatedAt: string
}

export const defaultSystemSettings: SystemSettings = {
  id: 'global',
  brandName: 'ANGEL',
  brandSubtitle: 'GLOBAL SALES CRM',
  primaryColor: '#ee2737',
  dangerColor: '#a5001e',
  pageBackground: '#eeeae4',
  sidebarBackground: '#1f2024',
  sidebarActiveBackground: '#5a2429',
  headerBackground: '#ffffff',
  notificationSettings: {
    email: true,
    contractExpiry: true,
    orderStatus: true,
    dailyReport: false,
  },
  updatedAt: '2026-07-07T00:00:00.000Z',
}

// ---------------- Helpers ----------------

export function getUserById(id?: string): User | undefined {
  return users.find((u) => u.id === id)
}

export function getAccountById(id?: string): Account | undefined {
  return accounts.find((a) => a.id === id)
}

export function getContactsByAccount(accountId?: string): Contact[] {
  return contacts.filter((c) => c.accountId === accountId)
}

export function getOpportunitiesByAccount(accountId?: string): Opportunity[] {
  return opportunities.filter((o) => o.accountId === accountId)
}

export function getOrdersByAccount(accountId?: string): Order[] {
  return orders.filter((o) => o.accountId === accountId)
}

export function getPaymentsByAccount(accountId?: string): Payment[] {
  return payments.filter((p) => p.accountId === accountId)
}

export function getActivitiesByAccount(accountId?: string): Activity[] {
  return activities.filter((a) => a.accountId === accountId)
}

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

export function formatPercent(n: number): string {
  return `${Math.round(n)}%`
}

export function accountProgress(a: Account): number {
  return Math.round((a.yearToDateUsd / a.annualTargetUsd) * 100)
}

export function statusTone(status: string): 'green' | 'amber' | 'red' | 'gray' | 'blue' {
  if (['active', 'onSale', 'completed', 'signed', 'received', 'confirmed', 'collected', 'normal'].includes(status)) return 'green'
  if (['expiring', 'shipped', 'partial', 'receivable', 'due'].includes(status)) return 'amber'
  if (['piIssued', 'pendingPI', 'info', 'contacted', 'qualified', 'pending'].includes(status)) return 'blue'
  if (['expired', 'discontinued', 'inactive', 'overdueRisk', 'overdue'].includes(status)) return 'red'
  return 'gray'
}

export function statusLabel(status: string): string {
  return `labels.contractStatus.${status}`
}

export function flagForMarket(code: MarketCode): string {
  return markets.find((m) => m.code === code)?.flag ?? ''
}
