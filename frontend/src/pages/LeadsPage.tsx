import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Modal, Rate, Select, Table } from 'antd'
import { useMemo, useState } from 'react'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { formatCurrency, statusTone, type Lead } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useAuthStore } from '../store/useAuthStore'
import { useDataStore } from '../store/useDataStore'

const leadSources = ['campaign', 'website', 'referral', 'tradeshow', 'social', 'other']
const productLines = ['commercial', 'retail', 'industrial', 'public']
const oppStages = ['prospect', 'qualify', 'proposal', 'negotiate']

export function LeadsPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const campaigns = useDataStore((state) => state.campaigns)
  const leads = useDataStore((state) => state.leads)
  const users = useDataStore((state) => state.users)
  const accounts = useDataStore((state) => state.accounts)
  const refresh = useDataStore((state) => state.refresh)
  const currentUser = useAuthStore((state) => state.user)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [convertOpen, setConvertOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [createForm] = Form.useForm()
  const [convertForm] = Form.useForm()
  const clearCreateParam = useAutoCreate(setCreateOpen)

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const term = search.toLowerCase()
      const matchesSearch =
        l.name.toLowerCase().includes(term) ||
        l.companyName.toLowerCase().includes(term) ||
        l.email.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [leads, search, statusFilter])

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
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('leads.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            options={['all', 'new', 'contacted', 'qualified', 'converted'].map((value) => ({
              value,
              label: value === 'all' ? t('common.all') : t(`labels.leadStatus.${value}`),
            }))}
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
            {
              title: t('leads.rating'),
              dataIndex: 'rating',
              render: (value, record) => (
                <Rate
                  value={value}
                  onChange={async (rating) => {
                    await storageService.leads.update(record.id, { rating })
                    await refresh()
                  }}
                />
              ),
            },
            { title: t('leads.estValue'), dataIndex: 'estimatedValueUsd', render: (v) => formatCurrency(v) },
            { title: t('leads.status'), dataIndex: 'status', render: (v) => <span className={`pill pill-${statusTone(v)}`}>{t(`labels.leadStatus.${v}`)}</span> },
            { title: t('leads.owner'), dataIndex: 'ownerId', render: (id) => users.find((user) => user.id === id)?.name },
            { title: t('leads.lastContact'), dataIndex: 'lastContactedAt' },
            {
              title: t('common.actions'),
              key: 'action',
              render: (_, record) => (
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  disabled={record.status === 'converted'}
                  onClick={() => {
                    setSelectedLead(record)
                    convertForm.setFieldsValue({
                      accountCode: record.companyName.slice(0, 4).toUpperCase(),
                      accountName: record.companyName,
                      market: 'SG',
                      productLine: 'commercial',
                      oppStage: 'qualify',
                    })
                    setConvertOpen(true)
                  }}
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
        onOk={() => {
          convertForm.validateFields().then(async () => {
            if (!selectedLead) return
            await storageService.leads.update(selectedLead.id, { status: 'converted' })
            await refresh()
            setConvertOpen(false)
            setSelectedLead(null)
            success(t('common.successUpdate'))
          })
        }}
        width={560}
      >
        <Form form={convertForm} layout="vertical">
          <Form.Item label={t('leads.accountCode')} name="accountCode"><Input placeholder="RAFF" /></Form.Item>
          <Form.Item label={t('leads.accountName')} name="accountName"><Input placeholder="Raffles Hospitality" /></Form.Item>
          <Form.Item label={t('leads.market')} name="market">
            <Select options={accounts.map((a) => ({ value: a.market, label: a.market }))} />
          </Form.Item>
          <Form.Item label={t('leads.productLine')} name="productLine">
            <Select options={productLines.map((m) => ({ value: m, label: t(`labels.productLine.${m}`) }))} />
          </Form.Item>
          <Form.Item label={t('leads.oppStage')} name="oppStage">
            <Select options={oppStages.map((m) => ({ value: m, label: t(`labels.oppStage.${m}`) }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('leads.create')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); clearCreateParam(); createForm.resetFields() }}
        onOk={() => {
          createForm.validateFields().then(async (values) => {
            await storageService.leads.create({
              name: values.name,
              title: values.title ?? '',
              companyName: values.companyName,
              country: values.country ?? 'SG',
              email: values.email ?? '',
              phone: values.phone ?? '',
              status: 'new',
              source: values.source,
              campaignId: values.campaignId,
              rating: Number(values.rating ?? 3),
              estimatedValueUsd: Number(values.estimatedValueUsd ?? 0),
              ownerId: currentUser?.id ?? 'u1',
              lastContactedAt: '-',
              notes: values.notes ?? '',
            })
            await refresh()
            createForm.resetFields()
            setCreateOpen(false)
            clearCreateParam()
            success(t('common.successCreate'))
          })
        }}
        width={560}
      >
        <Form form={createForm} layout="vertical" initialValues={{ rating: 3, source: 'campaign' }}>
          <Form.Item label={t('leads.name')} name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label={t('leads.jobTitle')} name="title"><Input /></Form.Item>
          <Form.Item label={t('leads.company')} name="companyName" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Email" name="email"><Input /></Form.Item>
          <Form.Item label={t('leads.source')} name="source">
            <Select options={leadSources.map((v) => ({ value: v, label: t(`labels.leadSource.${v}`) }))} />
          </Form.Item>
          <Form.Item label={t('leads.campaign')} name="campaignId">
            <Select options={campaigns.map((c) => ({ value: c.id, label: c.code }))} />
          </Form.Item>
          <Form.Item label={t('leads.rating')} name="rating"><Rate /></Form.Item>
          <Form.Item label={t('leads.estValue')} name="estimatedValueUsd"><Input prefix="$" /></Form.Item>
          <Form.Item label={t('common.note')} name="notes"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
