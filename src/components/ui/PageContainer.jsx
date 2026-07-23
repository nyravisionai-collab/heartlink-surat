import React from 'react'

const PageContainer = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBack,
  headerRight,
  className = '',
  contentClassName = '',
  padding = true,
}) => {
  return (
    <div className={`min-h-screen-safe flex flex-col bg-dark-900 ${className}`}>
      {/* Header */}
      {(title || showBackButton || headerRight) && (
        <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-md border-b border-dark-800">
          <div className={`flex items-center ${padding ? 'px-4' : ''} h-16`}>
            {showBackButton && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 text-dark-300 hover:text-white transition-colors"
                aria-label="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            <div className="flex-1">
              {title && (
                <h1 className="text-lg font-semibold text-white">{title}</h1>
              )}
              {subtitle && (
                <p className="text-sm text-dark-400">{subtitle}</p>
              )}
            </div>
            
            {headerRight && (
              <div className="flex items-center gap-2">
                {headerRight}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Content */}
      <main className={`flex-1 ${padding ? 'p-4' : ''} ${contentClassName}`}>
        {children}
      </main>
    </div>
  )
}

export default PageContainer
