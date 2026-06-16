import { EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, DatePicker, Form, Input, Modal, Select, Table } from 'antd'
import { useState } from 'react'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { accounts, formatCurrency, getAccountById, getUserById, orders, payments, statusTone } from '../mocks/crmData'

const paymentMethods = ['wire', 'lc', 'check', 'paypal', 'stripe']

export function PaymentsPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const [createOpen, setCreateOpen] = useState(false)
  const clearCreateParam = useAutoCreate(setCreateOpen)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<typeof payments[0] | null>(null)

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('payments.title')}</div>
          <div className="crm-page-header-desc">{t('payments.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('payments.create')}</Button>
      </div>

      <Card>
        <Table
          dataSource={payments}
          rowKey="id"
          pagination={false}
          columns={[
            { title: t('payments.receivedAt'), dataIndex: 'receivedAt' },
            { title: t('payments.account'), dataIndex: 'accountId', render: (id) => getAccountById(id)?.name },
            { title: t('payments.order'), dataIndex: 'orderId' },
            { title: t('payments.amount'), dataIndex: 'amountUsd', render: (v) => formatCurrency(v) },
            { title: t('payments.currency'), dataIndex: 'currency' },
            { title: t('payments.registrar'), dataIndex: 'registeredById', render: (id) => getUserById(id)?.name },
            { title: t('payments.method'), dataIndex: 'method', render: (v) => t(`labels.paymentMethod.${v}`) },
            { title: t('payments.status'), dataIndex: 'status', render: (v) => <span className={`pill pill-${statusTone(v)}`}>{t(`labels.paymentStatus.${v}`)}</span> },
            {
              title: t('common.actions'),
              key: 'action',
              render: (_: any, record: typeof payments[0]) => (
                <Button type="text" icon={<EyeOutlined />} onClick={() => { setSelected(record); setDetailOpen(true) }} />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={t('payments.create')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); clearCreateParam() }}
        onOk={() => { setCreateOpen(false); clearCreateParam(); success(t('common.successCreate')) }}
        width={560}
      >
        <Form layout="vertical">
          <Form.Item label={t('payments.account')}>
            <Select options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
          </Form.Item>
          <Form.Item label={t('payments.order')}>
            <Select options={orders.map((o) => ({ value: o.id, label: o.orderNumber }))} />
          </Form.Item>
          <Form.Item label={t('payments.amount')}><Input prefix="$" /></Form.Item>
          <Form.Item label={t('payments.currency')}>
            <Select options={['USD', 'CNY', 'EUR', 'SGD', 'HKD'].map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item label={t('payments.method')}>
            <Select options={paymentMethods.map((v) => ({ value: v, label: t(`labels.paymentMethod.${v}`) }))} />
          </Form.Item>
          <Form.Item label={t('payments.receivedAt')}><DatePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('payments.detail')}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={560}
      >
        {selected && (
          <Form layout="vertical">
            <Form.Item label={t('payments.receivedAt')}><Input readOnly value={selected.receivedAt} /></Form.Item>
            <Form.Item label={t('payments.account')}><Input readOnly value={getAccountById(selected.accountId)?.name} /></Form.Item>
            <Form.Item label={t('payments.order')}><Input readOnly value={selected.orderId} /></Form.Item>
            <Form.Item label={t('payments.amount')}><Input readOnly value={formatCurrency(selected.amountUsd)} /></Form.Item>
            <Form.Item label={t('payments.currency')}><Input readOnly value={selected.currency} /></Form.Item>
            <Form.Item label={t('payments.method')}><Input readOnly value={t(`labels.paymentMethod.${selected.method}`)} /></Form.Item>
            <Form.Item label={t('payments.status')}><Input readOnly value={t(`labels.paymentStatus.${selected.status}`)} /></Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}
