import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App, ConfigProvider } from 'antd'
import { AngelCrmApp } from './app/AngelCrmApp'
import { useAntdLocale } from './locales/AntdLocaleProvider'
import './locales'
import './style.css'

function Root() {
  const antdLocale = useAntdLocale()
  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        token: {
          colorPrimary: '#ee2737',
          colorInfo: '#3b82f6',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ee2737',
          borderRadius: 6,
          fontSize: 13,
          colorBgLayout: '#eeeae4',
          colorText: '#101828',
          fontFamily:
            "'Barlow', 'Gotham', 'PingFang SC', 'Noto Sans SC', system-ui, -apple-system, sans-serif",
        },
        components: {
          Menu: {
            darkItemBg: '#1f2024',
            darkSubMenuItemBg: '#1f2024',
            darkItemSelectedBg: '#5a2429',
            darkItemHoverBg: '#2a2b30',
          },
          Layout: {
            siderBg: '#1f2024',
            headerBg: '#ffffff',
            bodyBg: '#eeeae4',
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
