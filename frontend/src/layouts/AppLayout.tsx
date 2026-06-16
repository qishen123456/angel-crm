import type { ReactNode } from 'react'
import {
  ApartmentOutlined,
  AuditOutlined,
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  CreditCardOutlined,
  DownOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FlagOutlined,
  FundOutlined,
  GlobalOutlined,
  HomeOutlined,
  ImportOutlined,
  NotificationOutlined,
  OrderedListOutlined,
  ProductOutlined,
  ScheduleOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  TranslationOutlined,
  UserAddOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons'
import {
  App,
  Avatar,
  Badge,
  Button,
  Dropdown,
  Layout,
  Menu,
  Select,
  Space,
  Typography,
} from 'antd'
import type { MenuProps } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'
import { localeNames, type LocaleKey } from '../locales'
import { useUiStore } from '../store/useUiStore'

const { Header, Sider, Content } = Layout

const iconMap: Record<string, ReactNode> = {
  '/app/today': <HomeOutlined />,
  '/app/dashboard': <BarChartOutlined />,
  '/app/workqueue': <CheckSquareOutlined />,
  '/app/attendance': <CalendarOutlined />,
  '/app/campaigns': <NotificationOutlined />,
  '/app/leads': <FlagOutlined />,
  '/app/retail': <ShopOutlined />,
  '/app/accounts': <ApartmentOutlined />,
  '/app/pool': <GlobalOutlined />,
  '/app/contacts': <TeamOutlined />,
  '/app/end-users': <UserOutlined />,
  '/app/pipeline': <FundOutlined />,
  '/app/log-activity': <ScheduleOutlined />,
  '/app/project-updates': <AuditOutlined />,
  '/app/contracts': <FileTextOutlined />,
  '/app/orders': <OrderedListOutlined />,
  '/app/invoices': <FileDoneOutlined />,
  '/app/payments': <CreditCardOutlined />,
  '/app/products': <ProductOutlined />,
  '/app/country-reports': <BarChartOutlined />,
  '/app/report': <FundOutlined />,
  '/app/import': <ImportOutlined />,
  '/app/invite': <UserAddOutlined />,
  '/app/team': <UsergroupAddOutlined />,
  '/app/settings': <SettingOutlined />,
}

const routeToPageKey: Record<string, string> = {
  '/app/today': 'today',
  '/app/dashboard': 'dashboard',
  '/app/workqueue': 'workqueue',
  '/app/attendance': 'attendance',
  '/app/campaigns': 'campaigns',
  '/app/leads': 'leads',
  '/app/retail': 'retail',
  '/app/accounts': 'accounts',
  '/app/account/a1': 'accounts',
  '/app/pool': 'pool',
  '/app/contacts': 'contacts',
  '/app/end-users': 'endUsers',
  '/app/pipeline': 'pipeline',
  '/app/log-activity': 'logActivity',
  '/app/project-updates': 'projectUpdates',
  '/app/contracts': 'contracts',
  '/app/orders': 'orders',
  '/app/invoices': 'invoices',
  '/app/payments': 'payments',
  '/app/products': 'products',
  '/app/country-reports': 'countryReports',
  '/app/report': 'executiveReport',
  '/app/import': 'import',
  '/app/invite': 'invite',
  '/app/team': 'team',
  '/app/settings': 'settings',
}

export function AppLayout() {
  App.useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const locale = useUiStore((state) => state.locale)
  const setLocale = useUiStore((state) => state.setLocale)
  const { t, bundle } = useI18n()
  const selectedKey = location.pathname.startsWith('/app/account')
    ? '/app/accounts'
    : location.pathname
  const pageKey = location.pathname.startsWith('/app/account')
    ? 'accountDetail'
    : (routeToPageKey[location.pathname] ?? routeToPageKey[selectedKey] ?? 'today')

  const menuItems: MenuProps['items'] = bundle.menu.map((group) => ({
    key: `grp-${group.key}`,
    type: 'group',
    label: <span className="crm-menu-group-title">{group.label}</span>,
    children: group.items.map((item) => ({
      key: item.key,
      icon: iconMap[item.key],
      label: (
        <div className="crm-menu-item">
          <span>{item.label}</span>
          {item.badge ? <span className="crm-menu-badge">{item.badge}</span> : null}
        </div>
      ),
    })),
  }))

  const createMenuItems: MenuProps['items'] = [
    { key: 'account', label: bundle.createMenu.account },
    { key: 'contact', label: bundle.createMenu.contact },
    { key: 'opportunity', label: bundle.createMenu.opportunity },
    { key: 'order', label: bundle.createMenu.order },
    { key: 'lead', label: bundle.createMenu.lead },
    { key: 'campaign', label: bundle.createMenu.campaign },
    { key: 'activity', label: bundle.createMenu.activity },
  ]

  return (
    <Layout className="crm-shell">
      <Sider
        width={220}
        theme="dark"
        className="crm-sider"
        style={{ background: '#1f2024' }}
      >
        <div className="crm-logo">
          <div className="crm-logo-wordmark">
            <span className="crm-logo-wordmark-accent">A</span>NGEL
          </div>
          <Typography.Text className="crm-logo-subtitle">GLOBAL SALES CRM</Typography.Text>
        </div>

        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(String(key))}
          className="crm-menu"
          style={{ background: '#1f2024', borderRight: 'none' }}
        />

        <div className="crm-sider-footer">
          <div className="crm-profile">
            <Avatar size={36} className="crm-profile-avatar">
              {locale.startsWith('zh') ? t('adminAvatar') : 'A'}
            </Avatar>
            <div className="crm-profile-meta">
              <Typography.Text className="crm-profile-name">{bundle.systemAdmin}</Typography.Text>
              <Typography.Text className="crm-profile-sub">
                {bundle.systemAdmin}
              </Typography.Text>
            </div>
          </div>

          <div className="crm-sider-actions">
            <Select
              value={locale}
              onChange={(value) => setLocale(value as LocaleKey)}
              options={Object.entries(localeNames).map(([value, label]) => ({ label, value }))}
              className="crm-locale-select"
              popupMatchSelectWidth={false}
              suffixIcon={<TranslationOutlined />}
            />
            <Button type="text" className="crm-logout-btn" onClick={() => navigate('/login')}>
              {bundle.logout}
            </Button>
          </div>
        </div>
      </Sider>

      <Layout className="crm-main-layout">
        <Header className="crm-header">
          <Typography.Title level={4} className="crm-header-page">
            {bundle.pages[pageKey] ?? t('pages.today')}
          </Typography.Title>

          <Space size={12}>
            <Dropdown
              menu={{
                items: createMenuItems,
                onClick: ({ key }) => {
                  const createRouteMap: Record<string, string> = {
                    account: '/app/accounts',
                    contact: '/app/contacts',
                    opportunity: '/app/pipeline',
                    order: '/app/orders',
                    lead: '/app/leads',
                    campaign: '/app/campaigns',
                  }
                  if (key === 'activity') {
                    navigate('/app/log-activity')
                    return
                  }
                  const route = createRouteMap[key]
                  if (route) {
                    navigate(`${route}?create=1`)
                  }
                },
              }}
              placement="bottomRight"
            >
              <Button type="primary" className="crm-header-new">
                {bundle.newButton} <DownOutlined style={{ fontSize: 10 }} />
              </Button>
            </Dropdown>

            <Button className="crm-header-user" icon={<UserOutlined />}>
              {bundle.systemAdmin}
            </Button>

            <Badge dot>
              <Button className="crm-header-icon" icon={<BellOutlined />} />
            </Badge>

            <Button className="crm-date-chip">{bundle.currentDate}</Button>
          </Space>
        </Header>

        <Content className="crm-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
