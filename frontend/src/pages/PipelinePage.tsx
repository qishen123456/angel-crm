import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Tag, Typography } from 'antd'
import { useI18n } from '../hooks/useI18n'
import { getAccountById, getUserById, opportunities } from '../mocks/crmData'

const { Text, Title } = Typography

const stages = ['prospect', 'qualify', 'proposal', 'negotiate', 'closedWon']

export function PipelinePage() {
  const { t } = useI18n()
  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('pipeline.title')}</div>
          <div className="crm-page-header-desc">{t('pipeline.subtitle')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>{t('pipeline.newOpp')}</Button>
      </div>

      <div className="pipeline-board">
        {stages.map((stage) => {
          const items = opportunities.filter((o) => o.stage === stage)
          const total = items.reduce((s, o) => s + o.amountUsd, 0)
          return (
            <div className="pipeline-column" key={stage}>
              <div className="pipeline-column-header">
                <Title level={5}>{t(`labels.oppStage.${stage}`)}</Title>
                <div className="pipeline-column-meta">
                  <span className="pipeline-count">{items.length}</span>
                  <span className="pipeline-total">${(total / 1000).toFixed(0)}k</span>
                </div>
              </div>
              <div className="pipeline-cards">
                {items.map((o) => (
                  <Card key={o.id} className="pipeline-card" bodyStyle={{ padding: 14 }}>
                    <div className="pipeline-card-title">{o.name}</div>
                    <div className="pipeline-card-account">{getAccountById(o.accountId)?.name}</div>
                    <div className="pipeline-card-footer">
                      <Tag color="blue">{o.probability}%</Tag>
                      <Text strong>${(o.amountUsd / 1000).toFixed(0)}k</Text>
                    </div>
                    <div className="pipeline-card-owner">{getUserById(o.ownerId)?.name}</div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .pipeline-board { display: grid; grid-template-columns: repeat(5, minmax(220px, 1fr)); gap: 16px; overflow-x: auto; padding-bottom: 8px; }
        .pipeline-column { display: flex; flex-direction: column; gap: 12px; }
        .pipeline-column-header { display: flex; align-items: center; justify-content: space-between; }
        .pipeline-column-header h5 { margin: 0; font-size: 14px; }
        .pipeline-column-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .pipeline-count { min-width: 20px; height: 20px; border-radius: 999px; background: var(--angel-red); color: #fff; display: grid; place-items: center; font-weight: 700; }
        .pipeline-total { color: var(--text-muted); font-weight: 600; }
        .pipeline-cards { display: flex; flex-direction: column; gap: 10px; }
        .pipeline-card { border-left: 3px solid var(--angel-red); cursor: grab; transition: box-shadow .15s ease; }
        .pipeline-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }
        .pipeline-card-title { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
        .pipeline-card-account { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
        .pipeline-card-footer { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .pipeline-card-owner { font-size: 11px; color: var(--text-muted); }
        @media (max-width: 1200px) {
          .pipeline-board { grid-template-columns: repeat(5, 240px); }
        }
      `}</style>
    </div>
  )
}
