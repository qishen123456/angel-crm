import { Card, Form, Input, Switch, Table, Tabs, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useI18n } from '../hooks/useI18n'
import {
  annualTargets,
  auditLogs,
  documentTemplates,
  markets,
  users,
} from '../mocks/crmData'

const { Text, Title } = Typography

const tabKeys = [
  'brand',
  'market',
  'department',
  'roles',
  'targets',
  'templates',
  'notifications',
  'audit',
  'account',
]

const roleModules = ['accounts', 'orders', 'contracts', 'reports', 'settings']
const roles = ['Admin', 'Sales', 'Finance', 'Supply Chain', 'Orders', 'Legal', 'Marketing', 'Executive', 'Operations']

export function SettingsPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('brand')
  const tabs = useMemo(() => tabKeys.map((k) => ({ key: k, label: t(`settings.tabs.${k}`) })), [t])

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('settings.title')}</div>
          <div className="crm-page-header-desc">{t('settings.subtitle')}</div>
        </div>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />
        <div style={{ marginTop: 16 }}>{renderTabContent(activeTab, t)}</div>
      </Card>
    </div>
  )
}

function renderTabContent(tab: string, t: (k: string) => string) {
  switch (tab) {
    case 'brand':
      return <BrandTab t={t} />
    case 'market':
      return <MarketsTab t={t} />
    case 'department':
      return <DepartmentsTab t={t} />
    case 'roles':
      return <RolesTab t={t} />
    case 'targets':
      return <TargetsTab t={t} />
    case 'templates':
      return <TemplatesTab t={t} />
    case 'notifications':
      return <NotificationsTab t={t} />
    case 'audit':
      return <AuditLogsTab t={t} />
    case 'account':
      return <AccountTab t={t} />
    default:
      return null
  }
}

function BrandTab({ t }: { t: (k: string) => string }) {
  const colors = [
    { name: 'ANGEL Red', hex: '#EE2737', pantone: 'PANTONE 1788C' },
    { name: 'Deep Red', hex: '#A5001E', pantone: 'PANTONE 3517C' },
    { name: 'ANGEL Black', hex: '#000000', pantone: 'PANTONE Black 6C' },
    { name: 'Grey', hex: '#BBC7D6', pantone: 'PANTONE 537C' },
    { name: 'Mibai', hex: '#EEEAE4', pantone: 'PANTONE 427C' },
    { name: 'White', hex: '#FFFFFF', pantone: '—' },
  ]

  return (
    <div>
      <Title level={5}>{t('settings.brand.logoRules')}</Title>
      <Text className="text-secondary">{t('settings.brand.vi')}</Text>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
        <Card title={t('settings.brand.sidebar')} headStyle={{ color: '#fff' }} style={{ background: '#1f2024', color: '#fff' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}><span style={{ color: '#ee2737' }}>A</span>NGEL</div>
        </Card>
        <Card title={t('settings.brand.headerLogin')}>
          <div style={{ fontSize: 24, fontWeight: 800 }}><span style={{ color: '#ee2737' }}>A</span>NGEL</div>
        </Card>
      </div>

      <Title level={5} style={{ marginTop: 24 }}>{t('settings.brand.brandColors')}</Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {colors.map((c) => (
          <Card key={c.name} bodyStyle={{ padding: 12 }}>
            <div style={{ height: 48, background: c.hex, border: '1px solid #ddd', borderRadius: 6, marginBottom: 8 }} />
            <Text strong>{c.name}</Text>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.hex} · {c.pantone}</div>
          </Card>
        ))}
      </div>

      <Title level={5} style={{ marginTop: 24 }}>{t('settings.brand.typography')}</Title>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <Text strong>{t('settings.brand.en')}</Text>
          <div style={{ fontSize: 18, fontFamily: "'Barlow', sans-serif", marginTop: 8 }}>Gotham / Barlow</div>
          <div style={{ fontSize: 14, fontFamily: "'Barlow', sans-serif" }}>Aa Bb Cc 0123 → ANGEL Health Technology</div>
        </Card>
        <Card>
          <Text strong>{t('settings.brand.zh')}</Text>
          <div style={{ fontSize: 18, marginTop: 8 }}>{t('settings.brand.zhFont')}</div>
          <div style={{ fontSize: 14 }}>{t('settings.brand.zhSample')}</div>
        </Card>
      </div>
    </div>
  )
}

function MarketsTab({ t }: { t: (k: string) => string }) {
  return (
    <Table
      dataSource={markets}
      rowKey="code"
      pagination={false}
      columns={[
        { title: t('settings.market.code'), dataIndex: 'code' },
        { title: t('settings.market.name'), dataIndex: 'name' },
        { title: t('settings.market.flag'), dataIndex: 'flag' },
      ]}
    />
  )
}

function DepartmentsTab({ t }: { t: (k: string) => string }) {
  const depts = Array.from(new Set(users.map((u) => u.department)))
  return (
    <Table
      dataSource={depts.map((d) => ({ name: d, headcount: users.filter((u) => u.department === d).length }))}
      rowKey="name"
      pagination={false}
      columns={[
        { title: t('settings.department.name'), dataIndex: 'name' },
        { title: t('settings.department.headcount'), dataIndex: 'headcount' },
      ]}
    />
  )
}

function RolesTab({ t }: { t: (k: string) => string }) {
  return (
    <Table
      dataSource={roles.map((r) => ({ role: r, ...Object.fromEntries(roleModules.map((m) => [m, t('labels.readWrite')])) }))}
      rowKey="role"
      pagination={false}
      columns={[
        { title: t('settings.roles.role'), dataIndex: 'role' },
        ...roleModules.map((m) => ({ title: t(`settings.roles.${m}`), dataIndex: m })),
      ]}
    />
  )
}

function TargetsTab({ t }: { t: (k: string) => string }) {
  return (
    <Table
      dataSource={annualTargets}
      rowKey="id"
      pagination={false}
      columns={[
        { title: t('settings.targets.market'), dataIndex: 'market' },
        { title: t('settings.targets.year'), dataIndex: 'year' },
        { title: t('settings.targets.revenueTarget'), dataIndex: 'revenueTargetUsd', render: (v) => `$${v.toLocaleString()}` },
        { title: t('settings.targets.kpiTarget'), dataIndex: 'kpiTargetUsd', render: (v) => `$${v.toLocaleString()}` },
        { title: t('settings.targets.strategicTarget'), dataIndex: 'strategicTargetUnits' },
      ]}
    />
  )
}

function TemplatesTab({ t }: { t: (k: string) => string }) {
  return (
    <Table
      dataSource={documentTemplates}
      rowKey="id"
      pagination={false}
      columns={[
        { title: t('settings.templates.type'), dataIndex: 'type' },
        { title: t('settings.templates.name'), dataIndex: 'name' },
        { title: t('settings.templates.description'), dataIndex: 'description' },
        { title: t('settings.templates.fileName'), dataIndex: 'fileName' },
        { title: t('settings.templates.enabled'), dataIndex: 'isActive', render: (v) => <Switch checked={v} /> },
      ]}
    />
  )
}

function NotificationsTab({ t }: { t: (k: string) => string }) {
  return (
    <Form layout="vertical">
      <Form.Item label={t('settings.notifications.email')}><Switch defaultChecked /></Form.Item>
      <Form.Item label={t('settings.notifications.contractExpiry')}><Switch defaultChecked /></Form.Item>
      <Form.Item label={t('settings.notifications.orderStatus')}><Switch defaultChecked /></Form.Item>
      <Form.Item label={t('settings.notifications.dailyReport')}><Switch /></Form.Item>
    </Form>
  )
}

function AuditLogsTab({ t }: { t: (k: string) => string }) {
  return (
    <Table
      dataSource={auditLogs}
      rowKey="id"
      pagination={false}
      columns={[
        { title: t('settings.audit.time'), dataIndex: 'createdAt' },
        { title: t('settings.audit.user'), dataIndex: 'userId' },
        { title: t('settings.audit.action'), dataIndex: 'action' },
        { title: t('settings.audit.target'), dataIndex: 'target' },
      ]}
    />
  )
}

function AccountTab({ t }: { t: (k: string) => string }) {
  return (
    <Form layout="vertical" style={{ maxWidth: 480 }}>
      <Form.Item label={t('settings.account.displayName')}><Input defaultValue={t('systemAdmin')} /></Form.Item>
      <Form.Item label={t('settings.account.email')}><Input defaultValue="admin@angel.cn" /></Form.Item>
      <Form.Item label={t('settings.account.currentPassword')}><Input.Password /></Form.Item>
      <Form.Item label={t('settings.account.newPassword')}><Input.Password /></Form.Item>
    </Form>
  )
}
