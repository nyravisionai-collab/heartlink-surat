import React from 'react'

const Avatar = ({
  src,
  alt = 'User',
  name,
  size = 'md',
  online = null,
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
    '2xl': 'w-32 h-32 text-4xl',
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const onlineIndicatorSize = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
    '2xl': 'w-6 h-6',
  }

  return (
    <div className={`relative inline-block ${className}`} onClick={onClick}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-dark-600`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold border-2 border-dark-600`}
        >
          {getInitials(name)}
        </div>
      )}
      
      {online !== null && (
        <div
          className={`absolute bottom-0 right-0 ${onlineIndicatorSize[size]} rounded-full border-2 border-dark-900 ${
            online ? 'bg-green-500' : 'bg-dark-500'
          }`}
        />
      )}
    </div>
  )
}

export default Avatar
