import React from 'react'

const EmptyState = ({
  icon,
  title = 'No data found',
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-dark-500">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      
      {description && (
        <p className="text-dark-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
