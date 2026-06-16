import { Button, Card, Table } from 'antd'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { accounts, flagForMarket, statusTone } from '../mocks/crmData'

export function PoolPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const poolAccounts = accounts.filter((a) => !a.ownerId)

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('pool.title')}</div>
          <div className="crm-page-header-desc">{t('pool.subtitle')}</div>
        </div>
        <Button type="primary" onClick={() => success(t('common.successAssign'))}>
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
            { title: t('pool.action'), key: 'action', render: () => <Button type="text" onClick={() => success(t('common.successClaim'))}>{t('pool.claim')}</Button> },
          ]}
        />
      </Card>
    </div>
  )
}
