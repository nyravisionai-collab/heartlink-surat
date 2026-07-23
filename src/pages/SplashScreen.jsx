import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const SplashScreen = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isProfileComplete, loading } = useAuth()

  useEffect(() => {
    // Wait for auth to initialize
    if (loading) return

    // Auto-redirect after Splash animation
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        if (isProfileComplete) {
          navigate('/home', { replace: true })
        } else {
          navigate('/profile-setup', { replace: true })
        }
      } else {
        navigate('/welcome', { replace: true })
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [isAuthenticated, isProfileComplete, loading, navigate])

  return (
    <div className="min-h-screen-safe flex flex-col items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-4">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-700/20 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Logo */}
      <div className="relative z-10 animate-bounce-slow">
        <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-900/50 mb-8">
          <svg
            className="w-20 h-20 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 2.35 3.79 1.7 4.34 1.3 5.13 1.16 6.07c-.17 1.16-.05 2.32.46 3.37.88 1.93 2.56 3.56 4.54 4.51 2.02 1.01 4.28 1.24 6.37.63 1.87-.56 3.54-1.69 4.78-3.21 1.15-1.43 1.89-3.13 2.11-4.95.19-1.67-.03-3.35-.64-4.93C20.46 3.24 20.01 3 19.47 3h-2.83c-.54 0-.99.45-.99.99 0 1.23.19 2.42.56 3.53.11.35.03.74-.24 1.02l-1.95 1.66c1.41 2.93 4.06 5.48 6.89 6.83l1.57-1.97c.27-.27.66-.35 1.01-.24 1.11.37 2.3.56 3.53.56.54 0 .99.45.99.99v2.84c0 .54-.45.99-.99.99z" />
          </svg>
        </div>
      </div>

      {/* App Name */}
      <h1 className="relative z-10 text-4xl font-bold text-gradient mb-2 animate-fade-in">
        Heart Link Surat
      </h1>
      
      {/* Tagline */}
      <p className="relative z-10 text-dark-300 text-lg animate-fade-in">
        Secure Audio & Video Calls
      </p>

      {/* Loading indicator */}
      <div className="relative z-10 mt-12">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
