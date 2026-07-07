import { EditOutlined, EllipsisOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Card, Col, Dropdown, Form, Input, Modal, Progress, Row, Select, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAutoCreate } from '../hooks/useAutoCreate'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import {
  flagForMarket,
  getUserById,
  markets,
  statusTone,
  type Account,
  type MarketCode,
} from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useDataStore } from '../store/useDataStore'

const { Text, Title } = Typography

const statusFilters = (t: (k: string) => string) => [
  { key: 'all', label: t('accounts.statusAll') },
  { key: 'active', label: t('accounts.statusActive') },
  { key: 'expiring', label: t('accounts.statusExpiring') },
  { key: 'expired', label: t('accounts.statusExpired') },
]

export function AccountsPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const accounts = useDataStore((state) => state.accounts)
  const refresh = useDataStore((state) => state.refresh)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [marketFilter, setMarketFilter] = useState<MarketCode | 'all'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const clearCreateParam = useAutoCreate(setCreateOpen)

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || a.contractStatus === statusFilter
      const matchesMarket = marketFilter === 'all' || a.market === marketFilter
      return matchesSearch && matchesStatus && matchesMarket
    })
  }, [search, statusFilter, marketFilter])

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('accounts.title')}</div>
          <div className="crm-page-header-desc">
            {t('accounts.subtitle')}
            <span className="pill pill-amber" style={{ marginLeft: 8 }}>2 {t('accounts.statusExpiring')}</span>
          </div>
        </div>
        <Button type="primary" onClick={() => setCreateOpen(true)}>+ {t('accounts.createTitle')}</Button>
      </div>

      <Card>
        <div className="accounts-toolbar">
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('common.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />

          <div className="filter-group">
            {statusFilters(t).map((f) => (
              <button
                key={f.key}
                className={`filter-chip ${statusFilter === f.key ? 'active' : ''}`}
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <button
              className={`filter-chip ${marketFilter === 'all' ? 'active' : ''}`}
              onClick={() => setMarketFilter('all')}
            >
              {t('accounts.marketAll')}
            </button>
            {markets.map((m) => (
              <button
                key={m.code}
                className={`filter-chip ${marketFilter === m.code ? 'active' : ''}`}
                onClick={() => setMarketFilter(m.code)}
              >
                <span className="flag">{m.flag}</span>
                <span>{m.code}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="accounts-grid">
          {filtered.map((a) => (
            <AccountCard
              key={a.id}
              account={a}
              onEdit={() => {
                setEditing(a)
                editForm.setFieldsValue(a)
              }}
              onDelete={async () => {
                await storageService.accounts.delete(a.id)
                await refresh()
                success(t('common.successDelete') === 'common.successDelete' ? '已删除' : t('common.successDelete'))
              }}
            />
          ))}
        </div>
      </Card>

      <Modal
        title={t('accounts.createTitle')}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); clearCreateParam() }}
        onOk={() => {
          form.validateFields().then(async (values) => {
            await storageService.accounts.create({
              code: values.code,
              name: values.name,
              market: values.market,
              ownerId: values.ownerId,
              annualTargetUsd: Number(values.annualTargetUsd ?? 0),
              yearToDateUsd: 0,
              contractStatus: 'active',
              businessType: values.businessType,
              opportunityNotes: values.opportunityNotes ?? '',
              customerResources: '',
              nextDigDirections: '',
            })
            await refresh()
            form.resetFields()
            setCreateOpen(false)
            clearCreateParam()
            success(t('common.successCreate'))
          })
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item label={t('accounts.formName')} name="name" rules={[{ required: true }]}><Input placeholder="Raffles Hospitality" /></Form.Item></Col>
            <Col span={12}><Form.Item label={t('accounts.formCode')} name="code" rules={[{ required: true }]}><Input placeholder="RAFF" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item label={t('accounts.formMarket')} name="market" rules={[{ required: true }]}><Select options={markets.map(m => ({value:m.code, label:`${m.flag} ${m.code}`}))} /></Form.Item></Col>
            <Col span={12}><Form.Item label={t('accounts.formOwner')} name="ownerId" rules={[{ required: true }]}><Select options={['u2','u3','u4','u5'].map(id => ({value:id, label:getUserById(id)?.name}))} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item label={t('accounts.formType')} name="businessType" initialValue="commercial"><Select options={['commercial','retail','industrial','public'].map(v => ({value:v, label:t(`labels.businessType.${v}`)}))} /></Form.Item></Col>
            <Col span={12}><Form.Item label={t('accounts.formTarget')} name="annualTargetUsd"><Input prefix="$" placeholder="800000" /></Form.Item></Col>
          </Row>
          <Form.Item label={t('accounts.formNotes')} name="opportunityNotes"><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('accountDetail.edit')}
        open={!!editing}
        onCancel={() => setEditing(null)}
        onOk={() => {
          editForm.validateFields().then(async (values) => {
            if (!editing) return
            await storageService.accounts.update(editing.id, {
              ...values,
              annualTargetUsd: Number(values.annualTargetUsd ?? editing.annualTargetUsd),
            })
            await refresh()
            setEditing(null)
            success(t('common.successUpdate'))
          })
        }}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item label={t('accounts.formName')} name="name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label={t('accounts.formCode')} name="code" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item label={t('accounts.formMarket')} name="market"><Select options={markets.map(m => ({value:m.code, label:`${m.flag} ${m.code}`}))} /></Form.Item></Col>
            <Col span={12}><Form.Item label={t('accounts.formOwner')} name="ownerId"><Select options={['u2','u3','u4','u5'].map(id => ({value:id, label:getUserById(id)?.name}))} /></Form.Item></Col>
          </Row>
          <Form.Item label={t('accounts.formTarget')} name="annualTargetUsd"><Input prefix="$" /></Form.Item>
          <Form.Item label={t('accounts.formNotes')} name="opportunityNotes"><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>

      <style>{`
        .accounts-toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 20px; }
        .filter-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
      `}</style>
    </div>
  )
}

function AccountCard({ account, onEdit, onDelete }: { account: Account; onEdit: () => void; onDelete: () => void }) {
  const { t } = useI18n()
  const owner = getUserById(account.ownerId)
  const progress = Math.round((account.yearToDateUsd / account.annualTargetUsd) * 100)
  const tone = statusTone(account.contractStatus)

  return (
    <Link to={`/app/account/${account.id}`} className="account-card-link">
      <Card className="account-card" bodyStyle={{ padding: 16 }}>
        <div className="account-card-top">
          <div className="account-card-title-row">
            <Avatar size={40} style={{ background: '#0f172a', fontSize: 13, fontWeight: 700 }}>
              {owner?.avatar ?? '?'}
            </Avatar>
            <div className="account-card-title-wrap">
              <Title level={5} className="account-card-name">{account.name}</Title>
              <Text className="account-card-meta">
                <span className="flag">{flagForMarket(account.market)}</span>
                {account.market} · {account.code}
              </Text>
            </div>
          </div>
          <div className="account-card-actions">
            <Button type="text" icon={<UserOutlined />} size="small" onClick={(event) => { event.preventDefault(); onEdit() }} />
            <Button type="text" icon={<EditOutlined />} size="small" onClick={(event) => { event.preventDefault(); onEdit() }} />
            <Dropdown
              menu={{ items: [{ key: 'delete', label: t('common.delete') }], onClick: () => onDelete() }}
              trigger={['click']}
            >
              <Button type="text" icon={<EllipsisOutlined />} size="small" onClick={(event) => event.preventDefault()} />
            </Dropdown>
          </div>
        </div>

        <div className="account-card-status-row">
          <span className={`pill pill-${tone}`}>{t(`labels.contractStatus.${account.contractStatus}`)}</span>
          {account.contractExpiresAt && account.contractStatus !== 'active' && (
            <Text className="account-card-expiry">{t('accounts.expiresOn', { date: account.contractExpiresAt })}</Text>
          )}
        </div>

        <div className="account-card-progress">
          <div className="account-card-progress-label">
            <Text strong>{t('accounts.target')}</Text>
            <Text className="text-muted">
              ${(account.yearToDateUsd / 1000).toFixed(0)}k / ${(account.annualTargetUsd / 1000).toFixed(0)}k · {progress}%
            </Text>
          </div>
          <Progress percent={progress} showInfo={false} strokeColor={progress >= 70 ? '#ee2737' : progress >= 50 ? '#101828' : '#9ca3af'} trailColor="#ece6df" size="small" />
        </div>

        <div className="account-card-footer">
          <Text className="text-muted">{t('accounts.owner')}</Text>
          <Text strong>{owner?.name ?? '-'}</Text>
        </div>
      </Card>

      <style>{`
        .account-card-link { color: inherit; text-decoration: none; }
        .account-card { transition: box-shadow .15s ease, transform .1s ease; }
        .account-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,.08); transform: translateY(-1px); }
        .account-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
        .account-card-title-row { display: flex; align-items: center; gap: 12px; }
        .account-card-title-wrap { display: flex; flex-direction: column; }
        .account-card-name { margin: 0; font-size: 15px; font-weight: 700; }
        .account-card-meta { font-size: 12px; color: var(--text-muted); }
        .account-card-actions { display: flex; gap: 2px; }
        .account-card-status-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .account-card-expiry { font-size: 12px; color: var(--text-muted); }
        .account-card-progress { margin-bottom: 12px; }
        .account-card-progress-label { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; }
        .account-card-footer { display: flex; justify-content: space-between; align-items: center; font-size: 12px; padding-top: 10px; border-top: 1px solid var(--border); }
      `}</style>
    </Link>
  )
}
