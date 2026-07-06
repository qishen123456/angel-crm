import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Table } from 'antd'
import { useState } from 'react'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { retailMonthly } from '../mocks/crmData'

export function RetailPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const [formOpen, setFormOpen] = useState(false)

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
          { label: t('retail.ytdSo'), value: '939' },
          { label: t('retail.strategic'), value: '278' },
          { label: t('retail.netNew'), value: '+4' },
          { label: t('retail.sellThrough'), value: '71%' },
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
        onCancel={() => setFormOpen(false)}
        onOk={() => { setFormOpen(false); success(t('common.successSave')) }}
        width={560}
      >
        <Form layout="vertical">
          <Form.Item label={t('retail.month')}><Input placeholder="2026-06" /></Form.Item>
          <Form.Item label={t('retail.overseasSo')}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label={t('retail.strategicUnits')}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label={t('retail.netNewStores')}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label={t('retail.sellThrough')}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label={t('retail.notes')}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
