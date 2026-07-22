import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen-safe flex items-center justify-center bg-dark-900 p-4">
      <div className="text-center max-w-sm mx-auto">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-gradient mb-4">404</div>
          <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-dark-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/home')}
          >
            Go to Home
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
