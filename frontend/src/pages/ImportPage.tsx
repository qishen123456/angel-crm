import { UploadOutlined } from '@ant-design/icons'
import { Button, Card, Upload, Typography } from 'antd'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'

const { Text, Title } = Typography

export function ImportPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('importPage.title')}</div>
          <div className="crm-page-header-desc">{t('importPage.subtitle')}</div>
        </div>
      </div>

      <Card style={{ maxWidth: 560 }}>
        <Title level={5}>{t('importPage.upload')}</Title>
        <Text className="text-secondary">{t('importPage.subtitle')}</Text>
        <Upload.Dragger style={{ marginTop: 24 }}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">{t('importPage.drag')}</p>
          <p className="ant-upload-hint">{t('importPage.hint')}</p>
        </Upload.Dragger>
        <Button type="primary" block style={{ marginTop: 16 }} onClick={() => success(t('common.successImport'))}>{t('importPage.start')}</Button>
      </Card>
    </div>
  )
}
