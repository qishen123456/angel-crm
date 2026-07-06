import { Card, Col, Progress, Row, Table } from 'antd'
import { useI18n } from '../hooks/useI18n'
import { annualTargets, markets, opportunities, orders, products } from '../mocks/crmData'

export function ExecutiveReportPage() {
  const { t } = useI18n()
  const totalTarget = annualTargets.reduce((s, t) => s + t.revenueTargetUsd, 0)
  const totalActual = annualTargets.reduce((s, t) => s + Math.round(t.revenueTargetUsd * 0.35), 0)
  const progress = Math.round((totalActual / totalTarget) * 100)

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('executiveReport.title')}</div>
          <div className="crm-page-header-desc">{t('executiveReport.subtitle')}</div>
        </div>
      </div>

      <Card title={t('executiveReport.overall')}>
        <Row gutter={[16, 16]}>
          {[
            { label: t('executiveReport.annualTarget'), value: `$${(totalTarget / 1000000).toFixed(2)}M` },
            { label: t('executiveReport.ytdRevenue'), value: `$${(totalActual / 1000000).toFixed(2)}M` },
            { label: t('executiveReport.achievement'), value: `${progress}%` },
            { label: t('executiveReport.ytdOrders'), value: orders.length },
          ].map((k) => (
            <Col xs={12} md={6} key={k.label}>
              <div className="metric-card-label">{k.label}</div>
              <div className="metric-card-value">{k.value}</div>
            </Col>
          ))}
        </Row>
        <Progress percent={progress} strokeColor="#ee2737" trailColor="#ece6df" style={{ marginTop: 16 }} />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('executiveReport.marketProgress')}>
            <Table
              dataSource={markets.map((m) => {
                const target = annualTargets.find((t) => t.market === m.code)
                const actual = target ? Math.round(target.revenueTargetUsd * 0.35) : 0
                return {
                  market: `${m.flag} ${m.code}`,
                  target: `$${(target?.revenueTargetUsd ?? 0).toLocaleString()}`,
                  actual: `$${actual.toLocaleString()}`,
                  progress: target ? Math.round((actual / target.revenueTargetUsd) * 100) : 0,
                }
              })}
              rowKey="market"
              pagination={false}
              columns={[
                { title: t('common.market'), dataIndex: 'market' },
                { title: t('common.target'), dataIndex: 'target' },
                { title: t('common.actual'), dataIndex: 'actual' },
                { title: t('common.progress'), dataIndex: 'progress', render: (v) => `${v}%` },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('executiveReport.topOpps')}>
            <Table
              dataSource={opportunities.slice(0, 4)}
              rowKey="id"
              pagination={false}
              columns={[
                { title: t('common.name'), dataIndex: 'name' },
                { title: t('executiveReport.amount'), dataIndex: 'amountUsd', render: (v) => `$${(v / 1000).toFixed(0)}k` },
                { title: t('executiveReport.stage'), dataIndex: 'stage' },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Card title={t('executiveReport.category')}>
        <Table
          dataSource={products}
          rowKey="id"
          pagination={false}
          columns={[
            { title: 'SKU', dataIndex: 'sku' },
            { title: t('common.name'), dataIndex: 'name' },
            { title: t('common.category'), dataIndex: 'category' },
            { title: t('common.price'), dataIndex: 'unitPrice', render: (v) => `$${v.toLocaleString()}` },
            { title: t('common.stock'), dataIndex: 'stock' },
          ]}
        />
      </Card>
    </div>
  )
}
