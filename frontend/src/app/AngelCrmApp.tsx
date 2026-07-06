import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { LoginPage } from '../pages/LoginPage'
import { CrmDashboardPage } from '../pages/CrmDashboardPage'
import type { PageKey } from '../mocks/crmData'
import { AccountDetailPage } from '../pages/AccountDetailPage'
import { ProtectedRoute } from '../components/ProtectedRoute'

const route = (pageKey: PageKey) => <CrmDashboardPage pageKey={pageKey} />

export function AngelCrmApp() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app/*" element={<AppLayout />}>
          <Route path="today" element={route('today')} />
          <Route path="dashboard" element={route('dashboard')} />
          <Route path="workqueue" element={route('workqueue')} />
          <Route path="attendance" element={route('attendance')} />
          <Route path="campaigns" element={route('campaigns')} />
          <Route path="leads" element={route('leads')} />
          <Route path="retail" element={route('retail')} />
          <Route path="accounts" element={route('accounts')} />
          <Route path="account/:id" element={<AccountDetailPage />} />
          <Route path="pool" element={route('pool')} />
          <Route path="contacts" element={route('contacts')} />
          <Route path="end-users" element={route('endUsers')} />
          <Route path="pipeline" element={route('pipeline')} />
          <Route path="log-activity" element={route('logActivity')} />
          <Route path="project-updates" element={route('projectUpdates')} />
          <Route path="contracts" element={route('contracts')} />
          <Route path="orders" element={route('orders')} />
          <Route path="invoices" element={route('invoices')} />
          <Route path="payments" element={route('payments')} />
          <Route path="products" element={route('products')} />
          <Route path="country-reports" element={route('countryReports')} />
          <Route path="report" element={route('executiveReport')} />
          <Route path="import" element={route('import')} />
          <Route path="invite" element={route('invite')} />
          <Route path="team" element={route('team')} />
          <Route path="settings" element={route('settings')} />
          <Route path="*" element={<Navigate to="/app/today" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
