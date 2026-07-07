import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App, ConfigProvider } from 'antd'
import { useEffect } from 'react'
import { AngelCrmApp } from './app/AngelCrmApp'
import { useAntdLocale } from './locales/AntdLocaleProvider'
import { useSystemSettingsStore } from './store/useSystemSettingsStore'
import './locales'
import './style.css'

function Root() {
  const antdLocale = useAntdLocale()
  const settings = useSystemSettingsStore((s) => s.settings)
  const loadSettings = useSystemSettingsStore((s) => s.load)
  const applySettings = useSystemSettingsStore((s) => s.apply)

  useEffect(() => {
    applySettings()
    if (localStorage.getItem('angelcrm_auth_token')) {
      void loadSettings()
    }
  }, [applySettings, loadSettings])

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        token: {
          colorPrimary: settings.primaryColor,
          colorInfo: '#3b82f6',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: settings.primaryColor,
          borderRadius: 6,
          fontSize: 13,
          colorBgLayout: settings.pageBackground,
          colorText: '#101828',
          fontFamily: settings.fontFamily,
        },
        components: {
          Menu: {
            darkItemBg: settings.sidebarBackground,
            darkSubMenuItemBg: settings.sidebarBackground,
            darkItemSelectedBg: settings.sidebarActiveBackground,
            darkItemHoverBg: '#2a2b30',
          },
          Layout: {
            siderBg: settings.sidebarBackground,
            headerBg: settings.headerBackground,
            bodyBg: settings.pageBackground,
          },
        },
      }}
    >
      <App>
        <BrowserRouter>
          <AngelCrmApp />
        </BrowserRouter>
      </App>
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
