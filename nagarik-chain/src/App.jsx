import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { MotionConfig, LazyMotion, domAnimation } from 'framer-motion';
import { AuthProvider } from '@contexts/AuthContext';
import { ThemeProvider } from '@contexts/ThemeContext';
import { NotificationProvider } from '@contexts/NotificationContext';
import ProtectedRoute from '@components/layout/ProtectedRoute';
import CitizenLayout from '@components/layout/CitizenLayout';
import AdminLayout from '@components/layout/AdminLayout';
import LoadingSpinner from '@components/ui/LoadingSpinner';

// Lazy load all pages
const HomePage = lazy(() => import('@pages/public/HomePage'));
const CitizenLogin = lazy(() => import('@pages/public/CitizenLogin'));
const CitizenRegister = lazy(() => import('@pages/public/CitizenRegister'));
const AdminLogin = lazy(() => import('@pages/public/AdminLogin'));
const NotFoundPage = lazy(() => import('@pages/public/NotFoundPage'));

// Citizen pages
const IdentityPage = lazy(() => import('@pages/citizen/IdentityPage'));
const DocumentsPage = lazy(() => import('@pages/citizen/DocumentsPage'));
const BenefitsPage = lazy(() => import('@pages/citizen/BenefitsPage'));
const ContractsPage = lazy(() => import('@pages/citizen/ContractsPage'));
const AIStatusPage = lazy(() => import('@pages/citizen/AIStatusPage'));

// Admin pages
const AdminOverview = lazy(() => import('@pages/admin/AdminOverview'));
const CitizenRegistry = lazy(() => import('@pages/admin/CitizenRegistry'));
const DocumentQueue = lazy(() => import('@pages/admin/DocumentQueue'));
const AdminContractsPage = lazy(() => import('@pages/admin/AdminContractsPage'));
const AIEnginePage = lazy(() => import('@pages/admin/AIEnginePage'));
const AuditLogPage = lazy(() => import('@pages/admin/AuditLogPage'));

// Verification pages
const VerifyLanding = lazy(() => import('@pages/verify/VerifyLanding'));
const VerifyResult = lazy(() => import('@pages/verify/VerifyResult'));

function SuspenseFallback() {
  return <LoadingSpinner fullPage />;
}

const router = createBrowserRouter([
  // Public
  { path: '/', element: <Suspense fallback={<SuspenseFallback />}><HomePage /></Suspense> },
  { path: '/citizen/login', element: <Suspense fallback={<SuspenseFallback />}><CitizenLogin /></Suspense> },
  { path: '/citizen/register', element: <Suspense fallback={<SuspenseFallback />}><CitizenRegister /></Suspense> },
  { path: '/admin/login', element: <Suspense fallback={<SuspenseFallback />}><AdminLogin /></Suspense> },

  // Citizen Dashboard
  {
    path: '/citizen/dashboard',
    element: (
      <ProtectedRoute role="citizen">
        <CitizenLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/citizen/dashboard/identity" replace /> },
      { path: 'identity', element: <Suspense fallback={<SuspenseFallback />}><IdentityPage /></Suspense> },
      { path: 'documents', element: <Suspense fallback={<SuspenseFallback />}><DocumentsPage /></Suspense> },
      { path: 'benefits', element: <Suspense fallback={<SuspenseFallback />}><BenefitsPage /></Suspense> },
      { path: 'contracts', element: <Suspense fallback={<SuspenseFallback />}><ContractsPage /></Suspense> },
      { path: 'ai-status', element: <Suspense fallback={<SuspenseFallback />}><AIStatusPage /></Suspense> },
    ],
  },

  // Admin Dashboard
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard/overview" replace /> },
      { path: 'overview', element: <Suspense fallback={<SuspenseFallback />}><AdminOverview /></Suspense> },
      { path: 'citizens', element: <Suspense fallback={<SuspenseFallback />}><CitizenRegistry /></Suspense> },
      { path: 'documents', element: <Suspense fallback={<SuspenseFallback />}><DocumentQueue /></Suspense> },
      { path: 'contracts', element: <Suspense fallback={<SuspenseFallback />}><AdminContractsPage /></Suspense> },
      { path: 'ai-engine', element: <Suspense fallback={<SuspenseFallback />}><AIEnginePage /></Suspense> },
      { path: 'audit-log', element: <Suspense fallback={<SuspenseFallback />}><AuditLogPage /></Suspense> },
    ],
  },

  // Verification
  { path: '/verify', element: <Suspense fallback={<SuspenseFallback />}><VerifyLanding /></Suspense> },
  { path: '/verify/:citizenId', element: <Suspense fallback={<SuspenseFallback />}><VerifyResult /></Suspense> },

  // 404
  { path: '*', element: <Suspense fallback={<SuspenseFallback />}><NotFoundPage /></Suspense> },
]);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <MotionConfig reducedMotion="user">
            <LazyMotion features={domAnimation}>
              <RouterProvider router={router} />
            </LazyMotion>
          </MotionConfig>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
