import { MailOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Select } from 'antd'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'

export function InvitePage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('invite.title')}</div>
          <div className="crm-page-header-desc">{t('invite.subtitle')}</div>
        </div>
      </div>

      <Card style={{ maxWidth: 480 }}>
        <Form layout="vertical">
          <Form.Item label={t('invite.email')}>
            <Input prefix={<MailOutlined />} placeholder="colleague@angel.cn" />
          </Form.Item>
          <Form.Item label={t('invite.name')}><Input placeholder={t('invite.name')} /></Form.Item>
          <Form.Item label={t('invite.role')}>
            <Select options={['Sales', 'Finance', 'Marketing', 'Operations', 'Admin'].map((r) => ({ value: r, label: r }))} />
          </Form.Item>
          <Form.Item label={t('invite.market')}>
            <Select options={['SG', 'HK', 'MY', 'TH', 'ID', 'MO', 'US'].map((m) => ({ value: m, label: m }))} />
          </Form.Item>
          <Button type="primary" block onClick={() => success(t('common.successInvite'))}>{t('invite.send')}</Button>
        </Form>
      </Card>
    </div>
  )
}
