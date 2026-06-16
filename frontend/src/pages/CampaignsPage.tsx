import { BarChartOutlined, DollarOutlined, SearchOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons'
import { Button, Card, Col, DatePicker, Form, Input, Modal, Row, Select, Table, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { campaigns, formatCurrency, getUserById, leads, markets, statusTone, type Campaign } from '../mocks/crmData'

const { Text } = Typography

const campaignTypes = ['tradeshow', 'paidAds', 'webinar', 'referral']
const campaignStatuses = ['active', 'completed']

export function CampaignsPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const clearCreateParam = useAutoCreate(setCreateOpen)

  const filtered = useMemo(() => {
    return campaigns.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const kpi = {
    totalBudget: campaigns.reduce((s, c) => s + c.budgetUsd, 0),
    totalSpend: campaigns.reduce((s, c) => s + c.actualSpendUsd, 0),
    totalLeads: campaigns.reduce((s, c) => s + c.leadCount, 0),
    totalConverted: campaigns.reduce((s, c) => s + c.convertedCount, 0),
    totalPipeline: campaigns.reduce((s, c) => s + c.opportunityValueUsd, 0),
  }

  const kpiCards = [
    { icon: <DollarOutlined />, label: t('campaigns.totalBudget'), value: formatCurrency(kpi.totalBudget) },
    { icon: <DollarOutlined />, label: t('campaigns.totalSpend'), value: formatCurrency(kpi.totalSpend) },
    { icon: <TeamOutlined />, label: t('campaigns.totalLeads'), value: kpi.totalLeads },
    { icon: <TrophyOutlined />, label: t('campaigns.converted'), value: kpi.totalConverted },
    { icon: <BarChartOutlined />, label: t('campaigns.pipeline'), value: formatCurrency(kpi.totalPipeline) },
  ]

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('campaigns.title')}</div>
          <div className="crm-page-header-desc">{t('campaigns.subtitle')}</div>
        </div>
        <Button type="primary" onClick={() => setCreateOpen(true)}>+ {t('campaigns.create')}</Button>
      </div>

      <div className="kpi-cards-row">
        {kpiCards.map((k) => (
          <Card key={k.label} className="kpi-mini-card">
            <div className="kpi-mini-icon">{k.icon}</div>
            <div>
              <div className="metric-card-label">{k.label}</div>
              <div className="metric-card-value">{k.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('campaigns.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
        </div>
        <Table
          dataSource={filtered}
          rowKey="id"
          pagination={false}
          columns={[
            { title: t('campaigns.code'), dataIndex: 'code' },
            { title: t('campaigns.name'), dataIndex: 'name' },
            { title: t('campaigns.type'), dataIndex: 'type', render: (v) => t(`labels.campaignType.${v}`) },
            { title: t('campaigns.status'), dataIndex: 'status', render: (v) => <span className={`pill pill-${statusTone(v)}`}>{t(`labels.campaignStatus.${v}`)}</span> },
            { title: t('campaigns.budget'), dataIndex: 'budgetUsd', render: (v) => formatCurrency(v) },
            { title: t('campaigns.leads'), dataIndex: 'leadCount' },
            { title: t('campaigns.convertedCount'), dataIndex: 'convertedCount' },
            { title: t('campaigns.oppValue'), dataIndex: 'opportunityValueUsd', render: (v) => formatCurrency(v) },
            { title: t('campaigns.roi'), render: (_, r: Campaign) => `${(r.opportunityValueUsd / r.budgetUsd).toFixed(1)}x` },
            { title: t('campaigns.owner'), dataIndex: 'ownerId', render: (id) => getUserById(id)?.name },
            {
              title: t('common.actions'),
              key: 'action',
              render: (_, record) => (
                <Button type="text" onClick={() => setSelected(record)}>{t('campaigns.detail')}</Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={selected?.name}
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={720}
      >
        {selected && (
          <div>
            <div className="campaign-modal-meta">
              <div><Text className="text-muted">{t('campaigns.code')}</Text><div><Text strong>{selected.code}</Text></div></div>
              <div><Text className="text-muted">{t('campaigns.type')}</Text><div><Text strong>{t(`labels.campaignType.${selected.type}`)}</Text></div></div>
              <div><Text className="text-muted">{t('campaigns.status')}</Text><div><span className={`pill pill-${statusTone(selected.status)}`}>{t(`labels.campaignStatus.${selected.status}`)}</span></div></div>
              <div><Text className="text-muted">{t('pages.countryReports')}</Text><div><Text strong>{selected.market}</Text></div></div>
            </div>
            <Card title={t('campaigns.leadsTitle')} style={{ marginTop: 16 }}>
              <Table
                dataSource={leads.filter((l) => l.campaignId === selected.id)}
                rowKey="id"
                pagination={false}
                columns={[
                  { title: t('campaigns.contactName'), dataIndex: 'name' },
                  { title: t('campaigns.company'), dataIndex: 'companyName' },
                  { title: t('campaigns.status'), dataIndex: 'status', render: (v) => <span className={`pill pill-${statusTone(v)}`}>{t(`labels.leadStatus.${v}`)}</span> },
                  { title: t('campaigns.estValue'), dataIndex: 'estimatedValueUsd', render: (v) => formatCurrency(v) },
                ]}
              />
            </Card>
          </div>
        )}
      </Modal>

      <Modal
        title={t('campaigns.create')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); clearCreateParam() }}
        onOk={() => { setCreateOpen(false); clearCreateParam(); success(t('common.successCreate')) }}
        width={560}
      >
        <Form layout="vertical">
          <Form.Item label={t('campaigns.name')}><Input /></Form.Item>
          <Form.Item label={t('campaigns.type')}>
            <Select options={campaignTypes.map((v) => ({ value: v, label: t(`labels.campaignType.${v}`) }))} />
          </Form.Item>
          <Form.Item label={t('campaigns.status')}>
            <Select options={campaignStatuses.map((v) => ({ value: v, label: t(`labels.campaignStatus.${v}`) }))} />
          </Form.Item>
          <Form.Item label={t('pages.countryReports')}>
            <Select options={markets.map((m) => ({ value: m.code, label: `${m.flag} ${m.code}` }))} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item label={t('campaigns.budget')}><Input prefix="$" /></Form.Item></Col>
            <Col span={12}><Form.Item label={t('common.date')}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <style>{`
        .kpi-cards-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
        .kpi-mini-card .ant-card-body { display: flex; align-items: center; gap: 14px; padding: 16px; }
        .kpi-mini-icon { width: 40px; height: 40px; border-radius: 8px; background: #f8f7f4; display: grid; place-items: center; font-size: 18px; color: var(--angel-red); }
        .campaign-modal-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      `}</style>
    </div>
  )
}
