import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Avatar, Button, Card, Input, Table } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'
import { statusTone } from '../mocks/crmData'
import { useDataStore } from '../store/useDataStore'

export function TeamPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const users = useDataStore((state) => state.users)
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    return users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('team.title')}</div>
          <div className="crm-page-header-desc">{t('team.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/invite')}>{t('team.invite')}</Button>
      </div>

      <Card>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('team.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280, marginBottom: 16 }}
        />
        <Table
          dataSource={filtered}
          rowKey="id"
          pagination={false}
          columns={[
            { title: t('team.name'), dataIndex: 'name', render: (v, r: any) => <span><Avatar size="small" style={{ marginRight: 8, background: '#0f172a' }}>{r.avatar.slice(0, 1)}</Avatar>{v}</span> },
            { title: t('team.email'), dataIndex: 'email' },
            { title: t('team.department'), dataIndex: 'department' },
            { title: t('team.role'), dataIndex: 'role' },
            { title: t('team.market'), dataIndex: 'market' },
            { title: t('team.status'), dataIndex: 'status', render: (v) => <span className={`pill pill-${statusTone(v)}`}>{v === 'active' ? t('team.active') : t('team.inactive')}</span> },
          ]}
        />
      </Card>
    </div>
  )
}
