import { Button, Card, Form, Input, message, Switch, Table, Tabs, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { useI18n } from '../hooks/useI18n'
import { useDataStore } from '../store/useDataStore'
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
  'data',
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
    case 'data':
      return <DataTab t={t} />
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

function DataTab({}: { t: (k: string) => string }) {
  const refresh = useDataStore((s) => s.refresh)
  const [loading, setLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/data/export')
      if (!response.ok) throw new Error('导出失败')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `angel-crm-backup-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      message.success('数据导出成功')
    } catch (error) {
      message.error('数据导出失败')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportLoading(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      const response = await fetch('/api/data/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('导入失败')
      
      await refresh()
      message.success('数据导入成功，页面已刷新')
    } catch (error) {
      message.error('数据导入失败，请检查文件格式')
    } finally {
      setImportLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={5}>数据备份与恢复</Title>
      <Text style={{ color: '#ff4d4f' }}>
        ⚠️ 警告：导入数据将覆盖现有所有数据，请先导出备份！
      </Text>
      
      <Card style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>导出数据</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
              将所有数据导出为 JSON 文件，用于备份或迁移到其他环境。
            </div>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={loading}
              onClick={handleExport}
            >
              导出数据
            </Button>
          </div>
          
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>导入数据</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
              导入之前导出的 JSON 文件，覆盖现有数据。
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
              id="data-import-file"
            />
            <Button
              icon={<UploadOutlined />}
              loading={importLoading}
              onClick={() => document.getElementById('data-import-file')?.click()}
            >
              选择文件导入
            </Button>
          </div>
        </div>
      </Card>
      
      <Card style={{ marginTop: 16 }}>
        <Title level={5}>使用说明</Title>
        <ul style={{ fontSize: 13, color: '#666', lineHeight: 2 }}>
          <li><strong>更新系统前：</strong>点击「导出数据」备份当前数据</li>
          <li><strong>更新系统后：</strong>点击「导入数据」恢复之前备份的数据</li>
          <li><strong>文件格式：</strong>仅支持本系统导出的 JSON 文件</li>
          <li><strong>数据范围：</strong>包含客户、联系人、合同、付款、活动等所有业务数据</li>
        </ul>
      </Card>
    </div>
  )
}
