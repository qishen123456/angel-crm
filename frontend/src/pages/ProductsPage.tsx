import { EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Modal, Select, Table } from 'antd'
import { useMemo, useState } from 'react'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { statusTone, type Product } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useDataStore } from '../store/useDataStore'

const productCategories = ['commercial', 'residential', 'industrial', 'strategic']
const productLines = ['commercial', 'retail', 'industrial', 'public']
const productStatuses = ['onSale', 'discontinued', 'rnd']

export function ProductsPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const products = useDataStore((state) => state.products)
  const refresh = useDataStore((state) => state.refresh)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const clearCreateParam = useAutoCreate(setCreateOpen)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const [form] = Form.useForm()

  const filtered = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('products.title')}</div>
          <div className="crm-page-header-desc">{t('products.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('products.create')}</Button>
      </div>

      <Card>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('products.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280, marginBottom: 16 }}
        />
        <Table
          dataSource={filtered}
          rowKey="id"
          pagination={false}
          columns={[
            { title: t('products.sku'), dataIndex: 'sku' },
            { title: t('products.name'), dataIndex: 'name' },
            { title: t('products.category'), dataIndex: 'category', render: (v) => t(`labels.productCategory.${v}`) },
            { title: t('products.productLine'), dataIndex: 'line' },
            { title: t('products.spec'), dataIndex: 'spec' },
            { title: t('products.unitPrice'), dataIndex: 'unitPrice', render: (v) => `$${v.toLocaleString()}` },
            { title: t('products.leadTime'), dataIndex: 'leadTime' },
            { title: t('products.stock'), dataIndex: 'stock' },
            { title: t('products.status'), dataIndex: 'status', render: (v) => <span className={`pill pill-${statusTone(v)}`}>{t(`labels.productStatus.${v}`)}</span> },
            {
              title: t('common.actions'),
              key: 'action',
              render: (_: any, record: Product) => (
                <Button type="text" icon={<EyeOutlined />} onClick={() => { setSelected(record); setDetailOpen(true) }} />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={t('products.create')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); clearCreateParam(); form.resetFields() }}
        onOk={() => {
          form.validateFields().then(async (values) => {
            await storageService.products.create({
              sku: values.sku,
              name: values.name,
              category: values.category,
              line: values.line,
              spec: values.spec ?? '',
              unitPrice: Number(values.unitPrice ?? 0),
              leadTime: values.leadTime ?? '-',
              stock: Number(values.stock ?? 0),
              status: values.status,
            })
            await refresh()
            form.resetFields()
            setCreateOpen(false)
            clearCreateParam()
            success(t('common.successCreate'))
          })
        }}
        width={560}
      >
        <Form form={form} layout="vertical" initialValues={{ category: 'commercial', line: 'commercial', status: 'onSale' }}>
          <Form.Item label={t('products.sku')} name="sku" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label={t('products.name')} name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label={t('products.category')} name="category" rules={[{ required: true }]}>
            <Select options={productCategories.map((v) => ({ value: v, label: t(`labels.productCategory.${v}`) }))} />
          </Form.Item>
          <Form.Item label={t('products.productLine')} name="line" rules={[{ required: true }]}>
            <Select options={productLines.map((v) => ({ value: v, label: t(`labels.productLine.${v}`) }))} />
          </Form.Item>
          <Form.Item label={t('products.spec')} name="spec"><Input /></Form.Item>
          <Form.Item label={t('products.unitPrice')} name="unitPrice"><Input prefix="$" /></Form.Item>
          <Form.Item label={t('products.leadTime')} name="leadTime"><Input /></Form.Item>
          <Form.Item label={t('products.stock')} name="stock"><Input /></Form.Item>
          <Form.Item label={t('products.status')} name="status" rules={[{ required: true }]}>
            <Select options={productStatuses.map((v) => ({ value: v, label: t(`labels.productStatus.${v}`) }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('products.detail')}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={560}
      >
        {selected && (
          <Form layout="vertical">
            <Form.Item label={t('products.sku')}><Input readOnly value={selected.sku} /></Form.Item>
            <Form.Item label={t('products.name')}><Input readOnly value={selected.name} /></Form.Item>
            <Form.Item label={t('products.category')}><Input readOnly value={t(`labels.productCategory.${selected.category}`)} /></Form.Item>
            <Form.Item label={t('products.productLine')}><Input readOnly value={selected.line} /></Form.Item>
            <Form.Item label={t('products.spec')}><Input readOnly value={selected.spec} /></Form.Item>
            <Form.Item label={t('products.unitPrice')}><Input readOnly value={`$${selected.unitPrice.toLocaleString()}`} /></Form.Item>
            <Form.Item label={t('products.leadTime')}><Input readOnly value={selected.leadTime} /></Form.Item>
            <Form.Item label={t('products.stock')}><Input readOnly value={selected.stock} /></Form.Item>
            <Form.Item label={t('products.status')}><Input readOnly value={t(`labels.productStatus.${selected.status}`)} /></Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}
