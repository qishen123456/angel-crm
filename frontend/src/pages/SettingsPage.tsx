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
  type SystemSettings,
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

const themePresets = [
  {
    id: 'angel-red',
    name: 'ANGEL 红',
    desc: '默认品牌主题，强调销售动作和关键提醒。',
    primaryColor: '#ee2737',
    dangerColor: '#a5001e',
    pageBackground: '#eeeae4',
    sidebarBackground: '#1f2024',
    sidebarActiveBackground: '#5a2429',
    headerBackground: '#ffffff',
  },
  {
    id: 'ocean-blue',
    name: '海洋蓝',
    desc: '更冷静的经营后台观感，适合长时间看报表。',
    primaryColor: '#2563eb',
    dangerColor: '#1d4ed8',
    pageBackground: '#eef4fb',
    sidebarBackground: '#172033',
    sidebarActiveBackground: '#1e3a8a',
    headerBackground: '#ffffff',
  },
  {
    id: 'forest-green',
    name: '森林绿',
    desc: '稳健、柔和，适合运营和供应链场景。',
    primaryColor: '#0f9f6e',
    dangerColor: '#047857',
    pageBackground: '#eef6f1',
    sidebarBackground: '#16251f',
    sidebarActiveBackground: '#14532d',
    headerBackground: '#ffffff',
  },
  {
    id: 'executive-dark',
    name: '商务黑',
    desc: '对比更强，适合会议投屏和管理层看板。',
    primaryColor: '#f43f5e',
    dangerColor: '#be123c',
    pageBackground: '#f4f4f5',
    sidebarBackground: '#111113',
    sidebarActiveBackground: '#3f1d2b',
    headerBackground: '#ffffff',
  },
  {
    id: 'clean-light',
    name: '明亮白',
    desc: '弱化背景色，界面更轻，适合日常录入。',
    primaryColor: '#dc2626',
    dangerColor: '#991b1b',
    pageBackground: '#f8fafc',
    sidebarBackground: '#20242c',
    sidebarActiveBackground: '#4c1d1d',
    headerBackground: '#ffffff',
  },
] satisfies Array<
  Pick<
    SystemSettings,
    | 'primaryColor'
    | 'dangerColor'
    | 'pageBackground'
    | 'sidebarBackground'
    | 'sidebarActiveBackground'
    | 'headerBackground'
  > & { id: string; name: string; desc: string }
>

const fontPresets = [
  {
    id: 'barlow-pingfang',
    name: '现代销售',
    desc: '当前默认字体，数字清楚，适合 CRM 表格和销售看板。',
    fontFamily: "'Barlow', 'Gotham', 'PingFang SC', 'Noto Sans SC', system-ui, -apple-system, sans-serif",
    sample: 'ANGEL Sales 2026 / 安吉尔全球销售',
  },
  {
    id: 'system-ui',
    name: '系统默认',
    desc: '跟随操作系统字体，加载快，兼容性最好。',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    sample: 'Global CRM 123 / 系统管理后台',
  },
  {
    id: 'inter-noto',
    name: '国际商务',
    desc: '英文和多语言阅读更均衡，适合海外团队。',
    fontFamily: "'Inter', 'Noto Sans SC', 'PingFang SC', system-ui, -apple-system, sans-serif",
    sample: 'Pipeline Review / 市场与订单跟进',
  },
  {
    id: 'compact-table',
    name: '紧凑表格',
    desc: '偏向数据密集页面，数字和英文更利落。',
    fontFamily: "'Arial', 'Helvetica Neue', 'Microsoft YaHei', 'PingFang SC', sans-serif",
    sample: 'AR Aging 30/60/90 / 回款与订单',
  },
] satisfies Array<Pick<SystemSettings, 'fontFamily'> & { id: string; name: string; desc: string; sample: string }>

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
  const previewSettings = useSystemSettingsStore((s) => s.preview)
  const reloadSettings = useSystemSettingsStore((s) => s.load)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState(settings)

  useEffect(() => {
    setDraft(settings)
  }, [settings.updatedAt])

  const selectedPreset = themePresets.find((preset) =>
    preset.primaryColor.toLowerCase() === draft.primaryColor.toLowerCase() &&
    preset.sidebarBackground.toLowerCase() === draft.sidebarBackground.toLowerCase()
  )
  const selectedFontPreset = fontPresets.find((preset) => preset.id === draft.fontPreset)

  const previewDraft = (patch: Partial<SystemSettings>) => {
    const next = { ...draft, ...patch }
    setDraft(next)
    previewSettings(next)
  }

  const handlePresetClick = (preset: (typeof themePresets)[number]) => {
    previewDraft({
      primaryColor: preset.primaryColor,
      dangerColor: preset.dangerColor,
      pageBackground: preset.pageBackground,
      sidebarBackground: preset.sidebarBackground,
      sidebarActiveBackground: preset.sidebarActiveBackground,
      headerBackground: preset.headerBackground,
    })
  }

  const handleFontPresetClick = (preset: (typeof fontPresets)[number]) => {
    previewDraft({
      fontPreset: preset.id,
      fontFamily: preset.fontFamily,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSettings(draft)
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
        <Card title={t('settings.brand.sidebar')} headStyle={{ color: '#fff' }} style={{ background: draft.sidebarBackground, color: '#fff' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
            <span style={{ color: draft.primaryColor }}>{draft.brandName.slice(0, 1)}</span>
            {draft.brandName.slice(1)}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{draft.brandSubtitle}</div>
        </Card>
        <Card title={t('settings.brand.headerLogin')} style={{ background: draft.headerBackground }}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            <span style={{ color: draft.primaryColor }}>{draft.brandName.slice(0, 1)}</span>
            {draft.brandName.slice(1)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{draft.brandSubtitle}</div>
        </Card>
      </div>

      <Title level={5} style={{ marginTop: 24 }}>品牌文字</Title>
      <Form layout="vertical">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item label="品牌名称">
            <Input value={draft.brandName} onChange={(e) => previewDraft({ brandName: e.target.value })} />
          </Form.Item>
          <Form.Item label="品牌副标题">
            <Input value={draft.brandSubtitle} onChange={(e) => previewDraft({ brandSubtitle: e.target.value })} />
          </Form.Item>
        </div>
      </Form>

      <Title level={5} style={{ marginTop: 16 }}>预设主题</Title>
      <Text className="text-secondary">点击主题立即预览，确认后再保存。</Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12, marginTop: 12 }}>
        {themePresets.map((preset) => (
          <Card
            key={preset.id}
            hoverable
            onClick={() => handlePresetClick(preset)}
            bodyStyle={{ padding: 14 }}
            style={{
              borderColor: selectedPreset?.id === preset.id ? draft.primaryColor : undefined,
              borderWidth: selectedPreset?.id === preset.id ? 2 : 1,
            }}
          >
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[preset.primaryColor, preset.dangerColor, preset.pageBackground, preset.sidebarBackground].map((color) => (
                <span
                  key={color}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: color,
                    border: '1px solid var(--border)',
                  }}
                />
              ))}
            </div>
            <Text strong>{preset.name}</Text>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>{preset.desc}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Button type="primary" loading={saving} onClick={handleSave}>
          保存当前主题与字体
        </Button>
        <Button
          onClick={() => {
            void reloadSettings()
            message.info('已恢复为上次保存的主题')
          }}
        >
          取消预览
        </Button>
      </div>

      <Title level={5} style={{ marginTop: 24 }}>{t('settings.brand.typography')}</Title>
      <Text className="text-secondary">点击字体方案立即预览，确认后和主题一起保存。</Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12, marginTop: 12 }}>
        {fontPresets.map((preset) => (
          <Card
            key={preset.id}
            hoverable
            onClick={() => handleFontPresetClick(preset)}
            bodyStyle={{ padding: 14 }}
            style={{
              borderColor: selectedFontPreset?.id === preset.id ? draft.primaryColor : undefined,
              borderWidth: selectedFontPreset?.id === preset.id ? 2 : 1,
              fontFamily: preset.fontFamily,
            }}
          >
            <Text strong>{preset.name}</Text>
            <div style={{ fontSize: 17, marginTop: 10, lineHeight: 1.4 }}>{preset.sample}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>{preset.desc}</div>
          </Card>
        ))}
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
