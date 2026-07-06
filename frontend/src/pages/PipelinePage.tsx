import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, Modal, Row, Select, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useI18n } from '../hooks/useI18n'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { markets, type MarketCode, type Opportunity } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useDataStore } from '../store/useDataStore'

const { Text, Title } = Typography

const stages = ['prospect', 'qualify', 'proposal', 'negotiate', 'closedWon']

export function PipelinePage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const accounts = useDataStore((state) => state.accounts)
  const opportunities = useDataStore((state) => state.opportunities)
  const users = useDataStore((state) => state.users)
  const refresh = useDataStore((state) => state.refresh)
  const [search, setSearch] = useState('')
  const [marketFilter, setMarketFilter] = useState<MarketCode | 'all'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Opportunity | null>(null)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const clearCreateParam = useAutoCreate(setCreateOpen)

  const filtered = useMemo(() => {
    return opportunities.filter((item) => {
      const account = accounts.find((accountItem) => accountItem.id === item.accountId)
      const term = search.toLowerCase()
      const matchesSearch =
        item.name.toLowerCase().includes(term) ||
        account?.name.toLowerCase().includes(term) ||
        account?.code.toLowerCase().includes(term)
      const matchesMarket = marketFilter === 'all' || account?.market === marketFilter
      return matchesSearch && matchesMarket
    })
  }, [accounts, marketFilter, opportunities, search])

  const accountOptions = accounts.map((account) => ({ label: `${account.name} · ${account.market}`, value: account.id }))
  const ownerOptions = users.filter((user) => user.department === 'Sales' || user.role === 'Admin').map((user) => ({ label: user.name, value: user.id }))

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('pipeline.title')}</div>
          <div className="crm-page-header-desc">{t('pipeline.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('pipeline.newOpp')}</Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="pipeline-toolbar">
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('pipeline.searchPlaceholder') === 'pipeline.searchPlaceholder' ? '搜索客户 / 合同编号' : t('pipeline.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ width: 280 }}
          />
          <div className="filter-group">
            <button className={`filter-chip ${marketFilter === 'all' ? 'active' : ''}`} onClick={() => setMarketFilter('all')}>
              {t('common.all')}
            </button>
            {markets.map((market) => (
              <button
                key={market.code}
                className={`filter-chip ${marketFilter === market.code ? 'active' : ''}`}
                onClick={() => setMarketFilter(market.code)}
              >
                <span className="flag">{market.flag}</span>
                <span>{market.code}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="pipeline-board">
        {stages.map((stage) => {
          const items = filtered.filter((o) => o.stage === stage)
          const total = items.reduce((s, o) => s + o.amountUsd, 0)
          return (
            <div className="pipeline-column" key={stage}>
              <div className="pipeline-column-header">
                <Title level={5}>{t(`labels.oppStage.${stage}`)}</Title>
                <div className="pipeline-column-meta">
                  <span className="pipeline-count">{items.length}</span>
                  <span className="pipeline-total">${(total / 1000).toFixed(0)}k</span>
                </div>
              </div>
              <div className="pipeline-cards">
                {items.map((o) => (
                  <Card key={o.id} className="pipeline-card" bodyStyle={{ padding: 14 }}>
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      className="pipeline-card-edit"
                      onClick={() => {
                        setEditing(o)
                        editForm.setFieldsValue(o)
                      }}
                    />
                    <div className="pipeline-card-title">{o.name}</div>
                    <div className="pipeline-card-account">{accounts.find((a) => a.id === o.accountId)?.name}</div>
                    <div className="pipeline-card-footer">
                      <Tag color="blue">{o.probability}%</Tag>
                      <Text strong>${(o.amountUsd / 1000).toFixed(0)}k</Text>
                    </div>
                    <div className="pipeline-card-owner">{users.find((u) => u.id === o.ownerId)?.name}</div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <OpportunityModal
        title={t('pipeline.newOpp')}
        open={createOpen}
        form={form}
        accounts={accountOptions}
        owners={ownerOptions}
        onCancel={() => { setCreateOpen(false); clearCreateParam() }}
        onOk={() => {
          form.validateFields().then(async (values) => {
            await storageService.opportunities.create({
              accountId: values.accountId,
              name: values.name,
              amountUsd: Number(values.amountUsd ?? 0),
              stage: values.stage,
              probability: Number(values.probability ?? 20),
              expectedCloseDate: values.expectedCloseDate,
              ownerId: values.ownerId,
            })
            await refresh()
            form.resetFields()
            setCreateOpen(false)
            clearCreateParam()
            success(t('common.successCreate'))
          })
        }}
      />

      <OpportunityModal
        title={t('common.edit') === 'common.edit' ? '编辑商机' : t('common.edit')}
        open={!!editing}
        form={editForm}
        accounts={accountOptions}
        owners={ownerOptions}
        onCancel={() => setEditing(null)}
        onOk={() => {
          editForm.validateFields().then(async (values) => {
            if (!editing) return
            await storageService.opportunities.update(editing.id, {
              ...values,
              amountUsd: Number(values.amountUsd ?? editing.amountUsd),
              probability: Number(values.probability ?? editing.probability),
            })
            await refresh()
            setEditing(null)
            success(t('common.successUpdate'))
          })
        }}
      />

      <style>{`
        .pipeline-toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .pipeline-board { display: grid; grid-template-columns: repeat(5, minmax(220px, 1fr)); gap: 16px; overflow-x: auto; padding-bottom: 8px; }
        .pipeline-column { display: flex; flex-direction: column; gap: 12px; }
        .pipeline-column-header { display: flex; align-items: center; justify-content: space-between; }
        .pipeline-column-header h5 { margin: 0; font-size: 14px; }
        .pipeline-column-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .pipeline-count { min-width: 20px; height: 20px; border-radius: 999px; background: var(--angel-red); color: #fff; display: grid; place-items: center; font-weight: 700; }
        .pipeline-total { color: var(--text-muted); font-weight: 600; }
        .pipeline-cards { display: flex; flex-direction: column; gap: 10px; }
        .pipeline-card { border-left: 3px solid var(--angel-red); cursor: pointer; transition: box-shadow .15s ease; position: relative; }
        .pipeline-card-edit { position: absolute; top: 6px; right: 6px; }
        .pipeline-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }
        .pipeline-card-title { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
        .pipeline-card-account { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
        .pipeline-card-footer { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .pipeline-card-owner { font-size: 11px; color: var(--text-muted); }
        @media (max-width: 1200px) {
          .pipeline-board { grid-template-columns: repeat(5, 240px); }
        }
      `}</style>
    </div>
  )
}

function OpportunityModal({
  title,
  open,
  form,
  accounts,
  owners,
  onCancel,
  onOk,
}: {
  title: string
  open: boolean
  form: ReturnType<typeof Form.useForm>[0]
  accounts: { label: string; value: string }[]
  owners: { label: string; value: string }[]
  onCancel: () => void
  onOk: () => void
}) {
  const { t } = useI18n()
  return (
    <Modal title={title} open={open} onCancel={onCancel} onOk={onOk} width={620}>
      <Form form={form} layout="vertical" initialValues={{ stage: 'prospect', probability: 20 }}>
        <Form.Item label={t('accountDetail.form.oppName')} name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('orders.colAccount')} name="accountId" rules={[{ required: true }]}>
              <Select showSearch optionFilterProp="label" options={accounts} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('accountDetail.form.owner')} name="ownerId" rules={[{ required: true }]}>
              <Select options={owners} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('accountDetail.form.estimatedAmount')} name="amountUsd" rules={[{ required: true }]}>
              <Input prefix="$" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('accountDetail.form.winRate')} name="probability">
              <Select options={[20, 40, 60, 80, 100].map((value) => ({ value, label: `${value}%` }))} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('accountDetail.form.stage')} name="stage">
              <Select options={stages.map((stage) => ({ value: stage, label: t(`labels.oppStage.${stage}`) }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('accountDetail.form.expectedClose')} name="expectedCloseDate">
              <Input placeholder="2026-09-30" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
