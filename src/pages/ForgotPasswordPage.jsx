import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthActions } from '../hooks/useFirebase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { validateEmail } from '../utils/helpers'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const { forgotPassword, loading, error, clearError } = useAuthActions()
  
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate email
    if (!email) {
      setFormError('Email is required')
      return
    }
    
    if (!validateEmail(email)) {
      setFormError('Please enter a valid email')
      return
    }

    setFormError('')
    if (error) clearError()

    const result = await forgotPassword(email)
    
    if (result.success) {
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen-safe flex flex-col bg-dark-900">
        {/* Header */}
        <div className="p-6 pt-12">
          <button
            onClick={() => navigate('/login')}
            className="p-2 -ml-2 text-dark-300 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-sm mx-auto w-full text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-dark-400 mb-8">
              We've sent a password reset link to <span className="text-white">{email}</span>. 
              Please check your inbox and follow the instructions.
            </p>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>

            <p className="text-dark-400 text-sm mt-6">
              Didn't receive the email?{' '}
              <button
                onClick={handleSubmit}
                className="text-primary-500 hover:text-primary-400 font-semibold"
              >
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen-safe flex flex-col bg-dark-900">
      {/* Header */}
      <div className="p-6 pt-12">
        <button
          onClick={() => navigate('/login')}
          className="p-2 -ml-2 text-dark-300 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm mx-auto w-full">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-dark-400 mb-8">
            No worries! Enter your email address and we'll send you a password reset link.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (formError) setFormError('')
                if (error) clearError()
              }}
              error={formError}
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Send Reset Link
            </Button>
          </form>

          {/* Back to Login */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 text-dark-400 hover:text-white mt-6 mx-auto transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
