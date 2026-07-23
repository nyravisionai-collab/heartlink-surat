import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

const WelcomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen-safe flex flex-col bg-dark-900">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        {/* Logo */}
        <div className="mb-8 animate-bounce-slow">
          <div className="w-28 h-28 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-900/50">
            <svg
              className="w-16 h-16 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 2.35 3.79 1.7 4.34 1.3 5.13 1.16 6.07c-.17 1.16-.05 2.32.46 3.37.88 1.93 2.56 3.56 4.54 4.51 2.02 1.01 4.28 1.24 6.37.63 1.87-.56 3.54-1.69 4.78-3.21 1.15-1.43 1.89-3.13 2.11-4.95.19-1.67-.03-3.35-.64-4.93C20.46 3.24 20.01 3 19.47 3h-2.83c-.54 0-.99.45-.99.99 0 1.23.19 2.42.56 3.53.11.35.03.74-.24 1.02l-1.95 1.66c1.41 2.93 4.06 5.48 6.89 6.83l1.57-1.97c.27-.27.66-.35 1.01-.24 1.11.37 2.3.56 3.53.56.54 0 .99.45.99.99v2.84c0 .54-.45.99-.99.99z" />
            </svg>
          </div>
        </div>

        {/* App Name & Tagline */}
        <h1 className="text-4xl font-bold text-gradient mb-4">Heart Link Surat</h1>
        <p className="text-dark-300 text-lg mb-2">Secure one-to-one</p>
        <p className="text-dark-300 text-lg mb-12">audio & video calling</p>

        {/* Features */}
        <div className="space-y-4 mb-12 w-full max-w-xs">
          <div className="flex items-center gap-3 text-dark-300">
            <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-sm">End-to-end secure calls</span>
          </div>

          <div className="flex items-center gap-3 text-dark-300">
            <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm">HD video & clear audio</span>
          </div>

          <div className="flex items-center gap-3 text-dark-300">
            <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm">Fast & reliable connection</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/login')}
        >
          Login
        </Button>
        
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => navigate('/register')}
        >
          Create Account
        </Button>
      </div>
    </div>
  )
}

export default WelcomePage
