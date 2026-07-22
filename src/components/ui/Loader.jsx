import React from 'react'

const Loader = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const colorClasses = {
    primary: 'border-primary-500',
    white: 'border-white',
    dark: 'border-dark-500',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          border-2 ${colorClasses[color]} 
          border-t-transparent 
          rounded-full 
          animate-rotate
        `}
      />
    </div>
  )
}

// Full page loader
export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="min-h-screen-safe flex flex-col items-center justify-center bg-dark-900 p-4">
    <Loader size="lg" />
    {text && <p className="mt-4 text-dark-400">{text}</p>}
  </div>
)

// Inline loader
export const InlineLoader = ({ text }) => (
  <div className="flex items-center gap-2">
    <Loader size="sm" />
    {text && <span className="text-dark-400 text-sm">{text}</span>}
  </div>
)

export default Loader
