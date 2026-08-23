import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AppLayout from '@/components/AppLayout';
import DashboardPage from '@/pages/app/DashboardPage';
import DiscoverPage from '@/pages/app/DiscoverPage';
import CampaignsPage from '@/pages/app/CampaignsPage';
import CampaignDetailPage from '@/pages/app/CampaignDetailPage';
import CreateCampaignPage from '@/pages/app/CreateCampaignPage';
import ApplicationsPage from '@/pages/app/ApplicationsPage';
import VolunteersPage from '@/pages/app/VolunteersPage';
import CommunityNeedsPage from '@/pages/app/CommunityNeedsPage';
import EmergencyPage from '@/pages/app/EmergencyPage';
import CommunityPage from '@/pages/app/CommunityPage';
import MessagesPage from '@/pages/app/MessagesPage';
import ImpactPage from '@/pages/app/ImpactPage';
import CertificatesPage from '@/pages/app/CertificatesPage';
import AssistantPage from '@/pages/app/AssistantPage';
import ProfilePage from '@/pages/app/ProfilePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="campaigns/create" element={<CreateCampaignPage />} />
        <Route path="campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="volunteers" element={<VolunteersPage />} />
        <Route path="needs" element={<CommunityNeedsPage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="impact" element={<ImpactPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
