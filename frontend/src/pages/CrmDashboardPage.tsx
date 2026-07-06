import type { PageKey } from '../mocks/crmData'
import { TodayPage } from './TodayPage'
import { DashboardPage } from './DashboardPage'
import { AccountsPage } from './AccountsPage'
import { CampaignsPage } from './CampaignsPage'
import { LeadsPage } from './LeadsPage'
import { RetailPage } from './RetailPage'
import { OrdersPage } from './OrdersPage'
import { SettingsPage } from './SettingsPage'
import { PipelinePage } from './PipelinePage'
import { ContactsPage } from './ContactsPage'
import { PoolPage } from './PoolPage'
import { EndUsersPage } from './EndUsersPage'
import { ContractsPage } from './ContractsPage'
import { InvoicesPage } from './InvoicesPage'
import { PaymentsPage } from './PaymentsPage'
import { ProductsPage } from './ProductsPage'
import { TeamPage } from './TeamPage'
import { CountryReportsPage } from './CountryReportsPage'
import { ExecutiveReportPage } from './ExecutiveReportPage'
import { WorkQueuePage } from './WorkQueuePage'
import { AttendancePage } from './AttendancePage'
import { LogActivityPage } from './LogActivityPage'
import { ProjectUpdatesPage } from './ProjectUpdatesPage'
import { ImportPage } from './ImportPage'
import { InvitePage } from './InvitePage'
import { PlaceholderPage } from './PlaceholderPage'

export function CrmDashboardPage({ pageKey }: { pageKey: PageKey }) {
  switch (pageKey) {
    case 'today':
      return <TodayPage />
    case 'dashboard':
      return <DashboardPage />
    case 'accounts':
      return <AccountsPage />
    case 'campaigns':
      return <CampaignsPage />
    case 'leads':
      return <LeadsPage />
    case 'retail':
      return <RetailPage />
    case 'orders':
      return <OrdersPage />
    case 'settings':
      return <SettingsPage />
    case 'pipeline':
      return <PipelinePage />
    case 'contacts':
      return <ContactsPage />
    case 'pool':
      return <PoolPage />
    case 'endUsers':
      return <EndUsersPage />
    case 'contracts':
      return <ContractsPage />
    case 'invoices':
      return <InvoicesPage />
    case 'payments':
      return <PaymentsPage />
    case 'products':
      return <ProductsPage />
    case 'team':
      return <TeamPage />
    case 'countryReports':
      return <CountryReportsPage />
    case 'executiveReport':
      return <ExecutiveReportPage />
    case 'workqueue':
      return <WorkQueuePage />
    case 'attendance':
      return <AttendancePage />
    case 'logActivity':
      return <LogActivityPage />
    case 'projectUpdates':
      return <ProjectUpdatesPage />
    case 'import':
      return <ImportPage />
    case 'invite':
      return <InvitePage />
    default:
      return <PlaceholderPage title={pageKey} />
  }
}
