import { Card, Progress, Table, Tabs } from 'antd'
import { useState } from 'react'
import { useI18n } from '../hooks/useI18n'
import { annualTargets, markets } from '../mocks/crmData'

const periodKeys = (t: (k: string) => string) => [
  { key: 'year', label: t('countryReports.periodYear') },
  { key: 'q2', label: t('countryReports.periodQ2') },
  { key: 'june', label: t('countryReports.periodJune') },
  { key: 'week', label: t('countryReports.periodWeek') },
]

export function CountryReportsPage() {
  const { t } = useI18n()
  const [period, setPeriod] = useState('year')

  const data = markets.map((m) => {
    const target = annualTargets.find((t) => t.market === m.code)
    const actual = target ? Math.round(target.revenueTargetUsd * 0.35) : 0
    const percent = target ? Math.round((actual / target.revenueTargetUsd) * 100) : 0
    return {
      region: `${m.flag} ${m.code}`,
      fullYearTask: `$${(target?.revenueTargetUsd ?? 0).toLocaleString()}`,
      monthTarget: `$${Math.round((target?.revenueTargetUsd ?? 0) / 12).toLocaleString()}`,
      kpi: `$${(target?.kpiTargetUsd ?? 0).toLocaleString()}`,
      actual: `$${actual.toLocaleString()}`,
      progress: percent,
    }
  })

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t('countryReports.title')}</div>
          <div className="crm-page-header-desc">{t('countryReports.subtitle')}</div>
        </div>
      </div>

      <Card>
        <Tabs activeKey={period} onChange={setPeriod} items={periodKeys(t).map((p) => ({ key: p.key, label: p.label }))} />
        <Table
          dataSource={data}
          rowKey="region"
          pagination={false}
          columns={[
            { title: t('countryReports.region'), dataIndex: 'region' },
            { title: t('countryReports.annualTask'), dataIndex: 'fullYearTask' },
            { title: t('countryReports.monthlyTarget'), dataIndex: 'monthTarget' },
            { title: t('countryReports.kpi'), dataIndex: 'kpi' },
            { title: t('countryReports.actualReceipt'), dataIndex: 'actual' },
            { title: t('countryReports.progress'), dataIndex: 'progress', render: (v) => <Progress percent={v} size="small" strokeColor="#ee2737" trailColor="#ece6df" /> },
          ]}
        />
      </Card>
    </div>
  )
}
