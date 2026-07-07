import { UploadOutlined } from '@ant-design/icons'
import { Button, Card, Upload, Typography } from 'antd'
import type { UploadFile } from 'antd'
import { useState } from 'react'
import { apiClient } from '../api/client'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { useDataStore } from '../store/useDataStore'

const { Text, Title } = Typography

export function ImportPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const refresh = useDataStore((state) => state.refresh)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [loading, setLoading] = useState(false)

  const startImport = async () => {
    const file = fileList[0]?.originFileObj
    if (!file) return
    setLoading(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await apiClient.post('/data/import', data)
      await refresh()
      setFileList([])
      success(t('common.successImport'))
    } finally {
      setLoading(false)
    }
  }

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
        <Upload.Dragger
          style={{ marginTop: 24 }}
          accept=".json"
          beforeUpload={() => false}
          maxCount={1}
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">{t('importPage.drag')}</p>
          <p className="ant-upload-hint">{t('importPage.hint')}</p>
        </Upload.Dragger>
        <Button type="primary" block style={{ marginTop: 16 }} loading={loading} disabled={!fileList.length} onClick={startImport}>{t('importPage.start')}</Button>
      </Card>
    </div>
  )
}
