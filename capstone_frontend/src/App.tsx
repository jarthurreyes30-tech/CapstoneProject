import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGate from "./components/RoleGate";
import { ThemeProvider } from "./components/ThemeProvider";

// Public Pages
import Index from "./pages/Index";
import PublicCharities from "./pages/PublicCharities";
import CharityDetail from "./pages/CharityDetail";
import CharityPublicProfile from "./pages/CharityPublicProfile";
import PublicAbout from "./pages/PublicAbout";
import CampaignPage from "./pages/campaigns/CampaignPage";
import { GlobalRefreshIndicator } from "./components/GlobalRefreshIndicator";

// Error Pages
import { Error404, Error500, Error503, ErrorBoundary } from "./pages/errors";

// Auth pages
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Register from "./pages/auth/Register";
import RegisterDonor from "./pages/auth/RegisterDonor";
import RegisterCharity from "./pages/auth/RegisterCharity";
import VerifyEmail from "./pages/auth/VerifyEmail";
import RegistrationStatus from "./pages/auth/RegistrationStatus";
import RetrieveDonor from "./pages/auth/RetrieveDonor";
import RetrieveCharity from "./pages/auth/RetrieveCharity";

// Legal pages
import DonorTerms from "./pages/legal/DonorTerms";
import DonorPrivacy from "./pages/legal/DonorPrivacy";
import CharityTerms from "./pages/legal/CharityTerms";
import CharityPrivacy from "./pages/legal/CharityPrivacy";

// Donor Components
import { DonorLayout } from "./components/donor/DonorLayout";
// Donor pages
import DonorDashboard from "./pages/donor/DonorDashboard";
import NewsFeed from "./pages/donor/NewsFeed";
import MakeDonation from "./pages/donor/MakeDonation";
import DonateToCampaign from "./pages/donor/DonateToCampaign";
import DonationHistory from "./pages/donor/DonationHistory";
import RefundRequests from "./pages/donor/RefundRequests";
import FundTransparency from "./pages/donor/FundTransparency";
import DonorProfile from "./pages/donor/DonorProfile";
import DonorProfilePage from "./pages/donor/DonorProfilePage";
import EditProfile from "./pages/donor/EditProfile";
import AccountSettings from "./pages/donor/AccountSettings";
import HelpCenter from "./pages/donor/HelpCenter";
import BrowseCharities from "./pages/donor/BrowseCharities";
import BrowseCampaignsFiltered from "./pages/donor/BrowseCampaignsFiltered";
import Notifications from "./pages/donor/Notifications";
import DonorCharityProfile from "./pages/donor/CharityProfile";
import DonorReports from "./pages/donor/Reports";
import Leaderboard from "./pages/donor/Leaderboard";
import DonorAnalytics from "./pages/donor/Analytics";
import ChangeEmail from "./pages/donor/ChangeEmail";
import TwoFactorAuth from "./pages/donor/TwoFactorAuth";
import RecurringDonations from "./pages/donor/RecurringDonations";
import Statements from "./pages/donor/Statements";
import PaymentMethods from "./pages/donor/PaymentMethods";
import TaxInfo from "./pages/donor/TaxInfo";
import Following from "./pages/donor/Following";
import Saved from "./pages/donor/Saved";
import Support from "./pages/donor/Support";
import Messages from "./pages/donor/Messages";
import Sessions from "./pages/donor/Sessions";
import DownloadData from "./pages/donor/DownloadData";
import NotificationPreferences from "./pages/donor/NotificationPreferences";
import ResendVerification from "./pages/auth/ResendVerification";

// Charity Components
import { CharityLayout } from "./components/charity/CharityLayout";
import CharityDashboard from "./pages/charity/CharityDashboard";
import CharityEditProfile from "./pages/charity/EditProfile";
import CharityProfilePage from "./pages/charity/CharityProfilePage";
import OrganizationProfile from "./pages/charity/OrganizationProfile";
import CampaignManagement from "./pages/charity/CampaignManagement";
import CampaignDetailPage from "./pages/charity/CampaignDetailPage";
import DonationManagement from "./pages/charity/DonationManagement";
import CharityRefundRequests from "./pages/charity/RefundRequests";
import CharityFundTracking from "./pages/charity/FundTracking";
import CharityUpdates from "./pages/charity/CharityUpdates";
import Bin from "./pages/charity/Bin";
import CharitySettings from "./pages/charity/Settings";
import CharityHelpCenter from "./pages/charity/HelpCenter";
import CharityVolunteers from "./pages/charity/Volunteers";
import CharityDocuments from "./pages/charity/Documents";
import DocumentUploads from "./pages/charity/DocumentUploads";
import CharityNotifications from "./pages/charity/Notifications";
import CharityReports from "./pages/charity/Reports";
import ReportsAnalytics from "./pages/charity/ReportsAnalytics";
import CharityAnalytics from "./pages/charity/Analytics";

// --- 1. IMPORT THE NEW ADMIN COMPONENTS ---
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Charities from "./pages/admin/Charities";
import Settings from "./pages/admin/Settings";
import Reports from "./pages/admin/Reports";
import ActionLogs from "./pages/admin/ActionLogs";
import FundTracking from "./pages/admin/FundTracking";
import AdminProfile from "./pages/admin/Profile";
import TestEmail from "./pages/admin/TestEmail";
import AdminNotifications from "./pages/admin/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="charityhub-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GlobalRefreshIndicator />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ErrorBoundary>
            <AuthProvider>
              <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/charities" element={<PublicCharities />} />
            <Route path="/charities/:id" element={<CharityDetail />} />
            <Route path="/charity/:id" element={<CharityPublicProfile />} />
            <Route path="/donor/profile/:id" element={<DonorProfilePage />} />
            <Route path="/about" element={<PublicAbout />} />
            <Route path="/campaigns/:id" element={<CampaignPage />} />
            
            {/* Error Routes */}
            <Route path="/404" element={<Error404 />} />
            <Route path="/500" element={<Error500 />} />
            <Route path="/503" element={<Error503 />} />
            <Route path="/maintenance" element={<Error503 />} />
            
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/register/donor" element={<RegisterDonor />} />
            <Route path="/auth/register/charity" element={<RegisterCharity />} />
            <Route path="/auth/forgot" element={<ForgotPassword />} />
            <Route path="/auth/reset" element={<ResetPassword />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/registration-status" element={<RegistrationStatus />} />
            <Route path="/auth/retrieve/donor" element={<RetrieveDonor />} />
            <Route path="/auth/retrieve/charity" element={<RetrieveCharity />} />
            <Route path="/auth/resend-verification" element={<ResendVerification />} />
            
            {/* Legal Routes */}
            <Route path="/legal/donor/terms" element={<DonorTerms />} />
            <Route path="/legal/donor/privacy" element={<DonorPrivacy />} />
            <Route path="/legal/charity/terms" element={<CharityTerms />} />
            <Route path="/legal/charity/privacy" element={<CharityPrivacy />} />
            
            {/* Donor Dashboard */}
            <Route 
              path="/donor"
              element={
                <ProtectedRoute>
                  <RoleGate allow={['donor']}>
                    <DonorLayout />
                  </RoleGate>
                </ProtectedRoute>
              }
            >
              <Route index element={<DonorDashboard />} />
              <Route path="news-feed" element={<NewsFeed />} />
              <Route path="donate" element={<MakeDonation />} />
              <Route path="donate/:charityId" element={<MakeDonation />} />
              <Route path="campaigns/:campaignId/donate" element={<DonateToCampaign />} />
              <Route path="history" element={<DonationHistory />} />
              <Route path="refunds" element={<RefundRequests />} />
              <Route path="transparency" element={<FundTransparency />} />
              <Route path="profile" element={<DonorProfilePage />} />
              <Route path="edit-profile" element={<EditProfile />} />
              <Route path="settings" element={<AccountSettings />} />
              <Route path="charities" element={<BrowseCharities />} />
              <Route path="charities/:id" element={<DonorCharityProfile />} />
              <Route path="campaigns/browse" element={<BrowseCampaignsFiltered />} />
              <Route path="reports" element={<DonorReports />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="analytics" element={<DonorAnalytics />} />
              <Route path="campaign-analytics" element={<DonorAnalytics />} />
              <Route path="insights" element={<CharityAnalytics />} />
              <Route path="help" element={<HelpCenter />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings/change-email" element={<ChangeEmail />} />
              <Route path="settings/2fa" element={<TwoFactorAuth />} />
              <Route path="recurring" element={<RecurringDonations />} />
              <Route path="statements" element={<Statements />} />
              <Route path="billing" element={<PaymentMethods />} />
              <Route path="billing/tax-info" element={<TaxInfo />} />
              <Route path="following" element={<Following />} />
              <Route path="saved" element={<Saved />} />
              <Route path="support" element={<Support />} />
              <Route path="settings/sessions" element={<Sessions />} />
              <Route path="settings/download-data" element={<DownloadData />} />
              <Route path="settings/notifications" element={<NotificationPreferences />} />
            </Route>

            {/* Messages (accessible to both donors and charities) */}
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />

            {/* Charity Admin Dashboard */}
            <Route 
              path="/charity"
              element={
                <ProtectedRoute>
                  <RoleGate allow={['charity_admin']}>
                    <CharityLayout />
                  </RoleGate>
                </ProtectedRoute>
              }
            >
              <Route index element={<CharityDashboard />} />
              <Route path="profile" element={<CharityProfilePage />} />
              <Route path="edit-profile" element={<CharityEditProfile />} />
              <Route path="organization" element={<OrganizationProfile />} />
              <Route path="updates" element={<CharityUpdates />} />
              <Route path="bin" element={<Bin />} />
              <Route path="campaigns" element={<CampaignManagement />} />
              <Route path="campaigns/:id" element={<CampaignDetailPage />} />
              <Route path="donations" element={<DonationManagement />} />
              <Route path="refunds" element={<CharityRefundRequests />} />
              <Route path="fund-tracking" element={<CharityFundTracking />} />
              <Route path="volunteers" element={<CharityVolunteers />} />
              <Route path="documents" element={<CharityDocuments />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="reports/issues" element={<CharityReports />} />
              <Route path="analytics" element={<ReportsAnalytics />} />
              <Route path="notifications" element={<CharityNotifications />} />
              <Route path="settings" element={<CharitySettings />} />
              <Route path="help-center" element={<CharityHelpCenter />} />
            </Route>

            {/* --- 2. SETUP THE NEW ADMIN DASHBOARD LAYOUT AND ROUTES --- */}
            <Route 
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleGate allow={['admin']}>
                    <AdminLayout />
                  </RoleGate>
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="charities" element={<Charities />} />
              <Route path="fund-tracking" element={<FundTracking />} />
              <Route path="reports" element={<Reports />} />
              <Route path="action-logs" element={<ActionLogs />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="test-email" element={<TestEmail />} />
            </Route>
            
            {/* Catch-all 404 */}
            <Route path="*" element={<Error404 />} />
          </Routes>
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;