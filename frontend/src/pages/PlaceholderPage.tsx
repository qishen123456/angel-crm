import { Card, Typography } from 'antd'
import { pageTitles } from '../mocks/crmData'
import { useI18n } from '../hooks/useI18n'

const { Text, Title } = Typography

export function PlaceholderPage({ title }: { title: string }) {
  const { t } = useI18n()
  const titleKey = pageTitles[title as keyof typeof pageTitles] ?? title
  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div className="crm-page-header-left">
          <div className="crm-page-header-title">{t(titleKey)}</div>
          <div className="crm-page-header-desc">{t('placeholderPage.subtitle')}</div>
        </div>
      </div>
      <Card>
        <Title level={5}>{t('placeholderPage.comingSoon')}</Title>
        <Text className="text-secondary">{t('placeholderPage.description')}</Text>
      </Card>
    </div>
  )
}
