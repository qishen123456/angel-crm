import { CalendarOutlined, FileTextOutlined, MessageOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Modal, Select, Table, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { getUserById, getAccountById, type Activity } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useDataStore } from '../store/useDataStore'

const { Text } = Typography

function formatDate(date: string) {
  return date
}

export function LogActivityPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const activities = useDataStore((state) => state.activities)
  const accounts = useDataStore((state) => state.accounts)
  const addActivity = useDataStore((state) => state.addActivity)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Activity | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()
  const clearCreateParam = useAutoCreate(setCreateOpen)

  const filtered = useMemo(() => {
    return activities.filter((a: Activity) =>
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      getAccountById(a.accountId)?.name.toLowerCase().includes(search.toLowerCase())
    ).sort((a: Activity, b: Activity) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [activities, search])

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('activities.title')}</div>
          <div className="crm-page-header-desc">{t('activities.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('activities.log')}</Button>
      </div>

      <Card>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('activities.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280, marginBottom: 16 }}
        />
        <Table
          dataSource={filtered}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: t('activities.type'),
              dataIndex: 'type',
              render: (v: string) => {
                const icons: Record<string, React.ReactNode> = { phone: <MessageOutlined />, meeting: <CalendarOutlined />, email: <FileTextOutlined /> }
                return <span className="activity-type">{icons[v] || <FileTextOutlined />} {t(`labels.activityType.${v}`) || v}</span>
              },
            },
            { title: t('activities.account'), dataIndex: 'accountId', render: (id: string) => getAccountById(id)?.name },
            { title: t('activities.description'), dataIndex: 'content', render: (v: string) => <span className="activity-desc">{v}</span> },
            { title: t('activities.date'), dataIndex: 'createdAt', render: (v: string) => formatDate(v) },
            { title: t('activities.owner'), dataIndex: 'createdById', render: (id: string) => getUserById(id)?.name },
            {
              title: t('common.actions'),
              key: 'action',
              render: (_: any, record: Activity) => (
                <Button type="text" onClick={() => setSelected(record)}>{t('activities.detail')}</Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={t('activities.detail')}
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={560}
      >
        {selected && (
          <div>
            <div className="activity-detail-header">
              <div className="activity-type-icon">
                {selected.type === 'phone' && <MessageOutlined />}
                {selected.type === 'meeting' && <CalendarOutlined />}
                {selected.type === 'email' && <FileTextOutlined />}
                {selected.type === 'finance' && <FileTextOutlined />}
                {selected.type === 'visit' && <CalendarOutlined />}
              </div>
              <div>
                <Text strong style={{ fontSize: 18 }}>{t(`labels.activityType.${selected.type}`) || selected.type}</Text>
                <div className="text-muted">{getAccountById(selected.accountId)?.name}</div>
              </div>
            </div>
            <div className="activity-detail-body">
              <div><Text className="text-muted">{t('activities.date')}</Text><div><CalendarOutlined /> {formatDate(selected.createdAt)}</div></div>
              <div><Text className="text-muted">{t('activities.description')}</Text><div><Text strong>{selected.content}</Text></div></div>
              <div><Text className="text-muted">{t('activities.owner')}</Text><div><UserOutlined /> {getUserById(selected.createdById)?.name}</div></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={t('activities.log')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); clearCreateParam(); form.resetFields() }}
        onOk={() => {
          form.validateFields().then(async (values: Record<string, any>) => {
            const newActivity = await storageService.activities.create({
              type: values.type ?? 'note',
              accountId: values.accountId ?? '',
              content: values.content,
              createdAt: new Date().toISOString().split('T')[0],
              createdById: 'u1',
            })
            addActivity(newActivity)
            form.resetFields()
            setCreateOpen(false)
            clearCreateParam()
            success(t('common.successCreate'))
          })
        }}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item label={t('activities.type')} name="type">
            <Select options={[{ value: 'phone', label: '电话' }, { value: 'meeting', label: '会议' }, { value: 'email', label: '邮件' }, { value: 'note', label: '备注' }]} />
          </Form.Item>
          <Form.Item label={t('activities.account')} name="accountId">
            <Select options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
          </Form.Item>
          <Form.Item label={t('activities.description')} name="content" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <style>{`
        .activity-type { display: flex; align-items: center; gap: 8px; }
        .activity-desc { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .activity-detail-header { display: flex; align-items: center; gap: 16px; padding: 16px; border-bottom: 1px solid #f0f0f0; margin-bottom: 16px; }
        .activity-type-icon { width: 48px; height: 48px; border-radius: 12px; background: #f8f7f4; display: grid; place-items: center; font-size: 20px; color: var(--angel-red); }
        .activity-detail-body { display: flex; flex-direction: column; gap: 12px; }
      `}</style>
    </div>
  )
}
