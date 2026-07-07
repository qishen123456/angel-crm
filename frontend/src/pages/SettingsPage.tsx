import { Button, Card, Form, Input, message, Switch, Table, Tabs, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { apiClient } from '../api/client'
import { useI18n } from '../hooks/useI18n'
import { useDataStore } from '../store/useDataStore'
import { useAuthStore } from '../store/useAuthStore'
import { useSystemSettingsStore } from '../store/useSystemSettingsStore'
import { storageService } from '../services/storageService'
import {
  annualTargets,
  auditLogs,
  type DocumentTemplate,
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
  const tabs = useMemo(
    () =>
      tabKeys.map((k) => ({
        key: k,
        label: t(`settings.tabs.${k}`),
        children: renderTabContent(k, t),
      })),
    [t]
  )

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('settings.title')}</div>
          <div className="crm-page-header-desc">{t('settings.subtitle')}</div>
        </div>
      </div>

      <Card>
        <Tabs defaultActiveKey="brand" items={tabs} />
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
  const settings = useSystemSettingsStore((s) => s.settings)
  const saveSettings = useSystemSettingsStore((s) => s.save)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue(settings)
  }, [form, settings])

  const colors = [
    { field: 'primaryColor', name: '主品牌色', hex: settings.primaryColor, desc: '按钮、Tabs、高亮、重点操作' },
    { field: 'dangerColor', name: '深色强调', hex: settings.dangerColor, desc: '按钮 hover、深红强调' },
    { field: 'pageBackground', name: '页面背景', hex: settings.pageBackground, desc: '系统主内容区背景' },
    { field: 'sidebarBackground', name: '侧栏背景', hex: settings.sidebarBackground, desc: '左侧导航背景' },
    { field: 'sidebarActiveBackground', name: '侧栏选中', hex: settings.sidebarActiveBackground, desc: '当前菜单高亮背景' },
    { field: 'headerBackground', name: '顶栏背景', hex: settings.headerBackground, desc: '顶部区域背景' },
  ] as const

  const handleSave = async (values: {
    brandName: string
    brandSubtitle: string
    primaryColor: string
    dangerColor: string
    pageBackground: string
    sidebarBackground: string
    sidebarActiveBackground: string
    headerBackground: string
  }) => {
    setSaving(true)
    try {
      await saveSettings(values)
      message.success('品牌主题已保存')
    } catch {
      message.error('品牌主题保存失败，请确认当前账号有权限')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Title level={5}>{t('settings.brand.logoRules')}</Title>
      <Text className="text-secondary">{t('settings.brand.vi')}</Text>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
        <Card title={t('settings.brand.sidebar')} headStyle={{ color: '#fff' }} style={{ background: settings.sidebarBackground, color: '#fff' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
            <span style={{ color: settings.primaryColor }}>{settings.brandName.slice(0, 1)}</span>
            {settings.brandName.slice(1)}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{settings.brandSubtitle}</div>
        </Card>
        <Card title={t('settings.brand.headerLogin')} style={{ background: settings.headerBackground }}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            <span style={{ color: settings.primaryColor }}>{settings.brandName.slice(0, 1)}</span>
            {settings.brandName.slice(1)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{settings.brandSubtitle}</div>
        </Card>
      </div>

      <Title level={5} style={{ marginTop: 24 }}>品牌主题配置</Title>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item label="品牌名称" name="brandName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="品牌副标题" name="brandSubtitle" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {colors.map((c) => (
            <Form.Item key={c.field} label={c.name} name={c.field} rules={[{ required: true, pattern: /^#[0-9a-fA-F]{6}$/ }]}>
              <Input type="color" style={{ height: 40, padding: 4 }} />
            </Form.Item>
          ))}
        </div>
        <Button type="primary" htmlType="submit" loading={saving}>
          保存品牌主题
        </Button>
      </Form>

      <Title level={5} style={{ marginTop: 24 }}>{t('settings.brand.brandColors')}</Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {colors.map((c) => (
          <Card key={c.name} bodyStyle={{ padding: 12 }}>
            <div style={{ height: 48, background: c.hex, border: '1px solid #ddd', borderRadius: 6, marginBottom: 8 }} />
            <Text strong>{c.name}</Text>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.hex} · {c.desc}</div>
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
  const [items, setItems] = useState<DocumentTemplate[]>(documentTemplates)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    storageService.documentTemplates
      .getAll()
      .then((data) => setItems(data.length ? data : documentTemplates))
      .catch(() => setItems(documentTemplates))
  }, [])

  const handleToggle = async (record: DocumentTemplate, checked: boolean) => {
    const previous = items
    setSavingId(record.id)
    setItems((current) => current.map((item) => (item.id === record.id ? { ...item, isActive: checked } : item)))
    try {
      await storageService.documentTemplates.update(record.id, { isActive: checked })
      message.success(checked ? '模板已启用' : '模板已停用')
    } catch {
      setItems(previous)
      message.error('模板状态保存失败，请确认当前账号有权限')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Table
      dataSource={items}
      rowKey="id"
      pagination={false}
      columns={[
        { title: t('settings.templates.type'), dataIndex: 'type' },
        { title: t('settings.templates.name'), dataIndex: 'name' },
        { title: t('settings.templates.description'), dataIndex: 'description' },
        { title: t('settings.templates.fileName'), dataIndex: 'fileName' },
        {
          title: t('settings.templates.enabled'),
          dataIndex: 'isActive',
          render: (v, record) => (
            <Switch checked={v} loading={savingId === record.id} onChange={(checked) => handleToggle(record, checked)} />
          ),
        },
      ]}
    />
  )
}

function NotificationsTab({ t }: { t: (k: string) => string }) {
  const systemSettings = useSystemSettingsStore((s) => s.settings)
  const saveSettings = useSystemSettingsStore((s) => s.save)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const updateSetting = async (key: keyof typeof systemSettings.notificationSettings, checked: boolean) => {
    setSavingKey(key)
    try {
      await saveSettings({
        notificationSettings: {
          ...systemSettings.notificationSettings,
          [key]: checked,
        },
      })
      message.success('通知设置已保存')
    } catch {
      message.error('通知设置保存失败，请确认当前账号有权限')
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <Form layout="vertical" style={{ maxWidth: 520 }}>
      <Form.Item label={t('settings.notifications.email')}>
        <Switch checked={systemSettings.notificationSettings.email} loading={savingKey === 'email'} onChange={(checked) => updateSetting('email', checked)} />
      </Form.Item>
      <Form.Item label={t('settings.notifications.contractExpiry')}>
        <Switch checked={systemSettings.notificationSettings.contractExpiry} loading={savingKey === 'contractExpiry'} onChange={(checked) => updateSetting('contractExpiry', checked)} />
      </Form.Item>
      <Form.Item label={t('settings.notifications.orderStatus')}>
        <Switch checked={systemSettings.notificationSettings.orderStatus} loading={savingKey === 'orderStatus'} onChange={(checked) => updateSetting('orderStatus', checked)} />
      </Form.Item>
      <Form.Item label={t('settings.notifications.dailyReport')}>
        <Switch checked={systemSettings.notificationSettings.dailyReport} loading={savingKey === 'dailyReport'} onChange={(checked) => updateSetting('dailyReport', checked)} />
      </Form.Item>
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
  const user = useAuthStore((s) => s.user)
  const [saving, setSaving] = useState(false)

  const handleFinish = async (values: { displayName: string; email: string; currentPassword?: string; newPassword?: string }) => {
    setSaving(true)
    try {
      if (user?.id) {
        await storageService.users.update(user.id, { name: values.displayName, email: values.email })
      }
      if (values.newPassword) {
        message.warning('账号资料已保存；独立密码修改接口还在后续计划中')
      } else {
        message.success('账号资料已保存')
      }
    } catch {
      message.error('账号资料保存失败，请确认当前账号有权限')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form
      layout="vertical"
      style={{ maxWidth: 480 }}
      initialValues={{ displayName: user?.name ?? t('systemAdmin'), email: user?.email ?? 'admin@angel.cn' }}
      onFinish={handleFinish}
    >
      <Form.Item label={t('settings.account.displayName')} name="displayName" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label={t('settings.account.email')} name="email" rules={[{ required: true, type: 'email' }]}>
        <Input />
      </Form.Item>
      <Form.Item label={t('settings.account.currentPassword')} name="currentPassword">
        <Input.Password />
      </Form.Item>
      <Form.Item label={t('settings.account.newPassword')} name="newPassword">
        <Input.Password />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={saving}>
        保存账户设置
      </Button>
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
