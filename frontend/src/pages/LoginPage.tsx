import { GlobalOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Select, Typography } from 'antd'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'
import { localeNames, type LocaleKey } from '../locales'
import { useAuthStore } from '../store/useAuthStore'
import { useUiStore } from '../store/useUiStore'

const { Title, Paragraph } = Typography

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const { t } = useI18n()
  const locale = useUiStore((s) => s.locale)
  const setLocale = useUiStore((s) => s.setLocale)
  const login = useAuthStore((s) => s.login)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from
  const targetPath = `${from?.pathname ?? '/app/today'}${from?.search ?? ''}`

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/app/today', { replace: true })
    }
  }, [isLoggedIn, navigate])

  return (
    <div className="angel-login-page">
      <header className="angel-login-topbar">
        <div className="angel-login-logo" aria-label="ANGEL">
          <span className="angel-login-logo-a">A</span>NGEL
        </div>
        <div className="angel-login-language">
          <GlobalOutlined />
          <Select
            variant="borderless"
            value={locale}
            onChange={(v) => setLocale(v as LocaleKey)}
            options={Object.entries(localeNames).map(([value, label]) => ({ label, value }))}
          />
        </div>
      </header>

      <main className="angel-login-main">
        <Card className="angel-login-card" bordered={false}>
          <div className="angel-login-heading">
            <Title level={1}>{t('login.title')}</Title>
            <Paragraph>{t('login.subtitle')}</Paragraph>
          </div>

          <button type="button" className="angel-login-sso" aria-label={t('login.sso')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <span>{t('login.sso')}</span>
          </button>

          <div className="angel-login-divider">
            <span>{t('login.divider')}</span>
          </div>

          <Form
            layout="vertical"
            className="angel-login-form"
            initialValues={{ email: 'admin@angel.cn', password: 'demo2026' }}
            onFinish={async (values) => {
              const ok = await login(values.email, values.password)
              if (!ok) {
                message.error(t('login.invalid') === 'login.invalid' ? '邮箱或密码错误' : t('login.invalid'))
                return
              }
              navigate(targetPath, { replace: true })
            }}
          >
            <Form.Item label={t('login.email')} name="email" rules={[{ required: true, type: 'email' }]}>
              <Input
                size="large"
                prefix={<MailOutlined />}
                placeholder={t('login.emailPlaceholder')}
                className="angel-login-input"
              />
            </Form.Item>

            <Form.Item label={t('login.password')} name="password" rules={[{ required: true }]}>
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder={t('login.passwordPlaceholder')}
                className="angel-login-input"
              />
            </Form.Item>

            <div className="angel-login-tips">
              <span>{t('login.tips')}</span>
              <button type="button">{t('login.forgot')}</button>
            </div>

            <Button type="primary" htmlType="submit" size="large" block className="angel-login-submit">
              {t('login.submit')}
            </Button>
          </Form>
        </Card>
      </main>

      <footer className="angel-login-footer">AHT Global Sales · ANGEL Health Technology</footer>

      <style>{`
        .angel-login-page { min-height: 100vh; background: var(--surface-page); display: flex; flex-direction: column; }
        .angel-login-topbar { height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; }
        .angel-login-logo { font-size: 22px; font-weight: 800; color: #000; }
        .angel-login-logo-a { color: var(--angel-red); }
        .angel-login-language { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-weight: 600; }
        .angel-login-main { flex: 1; display: grid; place-items: center; padding: 24px; }
        .angel-login-card { width: 100%; max-width: 420px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,.06); padding: 12px; }
        .angel-login-heading { text-align: center; margin-bottom: 24px; }
        .angel-login-heading h1 { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
        .angel-login-heading p { color: var(--text-muted); margin: 0; }
        .angel-login-sso { width: 100%; height: 48px; border-radius: 8px; border: 1px solid var(--border); background: #fff; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; cursor: pointer; margin-bottom: 20px; }
        .angel-login-sso:hover { border-color: var(--angel-red); color: var(--angel-red); }
        .angel-login-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; color: var(--text-muted); font-size: 12px; }
        .angel-login-divider::before, .angel-login-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .angel-login-form .ant-form-item-label > label { font-weight: 600; color: var(--text-secondary); }
        .angel-login-input { border-radius: 8px; }
        .angel-login-tips { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); margin: -8px 0 16px; }
        .angel-login-tips button { background: none; border: none; color: var(--angel-red); cursor: pointer; font-weight: 600; }
        .angel-login-submit { height: 46px; border-radius: 8px; background: var(--angel-red); border-color: var(--angel-red); font-weight: 700; }
        .angel-login-submit:hover { background: var(--angel-dred); border-color: var(--angel-dred); }
        .angel-login-footer { text-align: center; padding: 20px; font-size: 12px; color: var(--text-muted); }
      `}</style>
    </div>
  )
}
