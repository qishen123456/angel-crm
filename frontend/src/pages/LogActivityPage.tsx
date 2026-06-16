import { FormOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, List, Select, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { accounts, activities, getAccountById, getUserById, opportunities } from '../mocks/crmData'

const { Text } = Typography

const activityTypes = ['email', 'phone', 'meeting', 'visit', 'wechat', 'other', 'finance']

export function LogActivityPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const [form] = Form.useForm()
  const [list, setList] = useState(activities)

  const sorted = useMemo(() => [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [list])

  function onFinish(values: any) {
    const newActivity = {
      id: `act${Date.now()}`,
      accountId: values.accountId,
      opportunityId: values.opportunityId,
      createdAt: new Date().toISOString().slice(0, 10),
      createdById: 'u1',
      type: values.type,
      content: values.content,
    }
    setList((prev) => [newActivity, ...prev])
    form.resetFields()
    success(t('common.successCreate'))
  }

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('pages.logActivity')}</div>
          <div className="crm-page-header-desc">{t('logActivity.subtitle')}</div>
        </div>
      </div>

      <Card style={{ maxWidth: 720, marginBottom: 20 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label={t('logActivity.account')} name="accountId" rules={[{ required: true, message: t('common.required') }]}>
            <Select placeholder={t('logActivity.accountPlaceholder')} options={accounts.map((a) => ({ value: a.id, label: a.name }))} />
          </Form.Item>
          <Form.Item label={t('logActivity.opportunity')} name="opportunityId">
            <Select placeholder={t('logActivity.oppPlaceholder')} options={opportunities.map((o) => ({ value: o.id, label: o.name }))} />
          </Form.Item>
          <Form.Item label={t('logActivity.type')} name="type" initialValue={activityTypes[0]}>
            <Select options={activityTypes.map((v) => ({ value: v, label: t(`labels.activityType.${v}`) }))} />
          </Form.Item>
          <Form.Item label={t('logActivity.content')} name="content" rules={[{ required: true, message: t('common.required') }]}>
            <Input.TextArea rows={4} placeholder={t('logActivity.contentPlaceholder')} />
          </Form.Item>
          <Form.Item label={t('logActivity.reminder')} name="reminder">
            <Input placeholder="2026-06-18" />
          </Form.Item>
          <Button type="primary" icon={<FormOutlined />} htmlType="submit">
            {t('logActivity.save')}
          </Button>
        </Form>
      </Card>

      <Card title={t('logActivity.recentRecords')}>
        <List
          dataSource={sorted}
          renderItem={(item) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Tag color="blue">{t(`labels.activityType.${item.type}`)}</Tag>
                  <Text strong>{getAccountById(item.accountId)?.name}</Text>
                  <Text className="text-muted" style={{ fontSize: 12 }}>
                    {item.createdAt} · {getUserById(item.createdById)?.name}
                  </Text>
                </div>
                <Text>{item.content}</Text>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
