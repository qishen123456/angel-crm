import { Button, Card, Table } from 'antd'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { flagForMarket, statusTone, type Account } from '../mocks/crmData'
import { storageService } from '../services/storageService'
import { useAuthStore } from '../store/useAuthStore'
import { useDataStore } from '../store/useDataStore'

export function PoolPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const currentUser = useAuthStore((state) => state.user)
  const accounts = useDataStore((state) => state.accounts)
  const refresh = useDataStore((state) => state.refresh)
  const poolAccounts = accounts.filter((a) => !a.ownerId)

  const claimAccount = async (account: Account) => {
    if (!currentUser) return
    await storageService.accounts.update(account.id, { ownerId: currentUser.id })
    await refresh()
    success(t('common.successClaim'))
  }

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('pool.title')}</div>
          <div className="crm-page-header-desc">{t('pool.subtitle')}</div>
        </div>
        <Button
          type="primary"
          disabled={!poolAccounts.length || !currentUser}
          onClick={async () => {
            if (poolAccounts[0]) {
              await claimAccount(poolAccounts[0])
            }
          }}
        >
          {t('pool.assign')}
        </Button>
      </div>

      <Card>
        <Table
          dataSource={poolAccounts}
          rowKey="id"
          pagination={false}
          columns={[
            { title: t('pool.code'), dataIndex: 'code' },
            { title: t('pool.name'), dataIndex: 'name' },
            { title: t('pool.market'), dataIndex: 'market', render: (v) => <span>{flagForMarket(v)} {v}</span> },
            { title: t('pool.type'), dataIndex: 'businessType' },
            { title: t('pool.status'), dataIndex: 'contractStatus', render: (v) => <span className={`pill pill-${statusTone(v)}`}>{t(`labels.contractStatus.${v}`)}</span> },
            { title: t('pool.target'), dataIndex: 'annualTargetUsd', render: (v) => `$${v.toLocaleString()}` },
            { title: t('pool.action'), key: 'action', render: (_: unknown, record: Account) => <Button type="text" onClick={() => claimAccount(record)}>{t('pool.claim')}</Button> },
          ]}
        />
      </Card>
    </div>
  )
}
