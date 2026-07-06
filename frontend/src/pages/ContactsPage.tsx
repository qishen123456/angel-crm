import { EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Avatar, Button, Card, Form, Input, Modal, Table } from 'antd'
import { useMemo, useState } from 'react'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { getAccountById, type Contact } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useDataStore } from '../store/useDataStore'

export function ContactsPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const contacts = useDataStore((state) => state.contacts)
  const addContact = useDataStore((state) => state.addContact)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [form] = Form.useForm()
  const clearCreateParam = useAutoCreate(setCreateOpen)

  const filtered = useMemo(() => {
    return contacts.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(search.toLowerCase())
    )
  }, [contacts, search])



  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('contacts.title')}</div>
          <div className="crm-page-header-desc">{t('contacts.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('contacts.create')}</Button>
      </div>

      <Card>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('contacts.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280, marginBottom: 16 }}
        />
        <Table
          dataSource={filtered}
          rowKey="id"
          pagination={false}
          columns={[
            { title: t('contacts.name'), dataIndex: 'name', render: (v) => <span><Avatar size="small" style={{ marginRight: 8, background: '#0f172a' }}>{v.slice(0, 1)}</Avatar>{v}</span> },
            { title: t('contacts.jobTitle'), dataIndex: 'title' },
            { title: t('contacts.account'), dataIndex: 'accountId', render: (id) => getAccountById(id)?.name },
            { title: t('contacts.email'), dataIndex: 'email' },
            { title: t('contacts.phone'), dataIndex: 'phone' },
            { title: t('contacts.primary'), dataIndex: 'isPrimary', render: (v) => v ? t('contacts.yes') : t('contacts.no') },
            {
              title: t('common.actions'),
              key: 'action',
              render: (_: any, record: Contact) => (
                <Button type="text" icon={<EyeOutlined />} onClick={() => { setSelected(record); setDetailOpen(true) }} />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={t('contacts.create')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); clearCreateParam(); form.resetFields() }}
        onOk={() => {
          form.validateFields().then(async (values) => {
            const newContact = await storageService.contacts.create({
              name: values.name,
              title: values.title ?? '',
              accountId: values.accountId ?? '',
              email: values.email ?? '',
              phone: values.phone ?? '',
              isPrimary: false,
            })
            addContact(newContact)
            form.resetFields()
            setCreateOpen(false)
            clearCreateParam()
            success(t('common.successCreate'))
          })
        }}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item label={t('contacts.name')} name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label={t('contacts.jobTitle')} name="title"><Input /></Form.Item>
          <Form.Item label={t('contacts.account')} name="accountId"><Input /></Form.Item>
          <Form.Item label={t('contacts.email')} name="email"><Input /></Form.Item>
          <Form.Item label={t('contacts.phone')} name="phone"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('contacts.detail')}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={560}
      >
        {selected && (
          <Form layout="vertical">
            <Form.Item label={t('contacts.name')}><Input readOnly value={selected.name} /></Form.Item>
            <Form.Item label={t('contacts.jobTitle')}><Input readOnly value={selected.title} /></Form.Item>
            <Form.Item label={t('contacts.account')}><Input readOnly value={getAccountById(selected.accountId)?.name} /></Form.Item>
            <Form.Item label={t('contacts.email')}><Input readOnly value={selected.email} /></Form.Item>
            <Form.Item label={t('contacts.phone')}><Input readOnly value={selected.phone} /></Form.Item>
            <Form.Item label={t('contacts.primary')}><Input readOnly value={selected.isPrimary ? t('contacts.yes') : t('contacts.no')} /></Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}
