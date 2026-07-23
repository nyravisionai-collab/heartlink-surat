import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CallProvider } from './contexts/CallContext'
import LoadingScreen from './components/ui/LoadingScreen'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Lazy load pages for code splitting
const SplashScreen = lazy(() => import('./pages/SplashScreen'))
const WelcomePage = lazy(() => import('./pages/WelcomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ProfileSetupPage = lazy(() => import('./pages/ProfileSetupPage'))
const HomeDashboard = lazy(() => import('./pages/HomeDashboard'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const VoiceCall = lazy(() => import('./pages/VoiceCall'))
const VideoCall = lazy(() => import('./pages/VideoCall'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Protected Route Component
const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { isAuthenticated, isProfileComplete, loading, profileLoading } = useAuth()

  if (loading || profileLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />
  }

  if (requireProfile && !isProfileComplete) {
    return <Navigate to="/profile-setup" replace />
  }

  return children
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isProfileComplete, loading, profileLoading } = useAuth()

  if (loading || profileLoading) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    if (!isProfileComplete) {
      return <Navigate to="/profile-setup" replace />
    }
    return <Navigate to="/home" replace />
  }

  return children
}

// App Routes Component (must be inside AuthProvider)
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <SplashScreen />
            </PublicRoute>
          }
        />
        <Route
          path="/welcome"
          element={
            <PublicRoute>
              <WelcomePage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute requireProfile={false}>
              <ProfileSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/call/voice"
          element={
            <ProtectedRoute>
              <VoiceCall />
            </ProtectedRoute>
          }
        />
        <Route
          path="/call/video"
          element={
            <ProtectedRoute>
              <VideoCall />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CallProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </CallProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
