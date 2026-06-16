import { Card, Col, Progress, Row, Table, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'
import {
  accounts,
  activities,
  annualTargets,
  formatCurrency,
  getAccountById,
  markets,
  opportunities,
  orders,
  products,
  statusTone,
  users,
} from '../mocks/crmData'

const { Text } = Typography

export function DashboardPage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  // Overall sales results (aligned with executive report figures)
  const totalTarget = 8_500_000
  const totalActual = 3_870_000
  const totalProgress = 46
  const weightedPipeline = opportunities.reduce((s, o) => s + o.amountUsd * (o.probability / 100), 0)

  // Core KPI: shipped and customs-cleared
  const shippedOrders = orders.filter((o) => o.status === 'completed')
  const ytdShippedCleared = shippedOrders.reduce((s, o) => s + o.subtotalUsd, 0)
  const shippedTarget = 6_890_000
  const gap = Math.max(0, shippedTarget - ytdShippedCleared)
  const shippedUncollected = 31_000
  const shippedCollected = 23_000
  const pendingOrders = orders.filter((o) => o.status !== 'completed').length

  const coreKpisTop = [
    { label: t('dashboard.shippedYtd'), value: formatCurrency(ytdShippedCleared), sub: `${t('dashboard.target')} ${formatCurrency(shippedTarget)}` },
    { label: t('dashboard.gapToTarget'), value: formatCurrency(gap), sub: t('dashboard.gapSub') },
    { label: t('dashboard.uncollected'), value: formatCurrency(shippedUncollected), sub: t('dashboard.uncollectedSub') },
    { label: t('dashboard.collected'), value: formatCurrency(shippedCollected), sub: t('dashboard.collectedSub') },
  ]

  const coreKpisBottom = [
    { label: t('dashboard.totalWon'), value: '$2.82M' },
    { label: t('dashboard.weightedForecast'), value: '$1.44M' },
    { label: t('dashboard.monthlyWins'), value: '$860k' },
    { label: t('dashboard.winRate'), value: '80%' },
    { label: t('dashboard.openOpps'), value: '3' },
    { label: t('dashboard.pendingOrders'), value: pendingOrders.toString() },
  ]

  const marketRows = markets.map((m) => {
    const target = annualTargets.find((t) => t.market === m.code)
    const actual = target ? Math.round(target.revenueTargetUsd * 0.35) : 0
    const percent = target ? Math.round((actual / target.revenueTargetUsd) * 100) : 0
    return {
      market: `${m.flag} ${m.code}`,
      target: `$${(target?.revenueTargetUsd ?? 0).toLocaleString()}`,
      actual: `$${actual.toLocaleString()}`,
      percent,
    }
  })

  const arBuckets = [
    { range: '0-30', amount: '$420k', percent: 60 },
    { range: '31-60', amount: '$180k', percent: 26 },
    { range: '61-90', amount: '$68k', percent: 10 },
    { range: '>90', amount: '$28k', percent: 4 },
  ]

  const funnelStages = [
    { stageKey: t('dashboard.stageProspect'), value: '$1.24M', count: 12, percent: 100 },
    { stageKey: t('dashboard.stageQualify'), value: '$980k', count: 8, percent: 79 },
    { stageKey: t('dashboard.stageProposal'), value: '$720k', count: 6, percent: 58 },
    { stageKey: t('dashboard.stageNegotiate'), value: '$460k', count: 3, percent: 37 },
    { stageKey: t('dashboard.stageClosed'), value: '$422k', count: 5, percent: 34 },
  ]

  const topOpportunities = opportunities
    .filter((o) => o.stage !== 'closedWon')
    .slice(0, 5)
    .map((o) => ({
      name: o.name,
      account: getAccountById(o.accountId)?.name ?? o.accountId,
      amount: formatCurrency(o.amountUsd),
      stage: o.stage,
      probability: `${o.probability}%`,
    }))

  const retailAccounts = [
    { name: 'Westwind F&B', so: 1160, strategic: 395, net: 10 },
    { name: 'Soekarno Retail Distribution', so: 939, strategic: 278, net: 4 },
    { name: 'Bangkok Mall Group', so: 365, strategic: 94, net: -1 },
  ]

  const accountPool = accounts.slice(0, 4).map((a) => ({
    name: a.name,
    market: a.market,
    notes: a.opportunityNotes.slice(0, 80) + '...',
    statusKey: a.contractStatus,
  }))

  const peopleRows = users.filter((u) => u.role !== 'Admin').slice(0, 4).map((u) => ({
    name: u.name,
    revenue: `$${(Math.random() * 800 + 200).toFixed(0)}k`,
    achievement: `${Math.floor(Math.random() * 40 + 50)}%`,
    orders: Math.floor(Math.random() * 20 + 5),
    active: Math.floor(Math.random() * 8 + 2),
  }))

  const activityTypeMap = ['email', 'phone', 'meeting', 'visit', 'wechat', 'other']
  const activityCounts = activityTypeMap.map((key) => ({
    key,
    type: t(`dashboard.activityTypes.${key}`),
    count: activities.filter((a) => a.type === key).length,
  }))

  const productRows = products.slice(0, 4).map((p) => ({
    name: p.name,
    sku: p.sku,
    sold: Math.floor(Math.random() * 200 + 50),
    orders: Math.floor(Math.random() * 30 + 5),
  }))

  const recentWins = opportunities
    .filter((o) => o.stage === 'closedWon')
    .slice(0, 4)
    .map((o) => ({
      name: o.name,
      account: getAccountById(o.accountId)?.name ?? o.accountId,
      amount: formatCurrency(o.amountUsd),
      closeDate: '2026-06-10',
    }))

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('dashboard.title')}</div>
          <div className="crm-page-header-desc">{t('dashboard.subtitle')}</div>
        </div>
      </div>

      {/* 1. Overall sales results */}
      <Card
        title={<span style={{ fontWeight: 700 }}>{t('dashboard.overallSales')}</span>}
        bodyStyle={{ padding: '16px 20px' }}
        extra={<Text type="secondary">+{formatCurrency(weightedPipeline)} weighted pipeline forecast</Text>}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800 }}>{formatCurrency(totalActual)}</span>
          <span style={{ color: 'var(--text-muted)' }}>/ {formatCurrency(totalTarget)} · {totalProgress}%</span>
        </div>
        <Progress percent={totalProgress} showInfo={false} strokeColor="#ee2737" trailColor="#ece6df" size="small" />
      </Card>

      {/* 2. Core KPI: shipped and customs-cleared */}
      <Card
        title={<span style={{ fontWeight: 700 }}>{t('dashboard.coreKpi')}</span>}
        bodyStyle={{ padding: '16px 20px' }}
        extra={<Tag color="red">{t('dashboard.kpiTag')}</Tag>}
        style={{ marginTop: 16 }}
      >
        <Row gutter={[16, 16]}>
          {coreKpisTop.map((k) => (
            <Col xs={12} md={6} key={k.label}>
              <div style={{ padding: 10, borderRadius: 6, border: '1px solid #e8e4dd', background: '#fff' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{k.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{k.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{k.sub}</div>
              </div>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
          {coreKpisBottom.map((k) => (
            <Col xs={12} md={4} key={k.label}>
              <div style={{ padding: 10, borderRadius: 6, border: '1px solid #e8e4dd', background: '#fff' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{k.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{k.value}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 3. Market targets + overseas retail */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={15}>
          <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.marketTarget')}</span>} bodyStyle={{ padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {marketRows.map((m) => (
                <div key={m.market}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{m.market}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{m.actual} / {m.target}</span>
                  </div>
                  <Progress percent={m.percent} size="small" strokeColor="#ee2737" trailColor="#ece6df" format={(p) => <span style={{ fontSize: 12, fontWeight: 700 }}>{p}%</span>} />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.retailKpi')}</span>} bodyStyle={{ padding: 16 }}>
            <Row gutter={[12, 12]}>
              {[
                { label: t('dashboard.ytdSo'), value: '2,464' },
                { label: t('dashboard.strategicUnits'), value: '767' },
                { label: t('dashboard.netNewStores'), value: '+13' },
                { label: t('dashboard.caseStudies'), value: '5' },
              ].map((k) => (
                <Col span={12} key={k.label}>
                  <div style={{ padding: 10, background: '#faf9f7', borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{k.value}</div>
                  </div>
                </Col>
              ))}
            </Row>
            <Table
              dataSource={retailAccounts}
              rowKey="name"
              pagination={false}
              size="small"
              style={{ marginTop: 12 }}
              columns={[
                { title: t('dashboard.account'), dataIndex: 'name' },
                { title: t('dashboard.soUnits'), dataIndex: 'so' },
                { title: t('dashboard.strategicUnits'), dataIndex: 'strategic' },
                { title: t('dashboard.netNew'), dataIndex: 'net', render: (v) => (v > 0 ? `+${v}` : v) },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* 4. AR aging + contract expiry monitoring */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.arAging')}</span>} bodyStyle={{ padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {arBuckets.map((b) => (
                <div key={b.range}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{b.range} {t('common.date')}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{b.amount}</span>
                  </div>
                  <Progress percent={b.percent} showInfo={false} strokeColor="#f59e0b" trailColor="#ece6df" size="small" />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.contractExpiry')}</span>} bodyStyle={{ padding: 16 }}>
            <Text type="secondary">{t('dashboard.contractOk')}</Text>
          </Card>
        </Col>
      </Row>

      {/* 5. Process analysis: weighted funnel + top opportunities */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.weightedFunnel')}</span>} bodyStyle={{ padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {funnelStages.map((s) => (
                <div key={s.stageKey} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 70, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{s.stageKey}</div>
                  <div style={{ flex: 1 }}>
                    <Progress percent={s.percent} showInfo={false} strokeColor="#3b82f6" trailColor="#ece6df" size="small" />
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 60 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.count} {t('dashboard.countUnit')}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.topOpps')}</span>} bodyStyle={{ padding: 16 }}>
            <Table
              dataSource={topOpportunities}
              rowKey="name"
              pagination={false}
              size="small"
              onRow={() => ({ onClick: () => navigate('/app/pipeline'), style: { cursor: 'pointer' } })}
              columns={[
                { title: t('dashboard.oppName'), dataIndex: 'name' },
                { title: t('dashboard.account'), dataIndex: 'account' },
                { title: t('dashboard.amount'), dataIndex: 'amount' },
                { title: t('dashboard.stage'), dataIndex: 'stage', render: (v) => t(`labels.oppStage.${v}`) },
                { title: t('dashboard.probability'), dataIndex: 'probability' },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* 6. Account pipeline + commercial case studies */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.accountPool')}</span>} bodyStyle={{ padding: 16 }}>
            <Text className="text-secondary" style={{ display: 'block', marginBottom: 12 }}>{t('dashboard.accountPoolDesc')}</Text>
            {accountPool.map((a) => (
              <div key={a.name} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate('/app/accounts')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong>{a.name}</Text>
                  <Tag className={`pill pill-${statusTone(a.statusKey)}`}>{t(`labels.contractStatus.${a.statusKey}`)}</Tag>
                </div>
                <Text className="text-muted" style={{ fontSize: 12 }}>{a.notes}</Text>
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.caseStudy')}</span>} bodyStyle={{ padding: 16 }}>
            {recentWins.slice(0, 3).map((w) => (
              <div key={w.name} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text strong>{w.account}</Text>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{w.name}</div>
                </div>
                <div style={{ fontWeight: 700 }}>{w.amount}</div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 7. People performance */}
      <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.peoplePerformance')}</span>} bodyStyle={{ padding: 16 }} style={{ marginTop: 16 }}>
        <Table
          dataSource={peopleRows}
          rowKey="name"
          pagination={false}
          size="small"
          columns={[
            { title: t('team.name'), dataIndex: 'name' },
            { title: t('dashboard.ytdRevenue'), dataIndex: 'revenue' },
            { title: t('dashboard.ytdOrders'), dataIndex: 'orders' },
            { title: t('dashboard.achievement'), dataIndex: 'achievement' },
            { title: t('dashboard.activeCustomers'), dataIndex: 'active' },
          ]}
        />
      </Card>

      {/* 8. Sales behavior + products/orders + recent wins */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.salesBehavior')}</span>} bodyStyle={{ padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activityCounts.map((a) => (
                <div key={a.type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 50, fontSize: 12, fontWeight: 600 }}>{a.type}</div>
                  <div style={{ flex: 1 }}>
                    <Progress percent={Math.min(100, a.count * 10)} showInfo={false} strokeColor="#10b981" trailColor="#ece6df" size="small" />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{a.count}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.productOrders')}</span>} bodyStyle={{ padding: 16 }}>
            <Table
              dataSource={productRows}
              rowKey="sku"
              pagination={false}
              size="small"
              columns={[
                { title: t('dashboard.productName'), dataIndex: 'name' },
                { title: t('dashboard.soldUnits'), dataIndex: 'sold' },
                { title: t('dashboard.ordersQty'), dataIndex: 'orders' },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.recentWins')}</span>} bodyStyle={{ padding: 16 }}>
            <Table
              dataSource={recentWins}
              rowKey="name"
              pagination={false}
              size="small"
              onRow={() => ({ onClick: () => navigate('/app/orders'), style: { cursor: 'pointer' } })}
              columns={[
                { title: t('dashboard.account'), dataIndex: 'account' },
                { title: t('dashboard.amount'), dataIndex: 'amount' },
                { title: t('common.date'), dataIndex: 'closeDate' },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* 9. Recent orders */}
      <Card title={<span style={{ fontWeight: 700 }}>{t('dashboard.recentOrders')}</span>} bodyStyle={{ padding: 16 }} style={{ marginTop: 16 }}>
        <Table
          dataSource={orders.slice(0, 4)}
          rowKey="id"
          pagination={false}
          size="small"
          onRow={() => ({ onClick: () => navigate('/app/orders'), style: { cursor: 'pointer' } })}
          columns={[
            { title: t('dashboard.orderNo'), dataIndex: 'orderNumber' },
            { title: t('dashboard.account'), dataIndex: 'accountId', render: (id) => getAccountById(id)?.name ?? id },
            { title: t('dashboard.amount'), dataIndex: 'subtotalUsd', render: (v) => `$${v.toLocaleString()}` },
            { title: t('dashboard.status'), dataIndex: 'status', render: (v) => t(`labels.orderStatus.${v}`) },
          ]}
        />
      </Card>
    </div>
  )
}
