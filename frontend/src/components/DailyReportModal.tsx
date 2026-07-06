import {
  DeleteOutlined,
  FileTextOutlined,
  PhoneOutlined,
  PlusOutlined,
  WarningFilled,
} from '@ant-design/icons'
import { Button, Card, Input, Modal, Space, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../hooks/useI18n'

const { Title, Text } = Typography

export interface DailyReportData {
  work: string[]
  followups: string[]
  plans: string[]
  payments: string[]
  problems: string[]
  issues: string[]
  mood: number | null
}

interface DailyReportModalProps {
  open: boolean
  initial?: DailyReportData
  onCancel: () => void
  onSubmit: (data: DailyReportData) => void
}

const emptyReport: DailyReportData = {
  work: [''],
  followups: [],
  plans: [''],
  payments: [''],
  problems: [''],
  issues: [],
  mood: null,
}

function normalizeList(items: string[] | undefined, fallback: string[]): string[] {
  if (!Array.isArray(items) || items.length === 0) return fallback
  return items
}

function useReportData(open: boolean, initial?: DailyReportData) {
  const [data, setData] = useState<DailyReportData>(emptyReport)

  useEffect(() => {
    if (!open) return
    setData(
      initial
        ? {
            ...initial,
            work: normalizeList(initial.work, ['']),
            plans: normalizeList(initial.plans, ['']),
            payments: normalizeList(initial.payments, ['']),
            problems: normalizeList(initial.problems, ['']),
            followups: initial.followups ?? [],
            issues: initial.issues ?? [],
            mood: initial.mood ?? null,
          }
        : emptyReport,
    )
  }, [open, initial])

  return [data, setData] as const
}

interface DynamicListProps {
  title: string
  placeholder: string
  items: string[]
  onChange: (items: string[]) => void
  addLabel: string
}

function DynamicList({ title, placeholder, items, onChange, addLabel }: DynamicListProps) {
  const { t } = useI18n()
  const update = (idx: number, value: string) => {
    const next = [...items]
    next[idx] = value
    onChange(next)
  }

  const remove = (idx: number) => {
    if (items.length <= 1) return
    const next = [...items]
    next.splice(idx, 1)
    onChange(next)
  }

  const add = () => onChange([...items, ''])

  return (
    <section className="drm-section">
      <Text className="drm-section-title">{title}</Text>
      <div className="drm-list">
        {items.map((value, idx) => (
          <div className="drm-row" key={idx}>
            <span className="drm-index">{idx + 1}.</span>
            <Input
              value={value}
              onChange={(e) => update(idx, e.target.value)}
              placeholder={placeholder}
              className="drm-input"
            />
            {items.length > 1 ? (
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => remove(idx)}
                className="drm-delete"
                aria-label={t('dailyReport.delete')}
              />
            ) : (
              <span className="drm-delete-placeholder" />
            )}
          </div>
        ))}
      </div>
      <Button type="dashed" icon={<PlusOutlined />} onClick={add} className="drm-add-btn">
        {addLabel}
      </Button>
    </section>
  )
}

interface FollowupSectionProps {
  items: string[]
  onChange: (items: string[]) => void
}

function FollowupSection({ items, onChange }: FollowupSectionProps) {
  const { t } = useI18n()
  const update = (idx: number, value: string) => {
    const next = [...items]
    next[idx] = value
    onChange(next)
  }

  const remove = (idx: number) => {
    const next = [...items]
    next.splice(idx, 1)
    onChange(next)
  }

  const add = () => onChange([...items, ''])

  return (
    <Card className="drm-followup-card" bordered={false}>
      <div className="drm-card-header">
        <PhoneOutlined className="drm-card-icon blue" />
        <Text strong className="drm-card-title blue">
          {t('dailyReport.followupTitle')}
        </Text>
      </div>
      <Text className="drm-card-desc">{t('dailyReport.followupDesc')}</Text>

      {items.length === 0 ? (
        <div className="drm-empty-box blue">
          <Text className="drm-empty-text">{t('dailyReport.followupEmpty')}</Text>
        </div>
      ) : (
        <div className="drm-list">
          {items.map((value, idx) => (
            <div className="drm-row" key={idx}>
              <span className="drm-index">{idx + 1}.</span>
              <Input
                value={value}
                onChange={(e) => update(idx, e.target.value)}
                placeholder={t('dailyReport.followupPlaceholder')}
                className="drm-input"
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => remove(idx)}
                className="drm-delete"
                aria-label={t('dailyReport.delete')}
              />
            </div>
          ))}
        </div>
      )}

      <Button type="dashed" block onClick={add} className="drm-followup-add">
        {t('dailyReport.followupAdd')}
      </Button>
    </Card>
  )
}

interface IssueSectionProps {
  items: string[]
  onChange: (items: string[]) => void
}

function IssueSection({ items, onChange }: IssueSectionProps) {
  const { t } = useI18n()
  const update = (idx: number, value: string) => {
    const next = [...items]
    next[idx] = value
    onChange(next)
  }

  const remove = (idx: number) => {
    const next = [...items]
    next.splice(idx, 1)
    onChange(next)
  }

  const add = () => onChange([...items, ''])

  return (
    <Card className="drm-issue-card" bordered={false}>
      <div className="drm-card-header">
        <WarningFilled className="drm-card-icon red" />
        <Text strong className="drm-card-title red">
          {t('dailyReport.issueTitle')}
        </Text>
      </div>
      <Text className="drm-card-desc red">{t('dailyReport.issueDesc')}</Text>

      {items.length === 0 ? (
        <div className="drm-empty-box red">
          <Text className="drm-empty-text">{t('dailyReport.issueEmpty')}</Text>
        </div>
      ) : (
        <div className="drm-list">
          {items.map((value, idx) => (
            <div className="drm-row" key={idx}>
              <span className="drm-index">{idx + 1}.</span>
              <Input
                value={value}
                onChange={(e) => update(idx, e.target.value)}
                placeholder={t('dailyReport.issuePlaceholder')}
                className="drm-input"
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => remove(idx)}
                className="drm-delete"
                aria-label={t('dailyReport.delete')}
              />
            </div>
          ))}
        </div>
      )}

      <Button type="dashed" block onClick={add} className="drm-issue-add">
        {t('dailyReport.issueAdd')}
      </Button>
    </Card>
  )
}

export function DailyReportModal({ open, initial, onCancel, onSubmit }: DailyReportModalProps) {
  const { t } = useI18n()
  const [data, setData] = useReportData(open, initial)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) setTouched(false)
  }, [open])

  const moods = useMemo(
    () => [
      t('dailyReport.mood.sad'),
      t('dailyReport.mood.upset'),
      t('dailyReport.mood.neutral'),
      t('dailyReport.mood.happy'),
      t('dailyReport.mood.excited'),
    ],
    [t],
  )

  const workFilled = useMemo(() => data.work.some(Boolean), [data.work])
  const plansFilled = useMemo(() => data.plans.some(Boolean), [data.plans])

  const handleSubmit = () => {
    setTouched(true)
    if (!workFilled || !plansFilled) return

    onSubmit({
      ...data,
      work: data.work.filter(Boolean),
      plans: data.plans.filter(Boolean),
      payments: data.payments.filter(Boolean),
      problems: data.problems.filter(Boolean),
      followups: data.followups.filter(Boolean),
      issues: data.issues.filter(Boolean),
    })
  }

  const setField = <K extends keyof DailyReportData>(key: K, value: DailyReportData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      width={640}
      centered
      footer={null}
      className="daily-report-modal"
      title={null}
      closable
    >
      <div className="drm-body">
        <div className="drm-header">
          <FileTextOutlined className="drm-header-icon" />
          <Title level={4} className="drm-header-title">
            {t('dailyReport.title')}
          </Title>
        </div>
        <Text className="drm-header-hint">{t('dailyReport.hint')}</Text>

        <DynamicList
          title={t('dailyReport.workTitle')}
          placeholder={t('dailyReport.workPlaceholder')}
          items={data.work}
          onChange={(work) => setField('work', work)}
          addLabel={t('dailyReport.addRow')}
        />
        {touched && !workFilled && <Text className="drm-error-text">{t('dailyReport.error.workRequired')}</Text>}

        <FollowupSection items={data.followups} onChange={(followups) => setField('followups', followups)} />

        <DynamicList
          title={t('dailyReport.planTitle')}
          placeholder={t('dailyReport.planPlaceholder')}
          items={data.plans}
          onChange={(plans) => setField('plans', plans)}
          addLabel={t('dailyReport.addRow')}
        />
        {touched && !plansFilled && <Text className="drm-error-text">{t('dailyReport.error.planRequired')}</Text>}

        <DynamicList
          title={t('dailyReport.paymentTitle')}
          placeholder={t('dailyReport.paymentPlaceholder')}
          items={data.payments}
          onChange={(payments) => setField('payments', payments)}
          addLabel={t('dailyReport.addRow')}
        />

        <DynamicList
          title={t('dailyReport.problemTitle')}
          placeholder={t('dailyReport.problemPlaceholder')}
          items={data.problems}
          onChange={(problems) => setField('problems', problems)}
          addLabel={t('dailyReport.addRow')}
        />

        <IssueSection items={data.issues} onChange={(issues) => setField('issues', issues)} />

        <section className="drm-section">
          <Text strong className="drm-section-title">
            {t('dailyReport.moodTitle')}
          </Text>
          <Space size={16} className="drm-mood-row">
            {moods.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                title={emoji}
                aria-label={emoji}
                aria-pressed={data.mood === idx}
                className={`drm-mood-btn ${data.mood === idx ? 'selected' : ''}`}
                onClick={() => setField('mood', data.mood === idx ? null : idx)}
              >
                {['😞', '😟', '😐', '🙂', '😄'][idx]}
              </button>
            ))}
          </Space>
        </section>
      </div>

      <div className="drm-footer">
        <Button className="drm-cancel-btn" onClick={onCancel}>
          {t('dailyReport.cancel')}
        </Button>
        <Button type="primary" className="drm-save-btn" onClick={handleSubmit}>
          {t('dailyReport.save')}
        </Button>
      </div>

      <style>{`
        .daily-report-modal .ant-modal-content { border-radius: 14px; overflow: hidden; }
        .daily-report-modal .ant-modal-close { top: 16px; right: 16px; }
        .daily-report-modal .ant-modal-body { padding: 20px 24px 16px; }
        .drm-body { padding: 4px 2px 4px; max-height: 70vh; overflow-y: auto; }
        .drm-header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
        .drm-header-icon { font-size: 20px; color: var(--text-primary); }
        .drm-header-title { margin: 0; font-size: 18px; font-weight: 700; }
        .drm-header-hint { display: block; color: var(--text-muted); font-size: 13px; margin-bottom: 20px; }

        .drm-section { margin-bottom: 20px; }
        .drm-section-title { display: block; font-size: 14px; margin-bottom: 10px; }
        .drm-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
        .drm-row { display: flex; align-items: center; gap: 10px; }
        .drm-index { width: 24px; text-align: right; color: var(--text-muted); font-size: 14px; flex-shrink: 0; }
        .drm-input { flex: 1; border-radius: 8px; }
        .drm-delete { color: var(--angel-red); width: 32px; flex-shrink: 0; }
        .drm-delete-placeholder { width: 32px; flex-shrink: 0; }
        .drm-add-btn { border-radius: 8px; }
        .drm-error-text { display: block; color: #E51C23; font-size: 12px; margin: -14px 0 16px 34px; }

        .drm-followup-card { background: #EBF3FF; border: 1px solid #d6e8ff; border-radius: 12px; margin-bottom: 20px; }
        .drm-issue-card { background: #FFF0F0; border: 1px solid #ffd6d6; border-radius: 12px; margin-bottom: 20px; }
        .drm-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .drm-card-icon { font-size: 16px; }
        .drm-card-icon.blue { color: #2563eb; }
        .drm-card-icon.red { color: #dc2626; }
        .drm-card-title.blue { color: #2563eb; }
        .drm-card-title.red { color: #dc2626; }
        .drm-card-desc { display: block; font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px; }
        .drm-card-desc.red { color: #b91c1c; }
        .drm-empty-box { border: 1px dashed; border-radius: 10px; padding: 22px; text-align: center; margin-bottom: 12px; }
        .drm-empty-box.blue { border-color: #93c5fd; background: #EBF3FF; }
        .drm-empty-box.red { border-color: #fca5a5; background: #FFF0F0; }
        .drm-empty-text { font-size: 13px; color: var(--text-muted); }
        .drm-followup-add { border-radius: 8px; border-color: #93c5fd; color: #2563eb; }
        .drm-issue-add { border-radius: 8px; border-color: #fca5a5; color: #dc2626; }

        .drm-mood-row { margin-top: 6px; }
        .drm-mood-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid transparent; background: #f5f5f5; font-size: 22px; line-height: 1; cursor: pointer; opacity: .55; transition: all .15s ease; }
        .drm-mood-btn:hover { opacity: .85; background: #ededed; transform: scale(1.05); }
        .drm-mood-btn.selected { opacity: 1; background: #fff7ed; border-color: #fbbf24; transform: scale(1.08); }

        .drm-footer { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid var(--border); }
        .drm-cancel-btn { background: #fff; border-color: #d9d9d9; color: #101828; border-radius: 8px; }
        .drm-save-btn { background: #E51C23; border-color: #E51C23; color: #fff; border-radius: 8px; }
        .drm-save-btn:hover { background: #c5161d; border-color: #c5161d; }
      `}</style>
    </Modal>
  )
}
