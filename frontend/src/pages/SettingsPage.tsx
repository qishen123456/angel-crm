import { Button, Card, Form, Input, message, Switch, Table, Tabs, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { apiClient } from '../api/client'
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
const roles = ['SuperAdmin', 'Admin', 'Sales', 'Finance', 'Supply Chain', 'Orders', 'Legal', 'Marketing', 'Executive', 'Operations']

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
  const [importConfirm, setImportConfirm] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<Blob>('/data/export', { responseType: 'blob' })
      const blob = response.data
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      a.download = `angel-crm-migration-${timestamp}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      message.success('数据迁移包导出成功')
    } catch (error) {
      message.error('数据导出失败')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      message.error('仅支持 JSON 文件')
      return
    }

    setPendingFile(file)
    setImportConfirm(true)
  }

  const handleImport = async () => {
    if (!pendingFile) return

    setImportLoading(true)
    try {
      const text = await pendingFile.text()
      const data = JSON.parse(text)
      
      await apiClient.post('/data/import', data)
      
      await refresh()
      message.success('数据迁移包导入成功，页面已刷新')
    } catch (error) {
      message.error('数据导入失败，请检查文件格式')
    } finally {
      setImportLoading(false)
      setImportConfirm(false)
      setPendingFile(null)
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={5}>数据迁移包</Title>
      <Text style={{ color: '#ff4d4f' }}>
        ⚠️ 警告：导入迁移包将覆盖现有所有数据，请先导出备份！
      </Text>
      
      <Card style={{ marginTop: 16, borderColor: '#ee2737', borderWidth: 2, borderStyle: 'solid' }}>
        <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
          <div>
            <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 16 }}>📦 导出迁移包</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
              将后端所有业务数据打包成 JSON 文件，用于系统更新、环境迁移或数据备份。
              <br/>
              <span style={{ color: '#ee2737', fontWeight: 500 }}>包含：客户、联系人、合同、付款、活动、订单、商机等全部数据</span>
            </div>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={loading}
              onClick={handleExport}
              size="large"
            >
              导出迁移包
            </Button>
          </div>
          
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 16 }}>📥 导入迁移包</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
              导入之前导出的迁移包文件，覆盖现有数据库。
              <br/>
              <span style={{ color: '#ee2737', fontWeight: 500 }}>导入后不可撤销，请务必先导出当前数据！</span>
            </div>
            
            {!importConfirm ? (
              <>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="data-import-file"
                />
                <Button
                  icon={<UploadOutlined />}
                  loading={importLoading}
                  onClick={() => document.getElementById('data-import-file')?.click()}
                  size="large"
                >
                  选择迁移包导入
                </Button>
              </>
            ) : (
              <div>
                <div style={{ padding: 12, background: '#fff7e6', borderRadius: 8, marginBottom: 12 }}>
                  <Text strong>待导入文件：</Text>{pendingFile?.name}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button
                    type="primary"
                    danger
                    loading={importLoading}
                    onClick={handleImport}
                    size="large"
                  >
                    确认导入（覆盖数据）
                  </Button>
                  <Button
                    onClick={() => {
                      setImportConfirm(false)
                      setPendingFile(null)
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      <Card style={{ marginTop: 16 }}>
        <Title level={5}>使用流程</Title>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 2 }}>
          <ol>
            <li><strong>更新系统前：</strong>登录系统 → 设置 → 数据迁移包 → 点击「导出迁移包」</li>
            <li><strong>运行更新脚本：</strong>在服务器执行 <code>bash update.sh</code></li>
            <li><strong>更新系统后：</strong>登录系统 → 设置 → 数据迁移包 → 点击「选择迁移包导入」</li>
          </ol>
        </div>
      </Card>

      <Card style={{ marginTop: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}>
        <Title level={5}>💡 提示</Title>
        <ul style={{ fontSize: 13, color: '#52c41a', lineHeight: 2 }}>
          <li>迁移包文件格式：<code>angel-crm-migration-YYYY-MM-DDTHH-mm-ss.json</code></li>
          <li>文件大小取决于数据量，包含所有业务表的完整数据</li>
          <li>仅支持本系统导出的迁移包文件，不支持 CSV/Excel 等其他格式</li>
        </ul>
      </Card>
    </div>
  )
}
