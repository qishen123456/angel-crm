import { CheckCircleOutlined, HistoryOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, List, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { storageService } from '../services/storageService'
import { useAuthStore } from '../store/useAuthStore'
import { useDataStore } from '../store/useDataStore'

const { Text, Title } = Typography

export function AttendancePage() {
  const { t, locale } = useI18n()
  const { success } = useGlobalMessage()
  const currentUser = useAuthStore((state) => state.user)
  const attendanceRecords = useDataStore((state) => state.attendanceRecords)
  const refresh = useDataStore((state) => state.refresh)
  const records = attendanceRecords
    .filter((item) => !currentUser || item.userId === currentUser.id)
    .sort((a, b) => b.time.localeCompare(a.time))
  const [location, setLocation] = useState('AHT Singapore Office')
  const [note, setNote] = useState('')

  const lastType = records[0]?.type ?? 'out'
  const nextType = lastType === 'in' ? 'out' : 'in'

  async function punch() {
    const now = new Date()
    const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    await storageService.attendanceRecords.create({
      userId: currentUser?.id ?? 'u1',
      type: nextType,
      time,
      location,
      note,
    })
    await refresh()
    setNote('')
    success(nextType === 'in' ? t('attendance.punchIn') + t('common.successCreate') : t('attendance.punchOut') + t('common.successCreate'))
  }

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('pages.attendance')}</div>
          <div className="crm-page-header-desc">{t('attendance.subtitle')}</div>
        </div>
      </div>

      <Card style={{ maxWidth: 560, marginBottom: 20 }}>
        <Title level={4}>{new Date().toLocaleDateString(locale)} · {new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date())}</Title>
        <Text className="text-secondary">
          {t('attendance.status')}：
          <Tag color={lastType === 'in' ? 'success' : 'default'}>
            {lastType === 'in' ? t('attendance.checkedIn') : t('attendance.notCheckedIn')}
          </Tag>
        </Text>
        <Form layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label={t('attendance.location')}>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Form.Item>
          <Form.Item label={t('attendance.note')}>
            <Input.TextArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('attendance.placeholder')} />
          </Form.Item>
          <Button type="primary" icon={<CheckCircleOutlined />} block size="large" onClick={punch}>
            {nextType === 'in' ? t('attendance.punchIn') : t('attendance.punchOut')}
          </Button>
        </Form>
      </Card>

      <Card title={<><HistoryOutlined /> {t('attendance.records')}</>} style={{ maxWidth: 560 }}>
        <List
          dataSource={records}
          renderItem={(item) => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                <Tag color={item.type === 'in' ? 'success' : 'blue'}>{item.type === 'in' ? t('attendance.punchIn') : t('attendance.punchOut')}</Tag>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.time}</div>
                  <Text className="text-muted" style={{ fontSize: 12 }}>{item.location}</Text>
                </div>
                {item.note && <Text className="text-secondary" style={{ fontSize: 12 }}>{item.note}</Text>}
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
