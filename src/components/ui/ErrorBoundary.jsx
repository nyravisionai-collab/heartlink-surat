/**
 * Phase 06: Global Error Boundary
 */
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Global error caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-dark-950 p-6">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
            <p className="text-dark-400 mb-6">The application encountered an unexpected error. Please refresh and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-semibold transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
