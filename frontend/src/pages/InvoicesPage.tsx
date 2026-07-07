import { EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, Modal, Row, Select, Table, Tag } from 'antd'
import { useMemo, useState } from 'react'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { getAccountById, getUserById, type Invoice } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useAuthStore } from '../store/useAuthStore'
import { useDataStore } from '../store/useDataStore'

type InvoiceStatus = Invoice['status']

const invoiceStatuses: InvoiceStatus[] = ['pending_review', 'pending_issue', 'issued', 'rejected']

export function InvoicesPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const currentUser = useAuthStore((state) => state.user)
  const accounts = useDataStore((state) => state.accounts)
  const orders = useDataStore((state) => state.orders)
  const invoices = useDataStore((state) => state.invoices)
  const refresh = useDataStore((state) => state.refresh)
  const [open, setOpen] = useState(false)
  const clearCreateParam = useAutoCreate(setOpen)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [form] = Form.useForm()

  const statusMeta: Record<InvoiceStatus, { label: string; color: string }> = {
    pending_review: { label: t('invoices.statusPendingReview'), color: 'warning' },
    pending_issue: { label: t('invoices.statusPendingIssue'), color: 'processing' },
    issued: { label: t('invoices.statusIssued'), color: 'success' },
    rejected: { label: t('invoices.statusRejected'), color: 'error' },
  }

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const account = getAccountById(inv.accountId)
      const matchSearch =
        inv.no.toLowerCase().includes(search.toLowerCase()) ||
        (account?.name ?? '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter, t])

  const metrics = useMemo(() => {
    return [
      { label: t('invoices.pendingReview'), value: invoices.filter((i) => i.status === 'pending_review').length.toString() },
      { label: t('invoices.pendingIssue'), value: invoices.filter((i) => i.status === 'pending_issue').length.toString() },
      {
        label: t('invoices.issuedThisMonth'),
        value: `$${invoices
          .filter((i) => i.status === 'issued')
          .reduce((s, i) => s + i.amountUsd, 0)
          .toLocaleString()}`,
      },
    ]
  }, [t])

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('pages.invoices')}</div>
          <div className="crm-page-header-desc">{t('invoices.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          {t('common.create')}
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {metrics.map((k) => (
          <Col xs={24} md={8} key={k.label}>
            <Card>
              <div className="metric-card-label">{k.label}</div>
              <div className="metric-card-value">{k.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <div className="accounts-toolbar" style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('common.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
          <Select
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: t('common.all') },
              ...invoiceStatuses.map((s) => ({ value: s, label: statusMeta[s].label })),
            ]}
          />
        </div>

        <Table
          dataSource={filtered}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          columns={[
            { title: t('invoices.no'), dataIndex: 'no' },
            {
              title: t('invoices.account'),
              dataIndex: 'accountId',
              render: (id) => getAccountById(id)?.name ?? id,
            },
            {
              title: t('invoices.order'),
              dataIndex: 'orderId',
              render: (id) => orders.find((o) => o.id === id)?.orderNumber ?? id,
            },
            {
              title: t('invoices.amount'),
              dataIndex: 'amountUsd',
              render: (v) => `$${v.toLocaleString()}`,
            },
            {
              title: t('invoices.status'),
              dataIndex: 'status',
              render: (v: InvoiceStatus) => <Tag color={statusMeta[v].color}>{statusMeta[v].label}</Tag>,
            },
            {
              title: t('invoices.applicant'),
              dataIndex: 'applicantId',
              render: (id) => getUserById(id)?.name ?? id,
            },
            { title: t('invoices.createdAt'), dataIndex: 'createdAt' },
            {
              title: t('common.actions'),
              key: 'action',
              render: (_: any, record: Invoice) => (
                <Button type="text" icon={<EyeOutlined />} onClick={() => { setSelected(record); setDetailOpen(true) }} />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={t('common.create')}
        open={open}
        onCancel={() => { setOpen(false); clearCreateParam(); form.resetFields() }}
        onOk={() => {
          form.validateFields().then(async (values) => {
            const order = orders.find((item) => item.id === values.orderId)
            await storageService.invoices.create({
              no: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(invoices.length + 1).padStart(3, '0')}`,
              orderId: values.orderId,
              accountId: values.accountId ?? order?.accountId,
              amountUsd: Number(values.amountUsd ?? order?.subtotalUsd ?? 0),
              status: 'pending_review',
              applicantId: currentUser?.id ?? 'u1',
              title: values.title,
              taxId: values.taxId ?? '',
              createdAt: new Date().toISOString().slice(0, 10),
            })
            await refresh()
            form.resetFields()
            setOpen(false)
            clearCreateParam()
            success(t('common.successCreate'))
          })
        }}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item label={t('invoices.account')} name="accountId" rules={[{ required: true }]}>
            <Select options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
          </Form.Item>
          <Form.Item label={t('invoices.order')} name="orderId" rules={[{ required: true }]}>
            <Select options={orders.map((o) => ({ value: o.id, label: o.orderNumber }))} />
          </Form.Item>
          <Form.Item label={t('invoices.amount')} name="amountUsd">
            <Input prefix="$" />
          </Form.Item>
          <Form.Item label={t('invoices.invoiceTitle')} name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t('invoices.taxId')} name="taxId">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('invoices.detail')}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={560}
      >
        {selected && (
          <Form layout="vertical">
            <Form.Item label={t('invoices.no')}><Input readOnly value={selected.no} /></Form.Item>
            <Form.Item label={t('invoices.account')}><Input readOnly value={getAccountById(selected.accountId)?.name} /></Form.Item>
            <Form.Item label={t('invoices.order')}><Input readOnly value={orders.find((o) => o.id === selected.orderId)?.orderNumber} /></Form.Item>
            <Form.Item label={t('invoices.amount')}><Input readOnly value={`$${selected.amountUsd.toLocaleString()}`} /></Form.Item>
            <Form.Item label={t('invoices.status')}><Input readOnly value={statusMeta[selected.status].label} /></Form.Item>
            <Form.Item label={t('invoices.applicant')}><Input readOnly value={getUserById(selected.applicantId)?.name} /></Form.Item>
            <Form.Item label={t('invoices.createdAt')}><Input readOnly value={selected.createdAt} /></Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}
