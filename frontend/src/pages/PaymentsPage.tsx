import { CheckCircleOutlined, DollarOutlined, FileTextOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, InputNumber, Modal, Select, Table, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { formatCurrency, getUserById, getAccountById, statusTone, type Payment } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useDataStore } from '../store/useDataStore'

const { Text } = Typography

export function PaymentsPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const payments = useDataStore((state) => state.payments)
  const accounts = useDataStore((state) => state.accounts)
  const addPayment = useDataStore((state) => state.addPayment)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Payment | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()
  const clearCreateParam = useAutoCreate(setCreateOpen)

  const filtered = useMemo(() => {
    return payments.filter((p) =>
      getAccountById(p.accountId)?.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [payments, search])

  const totalReceived = payments.filter((p) => p.status === 'confirmed').reduce((s, p) => s + p.amountUsd, 0)
  const totalPending = payments.filter((p) => p.status !== 'confirmed').reduce((s, p) => s + p.amountUsd, 0)

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('payments.title')}</div>
          <div className="crm-page-header-desc">{t('payments.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('payments.create')}</Button>
      </div>

      <div className="payments-summary">
        <Card className="payment-summary-card">
          <div className="payment-summary-icon" style={{ background: '#dcfce7' }}><DollarOutlined style={{ color: '#22c55e' }} /></div>
          <div>
            <div className="text-muted">{t('payments.totalReceived')}</div>
            <div className="metric-card-value">{formatCurrency(totalReceived)}</div>
          </div>
        </Card>
        <Card className="payment-summary-card">
          <div className="payment-summary-icon" style={{ background: '#fef3c7' }}><FileTextOutlined style={{ color: '#f59e0b' }} /></div>
          <div>
            <div className="text-muted">{t('payments.totalPending')}</div>
            <div className="metric-card-value">{formatCurrency(totalPending)}</div>
          </div>
        </Card>
      </div>

      <Card>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('payments.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280, marginBottom: 16 }}
        />
        <Table
          dataSource={filtered}
          rowKey="id"
          pagination={false}
          columns={[
            { title: t('payments.customer'), dataIndex: 'accountId', render: (id) => getAccountById(id)?.name },
            { title: t('payments.amount'), dataIndex: 'amountUsd', render: (v) => formatCurrency(v) },
            { title: t('payments.currency'), dataIndex: 'currency' },
            { title: t('payments.method'), dataIndex: 'method', render: (v) => t(`labels.paymentMethod.${v}`) || v },
            { title: t('payments.date'), dataIndex: 'receivedAt' },
            { title: t('payments.status'), dataIndex: 'status', render: (v) => <span className={`pill pill-${statusTone(v)}`}>{t(`labels.paymentStatus.${v}`) || v}</span> },
            { title: t('payments.owner'), dataIndex: 'registeredById', render: (id) => getUserById(id)?.name },
            {
              title: t('common.actions'),
              key: 'action',
              render: (_, record) => (
                <Button type="text" onClick={() => setSelected(record)}>{t('payments.detail')}</Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={t('payments.detail')}
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={560}
      >
        {selected && (
          <div>
            <div className="payment-detail-header">
              {selected.status === 'confirmed' ? (
                <div className="payment-status-icon completed"><CheckCircleOutlined /></div>
              ) : (
                <div className="payment-status-icon pending"><FileTextOutlined /></div>
              )}
              <div>
                <Text strong style={{ fontSize: 18 }}>{getAccountById(selected.accountId)?.name}</Text>
                <div className="text-muted">{selected.id}</div>
              </div>
            </div>
            <div className="payment-detail-grid">
              <div><Text className="text-muted">{t('payments.amount')}</Text><div><DollarOutlined /> {formatCurrency(selected.amountUsd)}</div></div>
              <div><Text className="text-muted">{t('payments.currency')}</Text><div><Text strong>{selected.currency}</Text></div></div>
              <div><Text className="text-muted">{t('payments.method')}</Text><div><Text strong>{t(`labels.paymentMethod.${selected.method}`) || selected.method}</Text></div></div>
              <div><Text className="text-muted">{t('payments.date')}</Text><div><Text strong>{selected.receivedAt}</Text></div></div>
              <div><Text className="text-muted">{t('payments.status')}</Text><div><span className={`pill pill-${statusTone(selected.status)}`}>{t(`labels.paymentStatus.${selected.status}`) || selected.status}</span></div></div>
              <div><Text className="text-muted">{t('payments.owner')}</Text><div><UserOutlined /> {getUserById(selected.registeredById)?.name}</div></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={t('payments.create')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); clearCreateParam(); form.resetFields() }}
        onOk={() => {
          form.validateFields().then(async (values) => {
            const newPayment = await storageService.payments.create({
              receivedAt: new Date().toISOString().split('T')[0],
              accountId: values.accountId ?? '',
              orderId: '',
              amountUsd: Number(values.amountUsd ?? 0),
              currency: values.currency ?? 'USD',
              registeredById: 'u1',
              method: values.method ?? 'wire',
              status: values.status ?? 'receivable',
            })
            addPayment(newPayment)
            form.resetFields()
            setCreateOpen(false)
            clearCreateParam()
            success(t('common.successCreate'))
          })
        }}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item label={t('payments.customer')} name="accountId">
            <Select options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
          </Form.Item>
          <Form.Item label={t('payments.amount')} name="amountUsd">
            <InputNumber prefix={<DollarOutlined />} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label={t('payments.currency')} name="currency"><Input /></Form.Item>
          <Form.Item label={t('payments.method')} name="method"><Input /></Form.Item>
          <Form.Item label={t('payments.status')} name="status"><Input /></Form.Item>
        </Form>
      </Modal>

      <style>{`
        .payments-summary { display: flex; gap: 16px; margin-bottom: 16px; }
        .payment-summary-card { flex: 1; }
        .payment-summary-card .ant-card-body { display: flex; align-items: center; gap: 16px; }
        .payment-summary-icon { width: 48px; height: 48px; border-radius: 12px; display: grid; place-items: center; font-size: 20px; }
        .payment-detail-header { display: flex; align-items: center; gap: 16px; padding: 16px; border-bottom: 1px solid #f0f0f0; margin-bottom: 16px; }
        .payment-status-icon { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; font-size: 24px; }
        .payment-status-icon.completed { background: #dcfce7; color: #22c55e; }
        .payment-status-icon.pending { background: #fef3c7; color: #f59e0b; }
        .payment-detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      `}</style>
    </div>
  )
}
