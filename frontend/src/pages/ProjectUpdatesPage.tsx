import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, InputNumber, Modal, Select, Tag, Timeline, Typography } from 'antd'
import { useState } from 'react'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { getAccountById, getUserById } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useAuthStore } from '../store/useAuthStore'
import { useDataStore } from '../store/useDataStore'

const { Text } = Typography

const stages = ['survey', 'install', 'commissioning']

export function ProjectUpdatesPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const currentUser = useAuthStore((state) => state.user)
  const accounts = useDataStore((state) => state.accounts)
  const projectUpdates = useDataStore((state) => state.projectUpdates)
  const refresh = useDataStore((state) => state.refresh)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('projectUpdates.title')}</div>
          <div className="crm-page-header-desc">{t('projectUpdates.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>{t('projectUpdates.log')}</Button>
      </div>

      <Card>
        <Timeline
          mode="left"
          items={projectUpdates.map((p) => ({
            label: p.createdAt,
            children: (
              <div style={{ marginBottom: 12 }}>
                <Text strong>{getAccountById(p.accountId)?.name}</Text>
                <Tag color="blue" style={{ marginLeft: 8 }}>{t(`labels.projectStage.${p.stage}`)}</Tag>
                <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{p.summary}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {p.unitsInstalled ? `${t('projectUpdates.installed')} ${p.unitsInstalled} · ` : ''}{t('projectUpdates.recorder')}：{getUserById(p.postedById)?.name}
                </div>
              </div>
            ),
          }))}
        />
      </Card>

      <Modal
        title={t('projectUpdates.log')}
        open={open}
        onCancel={() => { setOpen(false); form.resetFields() }}
        onOk={() => {
          form.validateFields().then(async (values) => {
            await storageService.projectUpdates.create({
              accountId: values.accountId,
              postedById: currentUser?.id ?? 'u1',
              stage: values.stage,
              summary: values.summary,
              unitsInstalled: values.unitsInstalled,
              createdAt: new Date().toISOString().slice(0, 10),
            })
            await refresh()
            form.resetFields()
            setOpen(false)
            success(t('common.successSave'))
          })
        }}
        width={560}
      >
        <Form form={form} layout="vertical" initialValues={{ stage: 'survey' }}>
          <Form.Item label={t('projectUpdates.account')} name="accountId" rules={[{ required: true }]}>
            <Select options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
          </Form.Item>
          <Form.Item label={t('projectUpdates.stage')} name="stage" rules={[{ required: true }]}>
            <Select options={stages.map((k) => ({ value: k, label: t(`labels.projectStage.${k}`) }))} />
          </Form.Item>
          <Form.Item label={t('projectUpdates.installed')} name="unitsInstalled"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label={t('projectUpdates.notes')} name="summary" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
