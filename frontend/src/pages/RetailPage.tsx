import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Table } from 'antd'
import { useState } from 'react'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { storageService } from '../services/storageService'
import { useDataStore } from '../store/useDataStore'

export function RetailPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const retailMonthly = useDataStore((state) => state.retailMonthly)
  const refresh = useDataStore((state) => state.refresh)
  const [formOpen, setFormOpen] = useState(false)
  const [form] = Form.useForm()
  const totals = retailMonthly.reduce(
    (sum, item) => ({
      soUnits: sum.soUnits + item.soUnits,
      strategicUnits: sum.strategicUnits + item.strategicUnits,
      netStoreAdds: sum.netStoreAdds + item.netStoreAdds,
      sellThroughRate: sum.sellThroughRate + item.sellThroughRate,
    }),
    { soUnits: 0, strategicUnits: 0, netStoreAdds: 0, sellThroughRate: 0 },
  )
  const avgSellThrough = retailMonthly.length ? Math.round(totals.sellThroughRate / retailMonthly.length) : 0

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('retail.title')}</div>
          <div className="crm-page-header-desc">{t('retail.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>{t('retail.entry')}</Button>
      </div>

      <Row gutter={[16, 16]}>
        {[
          { label: t('retail.ytdSo'), value: String(totals.soUnits) },
          { label: t('retail.strategic'), value: String(totals.strategicUnits) },
          { label: t('retail.netNew'), value: totals.netStoreAdds > 0 ? `+${totals.netStoreAdds}` : String(totals.netStoreAdds) },
          { label: t('retail.sellThrough'), value: `${avgSellThrough}%` },
        ].map((k) => (
          <Col xs={12} md={6} key={k.label}>
            <Card>
              <div className="metric-card-label">{k.label}</div>
              <div className="metric-card-value">{k.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title={t('retail.monthlyData')}>
        <Table
          dataSource={retailMonthly}
          rowKey="id"
          pagination={false}
          columns={[
            { title: t('retail.month'), dataIndex: 'month' },
            { title: t('retail.overseasSo'), dataIndex: 'soUnits' },
            { title: t('retail.strategicUnits'), dataIndex: 'strategicUnits' },
            { title: t('retail.netNewStores'), dataIndex: 'netStoreAdds', render: (v) => (v > 0 ? `+${v}` : v) },
            { title: t('retail.sellThrough'), dataIndex: 'sellThroughRate', render: (v) => `${v}%` },
            { title: t('retail.activities'), dataIndex: 'events' },
            { title: t('retail.notes'), dataIndex: 'notes' },
          ]}
        />
      </Card>

      <Modal
        title={t('retail.entry')}
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields() }}
        onOk={() => {
          form.validateFields().then(async (values) => {
            await storageService.retailMonthly.create({
              month: values.month,
              soUnits: Number(values.soUnits ?? 0),
              strategicUnits: Number(values.strategicUnits ?? 0),
              netStoreAdds: Number(values.netStoreAdds ?? 0),
              sellThroughRate: Number(values.sellThroughRate ?? 0),
              events: Number(values.events ?? 0),
              notes: values.notes ?? '-',
            })
            await refresh()
            form.resetFields()
            setFormOpen(false)
            success(t('common.successSave'))
          })
        }}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item label={t('retail.month')} name="month" rules={[{ required: true }]}><Input placeholder="2026-06" /></Form.Item>
          <Form.Item label={t('retail.overseasSo')} name="soUnits"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label={t('retail.strategicUnits')} name="strategicUnits"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label={t('retail.netNewStores')} name="netStoreAdds"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label={t('retail.sellThrough')} name="sellThroughRate"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label={t('retail.activities')} name="events"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label={t('retail.notes')} name="notes"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
