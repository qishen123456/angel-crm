import {
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  StarFilled,
  TrophyOutlined,
  WarningFilled,
  WarningOutlined,
} from '@ant-design/icons'
import { Button, Card, Progress, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DailyReportModal } from '../components/DailyReportModal'
import type { DailyReportData } from '../components/DailyReportModal'
import { useGlobalMessage } from '../hooks/useGlobalMessage'
import { useI18n } from '../hooks/useI18n'
import { annualTargets, getUserById } from '../mocks/crmData'

const { Title, Text } = Typography

const todayAlerts = [
  {
    tone: 'red' as const,
    ownerId: 'u4',
    date: '2026-06-16',
    levelKey: 'urgent',
    account: 'HK Hospitality Corp',
    textKey: 'hkHospitalityDiscount',
  },
  {
    tone: 'orange' as const,
    ownerId: 'u2',
    date: '2026-06-16',
    levelKey: 'high',
    account: 'Marina Bay Sands',
    textKey: 'marinaBayContract',
  },
]

const todayTodo = [
  { titleKey: 'noFollowUp', textKey: 'hkHospitalityNoFollowUp', tone: 'red' as const, icon: 'warning' as const },
  { titleKey: 'noFollowUp', textKey: 'gentingNoFollowUp', tone: 'red' as const, icon: 'warning' as const },
  { titleKey: 'noFollowUp', textKey: 'bangkokMallNoFollowUp', tone: 'red' as const, icon: 'warning' as const },
  { titleKey: 'expiring', textKey: 'marinaBayExpiring', tone: 'orange' as const, icon: 'calendar' as const },
  { titleKey: 'expiring', textKey: 'soekarnoExpiring', tone: 'orange' as const, icon: 'calendar' as const },
  { titleKey: 'reminder', textKey: 'rafflesEndUserInfo', tone: 'teal' as const, icon: 'info' as const },
]

const followUps = [
  { account: 'MGM Macau', stageKey: 'proposal', taskKey: 'mgmPricingPushback', time: '11:30', ownerId: 'u4' },
  { account: 'Raffles Hospitality', stageKey: 'contact', taskKey: 'rafflesCatalogue', time: '15:00', ownerId: 'u2' },
]

function dailyReportKey() {
  const d = new Date()
  return `angel-daily-report-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadDailyReport(): DailyReportData | undefined {
  try {
    const raw = localStorage.getItem(dailyReportKey())
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as DailyReportData
    return parsed.work?.length || parsed.plans?.length ? parsed : undefined
  } catch {
    return undefined
  }
}

function saveDailyReport(data: DailyReportData) {
  try {
    localStorage.setItem(dailyReportKey(), JSON.stringify(data))
  } catch {
    // ignore
  }
}

function useGreeting(t: (k: string) => string) {
  return useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 18) return t('today.greetingEvening')
    if (hour >= 14) return t('today.greetingAfternoon')
    if (hour >= 12) return t('today.greetingNoon')
    return t('today.greetingMorning')
  }, [t])
}

export function TodayPage() {
  const { t } = useI18n()
  const { success } = useGlobalMessage()
  const [reportOpen, setReportOpen] = useState(false)
  const [todayReport, setTodayReport] = useState<DailyReportData | undefined>(() => loadDailyReport())
  const greeting = useGreeting(t)
  const totalKpiTarget = annualTargets.reduce((s, t) => s + t.kpiTargetUsd, 0)
  const monthKpi = Math.round(totalKpiTarget / 12)
  const quarterKpi = Math.round(totalKpiTarget / 4)
  const todoCount = todayTodo.length + followUps.length + todayAlerts.length

  const kpis = [
    { label: t('today.monthly'), value: '$109k', total: `$${(monthKpi / 1000).toFixed(0)}k`, percent: 34, rev: 'Rev $153k' },
    { label: t('today.quarterly'), value: '$109k', total: `$${(quarterKpi / 1000).toFixed(0)}k`, percent: 7, rev: 'Rev $249k' },
    { label: t('today.yearly'), value: '$109k', total: `$${(totalKpiTarget / 1000).toFixed(0)}k`, percent: 4, rev: 'Rev $249k' },
  ]

  return (
    <div className="today-page">
      <div className="today-container">
        <section className="today-hero">
          <Title level={2} className="today-hero-title">
            {greeting}
            {t('today.admin')} 👋
          </Title>
          <Text className="today-hero-sub">{t('today.subtitle', { count: todoCount })}</Text>
        </section>

        <Card className="kpi-card" bordered={false}>
          <div className="kpi-card-header">
            <div className="kpi-card-title-wrap">
              <TrophyOutlined className="kpi-card-icon" />
              <div>
                <Title level={4} className="kpi-card-title">
                  {t('today.targetAchievement')}
                </Title>
                <Text className="kpi-card-desc">{t('today.targetSubtitle')}</Text>
              </div>
            </div>
            <Tag className="kpi-tag">
              <StarFilled style={{ fontSize: 11, marginRight: 4 }} />
              {t('today.shippedClearedTag')}
            </Tag>
          </div>

          <div className="kpi-row">
            {kpis.map((k) => (
              <div className="kpi-item" key={k.label}>
                <Text className="kpi-item-label">{k.label}</Text>
                <div className="kpi-item-value">
                  <span>{k.value}</span>
                  <small>{`/ ${k.total}`}</small>
                </div>
                <Progress percent={k.percent} showInfo={false} strokeColor={{ from: '#f59e0b', to: '#fbbf24' }} trailColor="#e5e5e5" size="small" strokeLinecap="round" />
                <div className="kpi-item-meta">
                  <span className="kpi-achieved">
                    {k.percent}% {t('today.achieved')}
                  </span>
                  <span className="kpi-rev">{k.rev}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <section className={`banner-report ${todayReport ? 'submitted' : ''}`}>
          <div className="banner-report-copy">
            <div className="banner-report-title">
              <div className="banner-report-icon">
                <FileTextOutlined />
              </div>
              <Title level={4}>{todayReport ? t('today.reportSubmitted') : t('today.todayReport')}</Title>
              <Tag color={todayReport ? 'success' : 'error'}>{todayReport ? t('today.streakDays', { count: 1 }) : t('today.daysUnsubmitted', { count: 3 })}</Tag>
            </div>
            <Text>{todayReport ? t('today.reportSavedHint') : `${t('today.reportHint')} · ${t('today.streak', { count: 0 })}`}</Text>
          </div>
          <Button type="primary" danger className="banner-report-btn" onClick={() => setReportOpen(true)}>
            {todayReport ? t('today.viewReport') : `+ ${t('today.writeReport')}`}
          </Button>
        </section>

        <Link to="/app/pipeline" className="shortcut-card">
          <div className="shortcut-icon funnel-icon">
            <BarChartOutlined />
          </div>
          <div className="shortcut-body">
            <Title level={4}>{t('today.viewFunnel')}</Title>
            <Text>{t('today.funnelDesc')}</Text>
          </div>
        </Link>

        <section className="today-section">
          <div className="section-header">
            <WarningFilled className="section-header-icon alert-icon" />
            <Text strong className="section-header-text">
              {t('today.teamEvents')}
            </Text>
            <span className="section-count">{todayAlerts.length}</span>
          </div>
          <div className="section-list">
            {todayAlerts.map((item) => (
              <article className={`alert-card tone-${item.tone}`} key={item.textKey}>
                <div className="alert-meta">
                  <span className={`alert-dot tone-${item.tone}`} />
                  <strong>{getUserById(item.ownerId)?.name}</strong>
                  <span>· {item.date}</span>
                  <Tag color={item.tone === 'red' ? 'error' : 'warning'} className="alert-level">
                    {t(`today.alertLevel.${item.levelKey}`)}
                  </Tag>
                  <span>{item.account}</span>
                </div>
                <Title level={5} className="alert-title">
                  {t(`today.alertText.${item.textKey}`)}
                </Title>
              </article>
            ))}
          </div>
        </section>

        <section className="today-section">
          <Text className="section-label">{t('today.todo')}</Text>
          <div className="section-list">
            {todayTodo.map((item) => (
              <article className={`todo-card tone-${item.tone}`} key={item.textKey}>
                <div className="todo-icon">
                  {item.icon === 'warning' ? <WarningOutlined /> : item.icon === 'calendar' ? <ClockCircleOutlined /> : <BellOutlined />}
                </div>
                <div className="todo-body">
                  <div className={`todo-title tone-${item.tone}`}>{t(`today.todoTitle.${item.titleKey}`)}</div>
                  <Text className="todo-text">{t(`today.todoText.${item.textKey}`)}</Text>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="today-section">
          <Text className="section-label">{t('today.followUps')}</Text>
          <div className="section-list">
            {followUps.map((f) => (
              <article className="followup-card" key={f.taskKey}>
                <div className="followup-icon">
                  <CalendarOutlined />
                </div>
                <div className="followup-body">
                  <div className="followup-main">
                    <Text strong>{f.account}</Text>
                    <Text className="followup-stage">· {t(`today.followUpStage.${f.stageKey}`)}</Text>
                  </div>
                  <Text className="followup-task">{t(`today.followUpTask.${f.taskKey}`)}</Text>
                </div>
                <div className="followup-meta">
                  {f.time} · {getUserById(f.ownerId)?.name}
                </div>
              </article>
            ))}
          </div>
        </section>

        <DailyReportModal
          open={reportOpen}
          initial={todayReport}
          onCancel={() => setReportOpen(false)}
          onSubmit={(data) => {
            saveDailyReport(data)
            setTodayReport(data)
            setReportOpen(false)
            success(t('today.reportSaveSuccess'))
          }}
        />
      </div>

      <style>{`
        .today-page { background: #F5F5F3; margin: -20px -24px -30px; padding: 20px 24px 30px; min-height: calc(100vh - 56px); }
        .today-container { max-width: 1440px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
        .today-hero { margin-bottom: 2px; }
        .today-hero-title { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
        .today-hero-sub { color: var(--text-muted); font-size: 13px; }

        .kpi-card { background: #fff; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,.04); padding: 18px 20px; }
        .kpi-card .ant-card-body { padding: 0; }
        .kpi-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .kpi-card-title-wrap { display: flex; gap: 10px; align-items: flex-start; }
        .kpi-card-icon { font-size: 22px; color: var(--angel-red); margin-top: 2px; }
        .kpi-card-title { margin: 0; font-size: 16px; font-weight: 700; line-height: 1.3; }
        .kpi-card-desc { color: var(--text-muted); font-size: 12px; display: block; line-height: 1.4; }
        .kpi-tag { display: inline-flex; align-items: center; background: #fff7ed; color: #b45309; border: 1px solid #fed7aa; border-radius: 999px; padding: 2px 10px; font-size: 11px; font-weight: 600; }

        .kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .kpi-item { display: flex; flex-direction: column; gap: 8px; background: #f5f5f5; border-radius: 8px; padding: 14px 16px; }
        .kpi-item-label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
        .kpi-item-value { display: flex; align-items: baseline; gap: 6px; }
        .kpi-item-value span { font-size: 20px; font-weight: 700; color: var(--text-primary); }
        .kpi-item-value small { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .kpi-item-meta { display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px; }
        .kpi-achieved { color: #b45309; font-weight: 600; }
        .kpi-rev { color: var(--text-muted); }
        .kpi-item .ant-progress-bg { height: 5px !important; }
        .kpi-item .ant-progress-inner { background: #e5e5e5 !important; border-radius: 999px; }

        .banner-report { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 18px; }
        .banner-report.submitted { background: #f0fdf4; border-color: #86efac; }
        .banner-report-copy { display: flex; flex-direction: column; gap: 3px; }
        .banner-report-title { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
        .banner-report-title h4 { margin: 0; font-size: 15px; font-weight: 700; }
        .banner-report-icon { width: 32px; height: 32px; border-radius: 8px; background: #fde68a; color: #b45309; display: grid; place-items: center; font-size: 16px; }
        .banner-report.submitted .banner-report-icon { background: #bbf7d0; color: #15803d; }
        .banner-report-copy > .ant-typography { color: var(--text-muted); font-size: 12px; }
        .banner-report-btn { background: var(--angel-red); border-color: var(--angel-red); border-radius: 6px; font-weight: 600; height: 36px; }
        .banner-report-btn:hover { background: var(--angel-dred); border-color: var(--angel-dred); }

        .shortcut-card { display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 14px 18px; color: inherit; text-decoration: none; transition: box-shadow .15s ease; }
        .shortcut-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.06); }
        .shortcut-icon { width: 44px; height: 44px; border-radius: 8px; display: grid; place-items: center; font-size: 20px; }
        .shortcut-icon.funnel-icon { background: #fee2e2; color: #dc2626; }
        .shortcut-body { display: flex; flex-direction: column; gap: 2px; }
        .shortcut-card h4 { margin: 0; font-size: 15px; font-weight: 700; }
        .shortcut-body .ant-typography { color: var(--text-muted); font-size: 12px; margin: 0; }

        .today-section { display: flex; flex-direction: column; gap: 10px; }
        .section-label { font-size: 12px; color: var(--text-muted); font-weight: 600; }
        .section-header { display: flex; align-items: center; gap: 8px; }
        .section-header-icon { font-size: 14px; }
        .section-header-icon.alert-icon { color: #ec4899; }
        .section-header-text { font-size: 12px; color: var(--text-muted); }
        .section-count { min-width: 18px; height: 18px; border-radius: 5px; background: var(--angel-red); color: #fff; font-size: 11px; font-weight: 700; display: grid; place-items: center; padding: 0 5px; }
        .section-list { display: flex; flex-direction: column; gap: 10px; }

        .alert-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 13px 16px; border-left: 3px solid var(--angel-red); }
        .alert-card.tone-orange { border-left-color: #f59e0b; }
        .alert-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
        .alert-meta strong { color: var(--text-primary); font-weight: 600; }
        .alert-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--angel-red); }
        .alert-dot.tone-orange { background: #f59e0b; }
        .alert-level { font-size: 11px; padding: 1px 7px; }
        .alert-title { margin: 0; font-size: 13px; line-height: 1.5; font-weight: 600; }

        .todo-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 11px 14px; border-left: 3px solid var(--status-amber); display: flex; align-items: center; gap: 12px; }
        .todo-card.tone-red { border-left-color: var(--angel-red); }
        .todo-card.tone-orange { border-left-color: var(--status-amber); }
        .todo-card.tone-teal { border-left-color: #14b8a6; }
        .todo-icon { font-size: 16px; color: var(--status-amber); display: grid; place-items: center; }
        .todo-card.tone-red .todo-icon { color: var(--angel-red); }
        .todo-card.tone-teal .todo-icon { color: #14b8a6; }
        .todo-body { display: flex; flex-direction: column; gap: 2px; }
        .todo-title { font-size: 13px; font-weight: 700; color: var(--status-amber); }
        .todo-title.tone-red { color: var(--angel-red); }
        .todo-title.tone-teal { color: #0d9488; }
        .todo-text { font-size: 13px; color: var(--text-primary); margin: 0; }

        .followup-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 11px 14px; border-left: 3px solid #3b82f6; display: flex; align-items: center; gap: 12px; }
        .followup-icon { font-size: 16px; color: #3b82f6; display: grid; place-items: center; }
        .followup-body { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .followup-main { display: flex; align-items: center; gap: 6px; font-size: 13px; }
        .followup-main .ant-typography { font-weight: 700; }
        .followup-stage { color: var(--text-muted); font-weight: 500; }
        .followup-task { font-size: 12px; color: var(--text-muted); margin: 0; }
        .followup-meta { font-size: 12px; color: var(--text-muted); white-space: nowrap; }

        @media (max-width: 900px) {
          .kpi-row { grid-template-columns: 1fr; }
          .today-container { padding: 0; }
        }
      `}</style>
    </div>
  )
}
