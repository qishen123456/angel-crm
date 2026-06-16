import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Modal, Select, Table } from 'antd'
import { useMemo, useState } from 'react'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { campaigns, formatCurrency, getUserById, leads, markets, statusTone } from '../mocks/crmData'

const leadSources = ['campaign', 'website', 'referral', 'tradeshow', 'social', 'other']
const leadRatings = ['A', 'B', 'C']
const productLines = ['commercial', 'retail', 'industrial', 'public']
const oppStages = ['prospect', 'qualify', 'proposal', 'negotiate']

export function LeadsPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const [search, setSearch] = useState('')
  const [convertOpen, setConvertOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const clearCreateParam = useAutoCreate(setCreateOpen)

  const filtered = useMemo(() => {
    return leads.filter((l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.companyName.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const kpiCards = [
    { label: t('leads.newLeads'), value: leads.filter((l) => l.status === 'new').length },
    { label: t('leads.contacted'), value: leads.filter((l) => l.status === 'contacted').length },
    { label: t('leads.qualified'), value: leads.filter((l) => l.status === 'qualified').length },
    { label: t('leads.converted'), value: leads.filter((l) => l.status === 'converted').length },
  ]

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('leads.title')}</div>
          <div className="crm-page-header-desc">{t('leads.subtitle')}</div>
        </div>
        <Button type="primary" onClick={() => setCreateOpen(true)}>+ {t('leads.create')}</Button>
      </div>

      <div className="kpi-cards-row">
        {kpiCards.map((k) => (
          <Card key={k.label} className="kpi-mini-card">
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
            placeholder={t('leads.searchPlaceholder')}
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
            { title: t('leads.name'), dataIndex: 'name' },
            { title: t('leads.jobTitle'), dataIndex: 'title' },
            { title: t('leads.company'), dataIndex: 'companyName' },
            { title: t('leads.source'), dataIndex: 'source', render: (v) => t(`labels.leadSource.${v}`) },
            { title: t('leads.campaign'), dataIndex: 'campaignId', render: (id) => campaigns.find((c) => c.id === id)?.code },
            { title: t('leads.rating'), dataIndex: 'rating' },
            { title: t('leads.estValue'), dataIndex: 'estimatedValueUsd', render: (v) => formatCurrency(v) },
            { title: t('leads.status'), dataIndex: 'status', render: (v) => <span className={`pill pill-${statusTone(v)}`}>{t(`labels.leadStatus.${v}`)}</span> },
            { title: t('leads.owner'), dataIndex: 'ownerId', render: (id) => getUserById(id)?.name },
            { title: t('leads.lastContact'), dataIndex: 'lastContactedAt' },
            {
              title: t('common.actions'),
              key: 'action',
              render: (_, record) => (
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  disabled={record.status === 'converted'}
                  onClick={() => setConvertOpen(true)}
                >
                  {t('leads.convert')}
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={t('leads.convertTitle')}
        open={convertOpen}
        onCancel={() => setConvertOpen(false)}
        onOk={() => { setConvertOpen(false); success(t('common.successUpdate')) }}
        width={560}
      >
        <Form layout="vertical">
          <Form.Item label={t('leads.accountCode')}><Input placeholder="RAFF" /></Form.Item>
          <Form.Item label={t('leads.accountName')}><Input placeholder="Raffles Hospitality" /></Form.Item>
          <Form.Item label={t('leads.market')}>
            <Select options={markets.map((m) => ({ value: m.code, label: `${m.flag} ${m.code}` }))} />
          </Form.Item>
          <Form.Item label={t('leads.productLine')}>
            <Select options={productLines.map((m) => ({ value: m, label: t(`labels.productLine.${m}`) }))} />
          </Form.Item>
          <Form.Item label={t('leads.oppStage')}>
            <Select options={oppStages.map((m) => ({ value: m, label: t(`labels.oppStage.${m}`) }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('leads.create')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); clearCreateParam() }}
        onOk={() => { setCreateOpen(false); clearCreateParam(); success(t('common.successCreate')) }}
        width={560}
      >
        <Form layout="vertical">
          <Form.Item label={t('leads.name')}><Input /></Form.Item>
          <Form.Item label={t('leads.company')}><Input /></Form.Item>
          <Form.Item label={t('leads.source')}>
            <Select options={leadSources.map((v) => ({ value: v, label: t(`labels.leadSource.${v}`) }))} />
          </Form.Item>
          <Form.Item label={t('leads.campaign')}>
            <Select options={campaigns.map((c) => ({ value: c.id, label: c.code }))} />
          </Form.Item>
          <Form.Item label={t('leads.rating')}>
            <Select options={leadRatings.map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item label={t('leads.estValue')}><Input prefix="$" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
