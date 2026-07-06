import { CalendarOutlined, DollarOutlined, FileTextOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, InputNumber, Modal, Table, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { formatCurrency, getAccountById, statusTone, type Contract } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useDataStore } from '../store/useDataStore'

const { Text } = Typography

export function ContractsPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const contracts = useDataStore((state) => state.contracts)
  const addContract = useDataStore((state) => state.addContract)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Contract | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()
  const clearCreateParam = useAutoCreate(setCreateOpen)

  const filtered = useMemo(() => {
    return contracts.filter((c) =>
      c.contractNumber.toLowerCase().includes(search.toLowerCase())
    )
  }, [contracts, search])

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('contracts.title')}</div>
          <div className="crm-page-header-desc">{t('contracts.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('contracts.create')}</Button>
      </div>

      <Card>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('contracts.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280, marginBottom: 16 }}
        />
        <Table
          dataSource={filtered}
          rowKey="id"
          pagination={false}
          columns={[
            { title: t('contracts.contractNo'), dataIndex: 'contractNumber' },
            { title: t('contracts.customer'), dataIndex: 'accountId', render: (id) => getAccountById(id)?.name },
            { title: t('contracts.name'), dataIndex: 'name' },
            { title: t('contracts.total'), dataIndex: 'amountUsd', render: (v) => formatCurrency(v) },
            { title: t('contracts.status'), dataIndex: 'status', render: (v) => <span className={`pill pill-${statusTone(v)}`}>{t(`labels.contractStatus.${v}`)}</span> },
            { title: t('contracts.signEntity'), dataIndex: 'signEntity' },
            { title: t('contracts.expiryDate'), dataIndex: 'expiryDate' },
            { title: t('contracts.paymentProgress'), dataIndex: 'paymentProgress' },
            {
              title: t('common.actions'),
              key: 'action',
              render: (_, record) => (
                <Button type="text" onClick={() => setSelected(record)}>{t('contracts.detail')}</Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={t('contracts.detail')}
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={640}
      >
        {selected && (
          <div>
            <div className="contract-detail-header">
              <div><FileTextOutlined style={{ fontSize: 28, color: '#0f172a' }} /></div>
              <div>
                <Text strong style={{ fontSize: 18 }}>{selected.contractNumber}</Text>
                <div className="text-muted">{selected.name}</div>
              </div>
            </div>
            <div className="contract-detail-grid">
              <div><Text className="text-muted">{t('contracts.customer')}</Text><div><Text strong>{getAccountById(selected.accountId)?.name}</Text></div></div>
              <div><Text className="text-muted">{t('contracts.total')}</Text><div><Text strong>{formatCurrency(selected.amountUsd)}</Text></div></div>
              <div><Text className="text-muted">{t('contracts.status')}</Text><div><span className={`pill pill-${statusTone(selected.status)}`}>{t(`labels.contractStatus.${selected.status}`)}</span></div></div>
              <div><Text className="text-muted">{t('contracts.signEntity')}</Text><div><Text strong>{selected.signEntity}</Text></div></div>
              <div><Text className="text-muted">{t('contracts.expiryDate')}</Text><div><CalendarOutlined /> {selected.expiryDate}</div></div>
              <div><Text className="text-muted">{t('contracts.paymentProgress')}</Text><div><Text strong>{selected.paymentProgress}</Text></div></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={t('contracts.create')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); clearCreateParam(); form.resetFields() }}
        onOk={() => {
          form.validateFields().then(async (values) => {
            const newContract = await storageService.contracts.create({
              contractNumber: values.contractNumber ?? '',
              accountId: values.accountId ?? '',
              name: values.name,
              type: values.type ?? '',
              status: values.status ?? 'draft',
              signEntity: values.signEntity ?? '',
              amountUsd: Number(values.amountUsd ?? 0),
              paymentProgress: '0%',
              paymentStatus: 'pending',
              expiryDate: values.expiryDate ?? '',
            })
            addContract(newContract)
            form.resetFields()
            setCreateOpen(false)
            clearCreateParam()
            success(t('common.successCreate'))
          })
        }}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item label={t('contracts.contractNo')} name="contractNumber"><Input /></Form.Item>
          <Form.Item label={t('contracts.name')} name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label={t('contracts.customer')} name="accountId"><Input /></Form.Item>
          <Form.Item label={t('contracts.total')} name="amountUsd">
            <InputNumber prefix={<DollarOutlined />} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label={t('contracts.status')} name="status"><Input /></Form.Item>
          <Form.Item label={t('contracts.signEntity')} name="signEntity"><Input /></Form.Item>
          <Form.Item label={t('contracts.expiryDate')} name="expiryDate"><Input /></Form.Item>
        </Form>
      </Modal>

      <style>{`
        .contract-detail-header { display: flex; align-items: center; gap: 16px; padding: 16px; border-bottom: 1px solid #f0f0f0; margin-bottom: 16px; }
        .contract-detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      `}</style>
    </div>
  )
}
