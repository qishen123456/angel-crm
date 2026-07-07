import { MailOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Select } from 'antd'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { storageService } from '../services/storageService'
import { useDataStore } from '../store/useDataStore'

export function InvitePage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const refresh = useDataStore((state) => state.refresh)
  const [form] = Form.useForm()
  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('invite.title')}</div>
          <div className="crm-page-header-desc">{t('invite.subtitle')}</div>
        </div>
      </div>

      <Card style={{ maxWidth: 480 }}>
        <Form form={form} layout="vertical" initialValues={{ role: 'Sales', market: 'SG' }}>
          <Form.Item label={t('invite.email')} name="email" rules={[{ required: true }, { type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="colleague@angel.cn" />
          </Form.Item>
          <Form.Item label={t('invite.name')} name="name" rules={[{ required: true }]}><Input placeholder={t('invite.name')} /></Form.Item>
          <Form.Item label={t('invite.role')} name="role" rules={[{ required: true }]}>
            <Select options={['Sales', 'Finance', 'Marketing', 'Operations', 'Admin'].map((r) => ({ value: r, label: r }))} />
          </Form.Item>
          <Form.Item label={t('invite.market')} name="market" rules={[{ required: true }]}>
            <Select options={['SG', 'HK', 'MY', 'TH', 'ID', 'MO', 'US'].map((m) => ({ value: m, label: m }))} />
          </Form.Item>
          <Button
            type="primary"
            block
            onClick={() => {
              form.validateFields().then(async (values) => {
                await storageService.users.create({
                  name: values.name,
                  email: values.email,
                  role: values.role,
                  department: values.role,
                  market: values.market,
                  avatar: String(values.name).slice(0, 2),
                  status: 'active',
                })
                await refresh()
                form.resetFields()
                success(t('common.successInvite'))
              })
            }}
          >
            {t('invite.send')}
          </Button>
        </Form>
      </Card>
    </div>
  )
}
