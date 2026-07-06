import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Card, Col, DatePicker, Drawer, Form, Input, Modal, Row, Select, Table, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { flagForMarket, getUserById, statusTone, type Account, type Order, type Product } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useAuthStore } from '../store/useAuthStore'
import { useDataStore } from '../store/useDataStore'

const { Text } = Typography

const viewOptions = (t: (k: string) => string) => [
  { key: 'business', label: `💼 ${t('orders.viewBusiness')}` },
  { key: 'finance', label: `💰 ${t('orders.viewFinance')}` },
  { key: 'supply', label: `🚚 ${t('orders.viewSupply')}` },
]

const statusList = (t: (k: string) => string) => [
  { key: 'all', label: t('common.all') },
  { key: 'pendingPI', label: t('labels.orderStatus.pendingPI') },
  { key: 'piIssued', label: t('labels.orderStatus.piIssued') },
  { key: 'shipped', label: t('labels.orderStatus.shipped') },
  { key: 'completed', label: t('labels.orderStatus.completed') },
]

export function OrdersPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const accounts = useDataStore((state) => state.accounts)
  const orders = useDataStore((state) => state.orders)
  const products = useDataStore((state) => state.products)
  const refresh = useDataStore((state) => state.refresh)
  const user = useAuthStore((state) => state.user)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('business')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Order | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()
  const clearCreateParam = useAutoCreate(setCreateOpen)

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.piNumber.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('orders.title')}</div>
          <div className="crm-page-header-desc">{t('orders.subtitle')}</div>
        </div>
        <Button type="primary" onClick={() => setCreateOpen(true)}>+ {t('orders.createTitle')}</Button>
      </div>

      <Card>
        <div className="orders-toolbar">
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('common.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />

          <div className="filter-group">
            {viewOptions(t).map((v) => (
              <button
                key={v.key}
                className={`filter-chip ${view === v.key ? 'active' : ''}`}
                onClick={() => setView(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="filter-group">
            {statusList(t).map((s) => (
              <button
                key={s.key}
                className={`filter-chip ${statusFilter === s.key ? 'active' : ''}`}
                onClick={() => setStatusFilter(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <Table
          dataSource={filtered}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          columns={[
            { title: t('orders.colOrderNo'), dataIndex: 'orderNumber', width: 120 },
            { title: t('orders.colPiNo'), dataIndex: 'piNumber', width: 110 },
            { title: t('orders.colAccount'), dataIndex: 'accountId', render: (id) => accounts.find((account) => account.id === id)?.name ?? id, width: 150 },
            { title: t('orders.colRequester'), dataIndex: 'requestedById', render: (id) => getUserById(id)?.name ?? id, width: 100 },
            { title: t('orders.colItems'), dataIndex: 'items', render: (items) => items.length, width: 60 },
            { title: t('orders.colSubtotal'), dataIndex: 'subtotalUsd', render: (v) => `$${v.toLocaleString()}`, width: 100 },
            { title: t('orders.colType'), dataIndex: 'orderType', render: (v) => t(`labels.orderType.${v}`), width: 80 },
            { title: t('orders.colKind'), dataIndex: 'orderKind', render: (v) => t(`labels.orderKind.${v}`), width: 90 },
            { title: t('orders.colPo'), dataIndex: 'poStatus', render: (v) => t(`labels.poStatus.${v}`), width: 80 },
            {
              title: t('orders.colStatus'),
              dataIndex: 'status',
              width: 120,
              render: (v) => {
                const tone = statusTone(v)
                return <span className={`pill pill-${tone}`}>{t(`labels.orderStatus.${v}`)}</span>
              },
            },
            { title: t('orders.colCreated'), dataIndex: 'createdAt', width: 100 },
            {
              title: t('common.actions'),
              key: 'action',
              width: 110,
              render: (_, record) => (
                <Button type="text" icon={<EyeOutlined />} onClick={() => setSelected(record)}>
                  {t('common.view')}
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Drawer
        title={`${t('orders.colOrderNo')} ${selected?.orderNumber}`}
        width={560}
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        {selected && <OrderDetail order={selected} accounts={accounts} />}
      </Drawer>

      <Modal
        title={t('orders.createTitle')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); clearCreateParam(); form.resetFields() }}
        width={640}
        okText={t('orders.createTitle')}
        cancelText={t('common.cancel')}
        onOk={() => {
          form.validateFields().then(async (values) => {
            const lineItems: Order['items'] = (values.items ?? []).map((line: { productId: string; quantity?: string }) => {
              const product = products.find((item) => item.id === line.productId)
              const qty = Number(line.quantity ?? 1)
              return {
                sku: product?.sku ?? line.productId,
                name: product?.name ?? line.productId,
                qty,
                unitPrice: product?.unitPrice ?? 0,
              }
            })
            const subtotalUsd = lineItems.reduce((sum: number, item) => sum + item.qty * item.unitPrice, 0)
            const nextNo = `AHT-ORD-2026-${String(orders.length + 1).padStart(4, '0')}`
            await storageService.orders.create({
              orderNumber: nextNo,
              piNumber: '-',
              accountId: values.accountId,
              requestedById: user?.id ?? 'u1',
              items: lineItems,
              subtotalUsd,
              status: 'pendingPI',
              orderType: values.orderType,
              orderKind: values.orderKind,
              poStatus: 'pending',
              createdAt: new Date().toISOString().slice(0, 10),
            })
            await refresh()
            form.resetFields()
            success(t('common.successCreate'))
            setCreateOpen(false)
            clearCreateParam()
          })
        }}
      >
        <CreateOrderForm form={form} accounts={accounts} products={products} />
      </Modal>

      <style>{`
        .orders-toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 20px; }
      `}</style>
    </div>
  )
}

function OrderDetail({ order, accounts }: { order: Order; accounts: Account[] }) {
  const { t } = useI18n()
  const account = accounts.find((item) => item.id === order.accountId)
  const applicant = getUserById(order.requestedById)

  return (
    <div className="order-detail">
      <div className="order-detail-header">
        <div className="order-detail-meta">
          <div>
            <Text className="text-muted">PI</Text>
            <div className="order-detail-value">{order.piNumber}</div>
          </div>
          <div>
            <Text className="text-muted">{t('orders.colAccount')}</Text>
            <div className="order-detail-value">{account?.name}</div>
          </div>
          <div>
            <Text className="text-muted">{t('orders.colRequester')}</Text>
            <div className="order-detail-value">{applicant?.name}</div>
          </div>
          <div>
            <Text className="text-muted">{t('orders.colStatus')}</Text>
            <div><span className={`pill pill-${statusTone(order.status)}`}>{t(`labels.orderStatus.${order.status}`)}</span></div>
          </div>
        </div>
      </div>

      <Card title={t('orders.drawerLines')} style={{ marginBottom: 16 }}>
        <table className="order-lines-table">
          <thead>
            <tr>
              <th>{t('orders.drawerSku')}</th>
              <th>{t('orders.drawerProduct')}</th>
              <th>{t('orders.drawerQty')}</th>
              <th>{t('orders.drawerUnit')}</th>
              <th>{t('orders.drawerLineTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>{item.qty}</td>
                <td>${item.unitPrice.toLocaleString()}</td>
                <td>${(item.qty * item.unitPrice).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>{t('orders.drawerSubtotal')}</td>
              <td style={{ fontWeight: 700 }}>${order.subtotalUsd.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </Card>

      <Card title={`🚚 ${t('orders.drawerShipment')}`} style={{ marginBottom: 16 }}>
        <Button type="dashed" block icon={'+'}>{t('common.create')}</Button>
        <Text className="text-muted" style={{ display: 'block', marginTop: 12 }}>
          {t('common.noData')}
        </Text>
      </Card>

      <Card title={t('orders.drawerAttachments')}>
        <div className="attachment-row">
          <Text strong>PO</Text>
          <div>
            <Text>Raffles-PO-2026-05-08.pdf</Text>
            <Text className="text-muted" style={{ marginLeft: 8 }}>· 2026-05-30</Text>
          </div>
        </div>
      </Card>

      <style>{`
        .order-detail-header { margin-bottom: 16px; }
        .order-detail-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .order-detail-value { font-weight: 700; font-size: 14px; margin-top: 2px; }
        .order-lines-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .order-lines-table th { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 600; }
        .order-lines-table td { padding: 10px 8px; border-bottom: 1px solid var(--border); }
        .order-lines-table tfoot td { border-top: 2px solid var(--border); border-bottom: none; }
        .attachment-row { display: flex; flex-direction: column; gap: 4px; }
      `}</style>
    </div>
  )
}

function CreateOrderForm({ form, accounts, products }: { form: ReturnType<typeof Form.useForm>[0]; accounts: Account[]; products: Product[] }) {
  const { t } = useI18n()
  return (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t('orders.colAccount')} name="accountId" rules={[{ required: true, message: t('common.required') }]}>
            <Select placeholder={t('common.required')} options={accounts.map(a => ({ label: `${flagForMarket(a.market)} ${a.name}`, value: a.id }))} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('orders.colType')} name="orderType" initialValue="preWin">
            <Select options={['preWin', 'firstOrder', 'reorder'].map(v => ({ label: t(`labels.orderType.${v}`), value: v }))} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t('orders.colKind')} name="orderKind" initialValue="bulk">
            <Select options={['bulk', 'sample', 'reorder'].map(v => ({ label: t(`labels.orderKind.${v}`), value: v }))} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('common.date')} name="deliveryDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.List name="items" initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <Card size="small" title={t('orders.drawerLines')} style={{ marginBottom: 16 }}>
            {fields.map(field => (
              <Row gutter={12} key={field.key} align="middle" style={{ marginBottom: 8 }}>
                <Col flex="1 1 auto">
                  <Form.Item noStyle {...field} name={[field.name, 'productId']} rules={[{ required: true, message: t('common.selectProduct') }]}>
                    <Select placeholder={t('common.required')} options={products.map(p => ({ label: p.name, value: p.id }))} />
                  </Form.Item>
                </Col>
                <Col flex="0 0 80px">
                  <Form.Item noStyle {...field} name={[field.name, 'quantity']}>
                    <Input type="number" placeholder={t('common.qty')} />
                  </Form.Item>
                </Col>
                <Col flex="0 0 32px">
                  <Button type="text" danger onClick={() => remove(field.name)}>×</Button>
                </Col>
              </Row>
            ))}
            <Button type="dashed" block onClick={() => add()}>+ {t('common.create')}</Button>
          </Card>
        )}
      </Form.List>
      <Form.Item label={t('common.note')} name="notes">
        <Input.TextArea rows={3} placeholder="..." />
      </Form.Item>
    </Form>
  )
}
