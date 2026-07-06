import {
  ArrowLeftOutlined,
  EditOutlined,
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Card, Col, Form, Input, Modal, Progress, Row, Select, Table, Tabs, Tag, Typography } from 'antd'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import {
  campaigns,
  contracts,
  flagForMarket,
  formatCurrency,
  getActivitiesByAccount,
  getContactsByAccount,
  getOpportunitiesByAccount,
  getOrdersByAccount,
  getPaymentsByAccount,
  getUserById,
  orders,
  payments,
  statusTone,
} from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useDataStore } from '../store/useDataStore'

const { Title, Text } = Typography

const tabKeys = [
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

export function AccountDetailPage() {
  const { id } = useParams<{ id: string }>()
  const accounts = useDataStore((state) => state.accounts)
  const refresh = useDataStore((state) => state.refresh)
  const account = accounts.find((item) => item.id === id)
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const [activeTab, setActiveTab] = useState('overview')
  const [editOpen, setEditOpen] = useState(false)
  const [oppOpen, setOppOpen] = useState(false)
  const [editForm] = Form.useForm()
  const [oppForm] = Form.useForm()

  if (!account) {
    return (
      <div className="crm-page">
        <Text>Account not found</Text>
        <Link to="/app/accounts">{t('accountDetail.back')}</Link>
      </div>
    )
  }

  const owner = getUserById(account.ownerId)
  const progress = Math.round((account.yearToDateUsd / account.annualTargetUsd) * 100)
  const totalRevenue = orders
    .filter((o) => o.accountId === account.id && o.status === 'completed')
    .reduce((s, o) => s + o.subtotalUsd, 0)
  const totalReceived = payments
    .filter((p) => p.accountId === account.id && p.status === 'confirmed')
    .reduce((s, p) => s + p.amountUsd, 0)
  const receivable = totalRevenue - totalReceived
  const activeOpps = getOpportunitiesByAccount(account.id)
  const wonOpps = activeOpps.filter((o) => o.stage === 'closedWon')

  const stats = [
    { label: t('accountDetail.cumulativeSales'), value: formatCurrency(totalRevenue) },
    { label: t('accountDetail.cumulativeReceipts'), value: formatCurrency(totalReceived) },
    { label: t('accountDetail.receivable'), value: formatCurrency(receivable) },
    { label: t('accountDetail.activeOpps'), value: activeOpps.length.toString() },
    { label: t('accountDetail.won'), value: wonOpps.length.toString() },
    { label: t('accountDetail.creditLimit'), value: '-' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab account={account} progress={progress} owner={owner} stats={stats} />
      case 'contacts':
        return <ContactsTab accountId={account.id} />
      case 'opportunities':
        return <OpportunitiesTab accountId={account.id} />
      case 'contracts':
        return <ContractsTab accountId={account.id} />
      case 'orders':
        return <OrdersTab accountId={account.id} />
      case 'payments':
        return <PaymentsTab accountId={account.id} />
      case 'activities':
        return <ActivitiesTab accountId={account.id} />
      case 'campaigns':
        return <CampaignsTab />
      case 'documents':
        return <DocumentsTab />
      default:
        return null
    }
  }

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <Link to="/app/accounts" className="back-link">
            <ArrowLeftOutlined /> {t('accountDetail.back')}
          </Link>
          <div className="crm-page-header-title" style={{ marginTop: 4 }}>
            {account.name}
            <Tag color={statusTone(account.contractStatus) === 'green' ? 'success' : statusTone(account.contractStatus) === 'amber' ? 'warning' : 'error'} style={{ marginLeft: 10 }}>
              {t(`labels.contractStatus.${account.contractStatus}`)}
            </Tag>
          </div>
          <div className="crm-page-header-desc">
            <span className="flag">{flagForMarket(account.market)}</span>
            {account.market} · {account.code} · {t('accounts.owner')}: {owner?.name ?? '-'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              editForm.setFieldsValue({
                ...account,
                annualTarget: account.annualTargetUsd,
              })
              setEditOpen(true)
            }}
          >
            {t('accountDetail.edit')}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOppOpen(true)}>{t('accountDetail.newOpp')}</Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((s) => (
          <Col xs={12} md={8} lg={4} key={s.label}>
            <Card>
              <div className="metric-card-label">{s.label}</div>
              <div className="metric-card-value">{s.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabKeys.map((k) => ({ key: k, label: t(`accountDetail.tabs.${k}`) }))}
        />
        <div style={{ marginTop: 16 }}>{renderTabContent()}</div>
      </Card>

      <Modal
        title={t('accountDetail.edit')}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={() => {
          editForm.validateFields().then(async (values) => {
            await storageService.accounts.update(account.id, {
              name: values.name,
              code: values.code,
              market: values.market,
              ownerId: values.ownerId,
              annualTargetUsd: Number(values.annualTarget ?? account.annualTargetUsd),
              opportunityNotes: values.opportunityNotes ?? account.opportunityNotes,
            })
            await refresh()
            setEditOpen(false)
            success(t('common.successUpdate'))
          })
        }}
        width={600}
      >
        <Form form={editForm} layout="vertical" initialValues={{ name: account.name, code: account.code, market: account.market, ownerId: account.ownerId }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item label={t('accountDetail.form.name')} name="name"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label={t('accountDetail.form.code')} name="code"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item label={t('accountDetail.form.market')} name="market"><Select options={['SG','HK','MY','TH','ID','MO','US'].map(m => ({value:m, label:m}))} /></Form.Item></Col>
            <Col span={12}><Form.Item label={t('accountDetail.form.owner')} name="ownerId"><Select options={['u2','u3','u4','u5'].map(id => ({value:id, label:getUserById(id)?.name}))} /></Form.Item></Col>
          </Row>
          <Form.Item label={t('accountDetail.form.annualTarget')} name="annualTarget"><Input prefix="$" /></Form.Item>
          <Form.Item label={t('accountDetail.form.opportunityNotes')}><Input.TextArea rows={4} defaultValue={account.opportunityNotes} /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('accountDetail.newOpp')}
        open={oppOpen}
        onCancel={() => setOppOpen(false)}
        onOk={() => {
          oppForm.validateFields().then(async (values) => {
            await storageService.opportunities.create({
              accountId: account.id,
              name: values.name,
              amountUsd: Number(values.amountUsd ?? 0),
              probability: Number(values.probability ?? 20),
              stage: values.stage,
              expectedCloseDate: values.expectedCloseDate,
              ownerId: account.ownerId,
            })
            await refresh()
            oppForm.resetFields()
            setOppOpen(false)
            success(t('common.successCreate'))
          })
        }}
        width={560}
      >
        <Form form={oppForm} layout="vertical" initialValues={{ stage: 'prospect', probability: '20' }}>
          <Form.Item label={t('accountDetail.form.oppName')} name="name" rules={[{ required: true }]}><Input placeholder={t('accountDetail.form.oppNamePlaceholder')} /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item label={t('accountDetail.form.estimatedAmount')} name="amountUsd"><Input prefix="$" /></Form.Item></Col>
            <Col span={12}><Form.Item label={t('accountDetail.form.winRate')} name="probability"><Select options={['20','40','60','80','100'].map(v => ({value:v, label:v+'%'}))} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item label={t('accountDetail.form.stage')} name="stage"><Select options={['prospect','qualify','proposal','negotiate'].map(v => ({value:v, label:t(`accountDetail.stage.${v}`)}))} /></Form.Item></Col>
            <Col span={12}><Form.Item label={t('accountDetail.form.expectedClose')} name="expectedCloseDate"><Input placeholder={t('accountDetail.form.expectedClosePlaceholder')} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <style>{`
        .back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 12px; text-decoration: none; }
        .back-link:hover { color: var(--angel-red); }
      `}</style>
    </div>
  )
}

function OverviewTab({ account, progress, owner }: any) {
  const { t } = useI18n()
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card title={t('accountDetail.card.opportunityMining')} style={{ marginBottom: 16 }}>
          <div className="opportunity-note-card" style={{ background: '#f8f7f4', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <Title level={5}>{t('accountDetail.b2bInProgress')}</Title>
            <Text>{account.opportunityNotes}</Text>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>{t('accountDetail.customerResources')}</Text>
            <Text className="text-secondary">{account.customerResources}</Text>
          </div>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>{t('accountDetail.deepDiveDirection')}</Text>
            <Text className="text-secondary" style={{ whiteSpace: 'pre-line' }}>{account.nextDigDirections}</Text>
          </div>
        </Card>

        <Card title={t('accountDetail.card.annualTargetProgress')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text strong>{t('accountDetail.profile.annualTarget')}</Text>
            <Text className="text-muted">{formatCurrency(account.yearToDateUsd)} / {formatCurrency(account.annualTargetUsd)} · {progress}%</Text>
          </div>
          <Progress percent={progress} strokeColor="#ee2737" trailColor="#ece6df" />
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title={t('accountDetail.card.profile')}>
          <div className="profile-list">
            {[
              [t('accountDetail.profile.country'), flagForMarket(account.market) + ' ' + account.market],
              [t('accountDetail.profile.market'), account.market],
              [t('accountDetail.profile.company'), 'AHT Global Sales'],
              [t('accountDetail.profile.paymentTerms'), 'Net 30'],
              [t('accountDetail.profile.creditLimit'), '-'],
              [t('accountDetail.profile.annualTarget'), formatCurrency(account.annualTargetUsd)],
              [t('accountDetail.profile.ytdSales'), formatCurrency(account.yearToDateUsd)],
              [t('accountDetail.profile.owner'), owner?.name ?? '-'],
            ].map(([k, v]) => (
              <div className="profile-row" key={k}>
                <Text className="text-muted">{k}</Text>
                <Text strong>{v}</Text>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t('accountDetail.card.keyContacts')} style={{ marginTop: 16 }} extra={<Button type="text" icon={<PlusOutlined />}>{t('accountDetail.add')}</Button>}>
          {getContactsByAccount(account.id).slice(0, 2).map((c) => (
            <div key={c.id} className="contact-row">
              <Avatar size={36} style={{ background: '#0f172a' }}>{c.name.slice(0, 1)}</Avatar>
              <div>
                <Text strong>{c.name}</Text>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.title}</div>
                <div style={{ fontSize: 12, display: 'flex', gap: 8, marginTop: 2 }}>
                  <span><PhoneOutlined /> {c.phone}</span>
                  <span><MailOutlined /> {c.email}</span>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </Col>

      <style>{`
        .profile-list { display: flex; flex-direction: column; gap: 10px; }
        .profile-row { display: flex; justify-content: space-between; font-size: 13px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .profile-row:last-child { border-bottom: none; padding-bottom: 0; }
        .contact-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        .contact-row:last-child { margin-bottom: 0; }
      `}</style>
    </Row>
  )
}

function ContactsTab({ accountId }: { accountId: string }) {
  const { t } = useI18n()
  const data = getContactsByAccount(accountId)
  return (
    <Table
      dataSource={data}
      rowKey="id"
      pagination={false}
      columns={[
        { title: t('accountDetail.col.name'), dataIndex: 'name' },
        { title: t('accountDetail.col.title'), dataIndex: 'title' },
        { title: t('accountDetail.col.email'), dataIndex: 'email' },
        { title: t('accountDetail.col.phone'), dataIndex: 'phone' },
        { title: t('accountDetail.col.primaryContact'), dataIndex: 'isPrimary', render: (v) => v ? <Tag color="success">{t('accountDetail.col.yes')}</Tag> : '-' },
      ]}
    />
  )
}

function OpportunitiesTab({ accountId }: { accountId: string }) {
  const { t } = useI18n()
  const data = getOpportunitiesByAccount(accountId)
  return (
    <Table
      dataSource={data}
      rowKey="id"
      pagination={false}
      columns={[
        { title: t('accountDetail.col.oppName'), dataIndex: 'name' },
        { title: t('accountDetail.col.amount'), dataIndex: 'amountUsd', render: (v) => formatCurrency(v) },
        { title: t('accountDetail.col.stage'), dataIndex: 'stage', render: (v) => t(`labels.oppStage.${v}`) },
        { title: t('accountDetail.col.winRate'), dataIndex: 'probability', render: (v) => `${v}%` },
        { title: t('accountDetail.col.expectedClose'), dataIndex: 'expectedCloseDate' },
      ]}
    />
  )
}

function ContractsTab({ accountId }: { accountId: string }) {
  const { t } = useI18n()
  const data = contracts.filter((c) => c.accountId === accountId)
  return (
    <Table
      dataSource={data}
      rowKey="id"
      pagination={false}
      columns={[
        { title: t('accountDetail.col.contractNumber'), dataIndex: 'contractNumber' },
        { title: t('accountDetail.col.name'), dataIndex: 'name' },
        { title: t('accountDetail.col.type'), dataIndex: 'type', render: (v) => t(`labels.contractType.${v}`) },
        { title: t('accountDetail.col.status'), dataIndex: 'status', render: (v) => t(`labels.contractStatus.${v}`) },
        { title: t('accountDetail.col.amount'), dataIndex: 'amountUsd', render: (v) => formatCurrency(v) },
        { title: t('accountDetail.col.expiryDate'), dataIndex: 'expiryDate' },
      ]}
    />
  )
}

function OrdersTab({ accountId }: { accountId: string }) {
  const { t } = useI18n()
  const data = getOrdersByAccount(accountId)
  return (
    <Table
      dataSource={data}
      rowKey="id"
      pagination={false}
      columns={[
        { title: t('accountDetail.col.orderNumber'), dataIndex: 'orderNumber' },
        { title: t('accountDetail.col.piNumber'), dataIndex: 'piNumber' },
        { title: t('accountDetail.col.amount'), dataIndex: 'subtotalUsd', render: (v) => formatCurrency(v) },
        { title: t('accountDetail.col.type'), dataIndex: 'orderType', render: (v) => t(`labels.orderType.${v}`) },
        { title: t('accountDetail.col.status'), dataIndex: 'status', render: (v) => t(`labels.orderStatus.${v}`) },
        { title: t('accountDetail.col.createdAt'), dataIndex: 'createdAt' },
      ]}
    />
  )
}

function PaymentsTab({ accountId }: { accountId: string }) {
  const { t } = useI18n()
  const data = getPaymentsByAccount(accountId)
  return (
    <Table
      dataSource={data}
      rowKey="id"
      pagination={false}
      columns={[
        { title: t('accountDetail.col.receivedAt'), dataIndex: 'receivedAt' },
        { title: t('accountDetail.col.amount'), dataIndex: 'amountUsd', render: (v) => formatCurrency(v) },
        { title: t('accountDetail.col.currency'), dataIndex: 'currency' },
        { title: t('accountDetail.col.method'), dataIndex: 'method', render: (v) => t(`labels.paymentMethod.${v}`) },
        { title: t('accountDetail.col.status'), dataIndex: 'status', render: (v) => t(`labels.paymentStatus.${v}`) },
      ]}
    />
  )
}

function ActivitiesTab({ accountId }: { accountId: string }) {
  const { t } = useI18n()
  const data = getActivitiesByAccount(accountId)
  return (
    <Table
      dataSource={data}
      rowKey="id"
      pagination={false}
      columns={[
        { title: t('accountDetail.col.time'), dataIndex: 'createdAt' },
        { title: t('accountDetail.col.type'), dataIndex: 'type', render: (v) => t(`labels.activityType.${v}`) },
        { title: t('accountDetail.col.content'), dataIndex: 'content' },
        { title: t('accountDetail.col.recorder'), dataIndex: 'createdById', render: (id) => getUserById(id)?.name ?? id },
      ]}
    />
  )
}

function CampaignsTab() {
  const { t } = useI18n()
  return (
    <Table
      dataSource={campaigns}
      rowKey="id"
      pagination={false}
      columns={[
        { title: t('accountDetail.col.campaignCode'), dataIndex: 'code' },
        { title: t('accountDetail.col.campaignName'), dataIndex: 'name' },
        { title: t('accountDetail.col.status'), dataIndex: 'status', render: (v) => t(`labels.campaignStatus.${v}`) },
        { title: t('accountDetail.col.convertedAmount'), dataIndex: 'opportunityValueUsd', render: (v) => formatCurrency(v) },
      ]}
    />
  )
}

function DocumentsTab() {
  const { t } = useI18n()
  return (
    <Table
      dataSource={[
        { name: 'Raffles-PO-2026-05-08.pdf', typeKey: 'po', date: '2026-05-30' },
        { name: 'AHT-Receipt-Raffles-001.pdf', typeKey: 'receipt', date: '2026-05-28' },
      ]}
      rowKey="name"
      pagination={false}
      columns={[
        { title: t('accountDetail.col.fileName'), dataIndex: 'name', render: (v) => <span><FileTextOutlined style={{ marginRight: 6 }} />{v}</span> },
        { title: t('accountDetail.col.type'), dataIndex: 'typeKey', render: (v) => t(`accountDetail.docType.${v}`) },
        { title: t('accountDetail.col.uploadDate'), dataIndex: 'date' },
      ]}
    />
  )
}
