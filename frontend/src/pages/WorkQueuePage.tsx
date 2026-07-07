import { ArrowRightOutlined, ContainerOutlined, DollarOutlined, ShoppingOutlined, TruckOutlined } from '@ant-design/icons'
import { Button, Card, Empty, Row, Space, Table, Tag, Typography } from 'antd'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { formatCurrency, statusTone, type Order, type Payment } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useAuthStore } from '../store/useAuthStore'
import { useDataStore } from '../store/useDataStore'

const { Text, Title } = Typography

const collectionPlans = [
  { id: 'cp1', accountId: 'a1', dueDate: '2026-06-20', planAmountUsd: 42000, status: 'due' },
  { id: 'cp2', accountId: 'a2', dueDate: '2026-06-14', planAmountUsd: 18000, status: 'overdue' },
]

export function WorkQueuePage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const currentUser = useAuthStore((state) => state.user)
  const accounts = useDataStore((state) => state.accounts)
  const orders = useDataStore((state) => state.orders)
  const payments = useDataStore((state) => state.payments)
  const refresh = useDataStore((state) => state.refresh)

  const orderOps = orders.filter((o) => o.status === 'pendingPI' || o.status === 'piIssued')
  const supply = orders.filter((o) => o.status === 'shipped')
  const paymentVerification = payments.filter((p) => p.status !== 'confirmed')

  const accountName = (id: string) => accounts.find((account) => account.id === id)?.name ?? id

  const advanceOrder = async (order: Order) => {
    const nextStatus = order.status === 'pendingPI' ? 'piIssued' : order.status === 'piIssued' ? 'shipped' : 'completed'
    await storageService.orders.update(order.id, {
      status: nextStatus,
      shippedAt: nextStatus === 'shipped' ? new Date().toISOString().slice(0, 10) : order.shippedAt,
    })
    await refresh()
    success(t('common.successUpdate'))
  }

  const confirmPayment = async (payment: Payment) => {
    await storageService.payments.update(payment.id, { status: 'confirmed' })
    await refresh()
    success(t('common.confirm'))
  }

  const remindCollection = async (item: { accountId: string; dueDate: string; planAmountUsd: number }) => {
    await storageService.activities.create({
      accountId: item.accountId,
      createdAt: new Date().toISOString().slice(0, 10),
      createdById: currentUser?.id ?? 'u1',
      type: 'finance',
      content: `催收提醒：计划收款 ${formatCurrency(item.planAmountUsd)}，到期日 ${item.dueDate}`,
    })
    await refresh()
    success(t('common.successCreate'))
  }

  const cards = [
    { key: 'orderOps', icon: <ShoppingOutlined /> },
    { key: 'supply', icon: <TruckOutlined /> },
    { key: 'finance', icon: <DollarOutlined /> },
  ]

  const orderColumns = [
    { title: t('workqueue.table.orderNo'), dataIndex: 'orderNumber' },
    { title: t('workqueue.table.account'), dataIndex: 'accountId', render: (id: string) => accountName(id) },
    { title: t('workqueue.table.subtotal'), dataIndex: 'subtotalUsd', render: (v: number) => formatCurrency(v) },
    { title: t('workqueue.table.status'), dataIndex: 'status', render: (v: string) => <Tag className={`pill pill-${statusTone(v)}`}>{t(`labels.orderStatus.${v}`)}</Tag> },
    { title: t('workqueue.table.action'), render: () => <Tag className="pill pill-amber">{t('workqueue.table.open')}</Tag> },
    { title: t('workqueue.table.createdAt'), dataIndex: 'createdAt' },
    {
      title: '',
      key: 'open',
      render: (_: unknown, record: Order) => (
        <Button type="primary" size="small" icon={<ArrowRightOutlined />} onClick={() => advanceOrder(record)}>
          {t('workqueue.table.open')}
        </Button>
      ),
    },
  ]

  const paymentColumns = [
    { title: t('workqueue.table.receivedAt'), dataIndex: 'receivedAt' },
    { title: t('workqueue.table.account'), dataIndex: 'accountId', render: (id: string) => accountName(id) },
    { title: t('workqueue.table.amount'), dataIndex: 'amountUsd', render: (v: number) => formatCurrency(v) },
    { title: t('workqueue.table.financeConfirm'), dataIndex: 'status', render: (v: string) => <Tag className={`pill pill-${statusTone(v)}`}>{t(`labels.paymentStatus.${v}`)}</Tag> },
    { title: t('workqueue.table.action'), render: () => <Tag className="pill pill-amber">{t('workqueue.table.confirmPayment')}</Tag> },
    {
      title: '',
      key: 'open',
      render: (_: unknown, record: Payment) => (
        <Button type="primary" size="small" icon={<ArrowRightOutlined />} onClick={() => confirmPayment(record)}>
          {t('workqueue.table.open')}
        </Button>
      ),
    },
  ]

  const collectionColumns = [
    { title: t('workqueue.table.dueDate'), dataIndex: 'dueDate' },
    { title: t('workqueue.table.account'), dataIndex: 'accountId', render: (id: string) => accountName(id) },
    { title: t('workqueue.table.planAmount'), dataIndex: 'planAmountUsd', render: (v: number) => formatCurrency(v) },
    { title: t('workqueue.table.status'), dataIndex: 'status', render: (v: string) => <Tag className={`pill pill-${statusTone(v)}`}>{t(`labels.collectionStatus.${v}`)}</Tag> },
    { title: t('workqueue.table.action'), render: () => <Tag className="pill pill-amber">{t('workqueue.table.remindCustomer')}</Tag> },
    {
      title: '',
      key: 'open',
      render: (_: unknown, record: { accountId: string; dueDate: string; planAmountUsd: number }) => (
        <Button type="primary" size="small" icon={<ArrowRightOutlined />} onClick={() => remindCollection(record)}>
          {t('workqueue.table.open')}
        </Button>
      ),
    },
  ]

  const sectionData = [
    { key: 'orderOps', icon: <ShoppingOutlined />, data: orderOps, columns: orderColumns },
    { key: 'supply', icon: <TruckOutlined />, data: supply, columns: orderColumns },
    { key: 'paymentVerification', icon: <DollarOutlined />, data: paymentVerification, columns: paymentColumns },
    { key: 'collectionTracking', icon: <ContainerOutlined />, data: collectionPlans, columns: collectionColumns },
  ]

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('workqueue.title')}</div>
          <div className="crm-page-header-desc">
            {t('workqueue.role')}: {t('systemAdmin')}
          </div>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {cards.map((c) => (
          <div key={c.key} className="workqueue-kpi-card">
            <div className="workqueue-kpi-icon">{c.icon}</div>
            <div>
              <div className="workqueue-kpi-label">{t(`workqueue.cards.${c.key}`)}</div>
              <div className="workqueue-kpi-value" style={{ color: c.key === 'finance' ? '#ee2737' : c.key === 'supply' ? '#3b82f6' : '#f59e0b' }}>
                {sectionData.find((s) => s.key === c.key)?.data.length ?? 0}
              </div>
            </div>
          </div>
        ))}
      </Row>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {sectionData.map((s) => (
          <SectionCard
            key={s.key}
            icon={s.icon}
            title={t(`workqueue.sections.${s.key}`)}
            desc={t(`workqueue.sections.${s.key}Desc`)}
            data={s.data}
            columns={s.columns}
            empty={t('workqueue.table.noData')}
          />
        ))}
      </Space>

      <style>{`
        .workqueue-kpi-card { flex: 1; background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 14px; min-width: 200px; }
        .workqueue-kpi-icon { width: 40px; height: 40px; border-radius: 8px; background: #f8f7f4; display: grid; place-items: center; font-size: 18px; color: var(--angel-red); }
        .workqueue-kpi-label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
        .workqueue-kpi-value { font-size: 28px; font-weight: 700; line-height: 1.2; }
        .workqueue-section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .workqueue-section-title { font-size: 16px; font-weight: 700; margin: 0; }
        .workqueue-section-desc { color: var(--text-muted); font-size: 13px; }
      `}</style>
    </div>
  )
}

function SectionCard({ icon, title, desc, data, columns, empty }: any) {
  return (
    <Card>
      <div className="workqueue-section-header">
        {icon}
        <Title level={5} className="workqueue-section-title">{title}</Title>
      </div>
      <Text className="workqueue-section-desc" style={{ display: 'block', marginBottom: 16 }}>{desc}</Text>
      {data.length > 0 ? (
        <Table dataSource={data} rowKey="id" pagination={false} columns={columns} />
      ) : (
        <Empty description={empty} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  )
}
