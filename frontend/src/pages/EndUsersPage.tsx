import { CalendarOutlined, EyeOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, InputNumber, Modal, Select, Table, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { getAccountById, type EndUser } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useDataStore } from '../store/useDataStore'

const { Text } = Typography

export function EndUsersPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const endUsers = useDataStore((state) => state.endUsers)
  const accounts = useDataStore((state) => state.accounts)
  const addEndUser = useDataStore((state) => state.addEndUser)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<EndUser | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()
  const clearCreateParam = useAutoCreate(setCreateOpen)

  const filtered = useMemo(() => {
    return endUsers.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.location.toLowerCase().includes(search.toLowerCase())
    )
  }, [endUsers, search])

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('endUsers.title')}</div>
          <div className="crm-page-header-desc">{t('endUsers.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('endUsers.create')}</Button>
      </div>

      <Card>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('endUsers.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280, marginBottom: 16 }}
        />
        <Table
          dataSource={filtered}
          rowKey="id"
          pagination={false}
          columns={[
            { title: t('endUsers.name'), dataIndex: 'name', render: (v) => <span><UserOutlined style={{ marginRight: 8, color: '#0f172a' }} />{v}</span> },
            { title: t('endUsers.account'), dataIndex: 'accountId', render: (id) => getAccountById(id)?.name },
            { title: t('endUsers.location'), dataIndex: 'location' },
            { title: t('endUsers.units'), dataIndex: 'units' },
            { title: t('endUsers.installDate'), dataIndex: 'installDate' },
            { title: t('endUsers.lastService'), dataIndex: 'lastService' },
            {
              title: t('common.actions'),
              key: 'action',
              render: (_: any, record: EndUser) => (
                <>
                  <Button type="text" icon={<EyeOutlined />} onClick={() => setSelected(record)} />
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={t('endUsers.detail')}
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={560}
      >
        {selected && (
          <div>
            <div className="enduser-detail-header">
              <div className="enduser-avatar"><UserOutlined style={{ fontSize: 32, color: '#fff' }} /></div>
              <div>
                <Text strong style={{ fontSize: 18 }}>{selected.name}</Text>
                <div className="text-muted">{getAccountById(selected.accountId)?.name}</div>
              </div>
            </div>
            <div className="enduser-detail-grid">
              <div><Text className="text-muted">{t('endUsers.location')}</Text><div><Text strong>{selected.location}</Text></div></div>
              <div><Text className="text-muted">{t('endUsers.units')}</Text><div><Text strong>{selected.units}</Text></div></div>
              <div><Text className="text-muted">{t('endUsers.installDate')}</Text><div><CalendarOutlined /> {selected.installDate}</div></div>
              <div><Text className="text-muted">{t('endUsers.lastService')}</Text><div><CalendarOutlined /> {selected.lastService}</div></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={t('endUsers.create')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); clearCreateParam(); form.resetFields() }}
        onOk={() => {
          form.validateFields().then(async (values) => {
            const newEndUser = await storageService.endUsers.create({
              name: values.name,
              accountId: values.accountId ?? '',
              location: values.location ?? '',
              units: Number(values.units ?? 0),
              installDate: new Date().toISOString().split('T')[0],
              lastService: '',
            })
            addEndUser(newEndUser)
            form.resetFields()
            setCreateOpen(false)
            clearCreateParam()
            success(t('common.successCreate'))
          })
        }}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item label={t('endUsers.name')} name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label={t('endUsers.account')} name="accountId">
            <Select options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
          </Form.Item>
          <Form.Item label={t('endUsers.location')} name="location"><Input /></Form.Item>
          <Form.Item label={t('endUsers.units')} name="units">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .enduser-detail-header { display: flex; align-items: center; gap: 16px; padding: 16px; border-bottom: 1px solid #f0f0f0; margin-bottom: 16px; }
        .enduser-avatar { width: 56px; height: 56px; border-radius: 50%; background: var(--angel-red); display: grid; place-items: center; }
        .enduser-detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      `}</style>
    </div>
  )
}
