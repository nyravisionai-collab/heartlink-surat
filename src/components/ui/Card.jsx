import React from 'react'

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hoverable = false,
  ...props
}) => {
  const baseClasses = 'rounded-3xl transition-all duration-200'
  
  const variantClasses = {
    default: 'bg-dark-800/50 backdrop-blur-xs border border-dark-700/50 shadow-2xl shadow-black/20',
    glass: 'bg-dark-800/30 backdrop-blur-md border border-dark-700/30',
    solid: 'bg-dark-800 border border-dark-700',
    outline: 'bg-transparent border-2 border-dark-600',
  }
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
    xl: 'p-10',
  }
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hoverable ? 'cursor-pointer hover:bg-dark-700/50 hover:border-dark-600/50 hover:shadow-xl' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

// Card subcomponents
Card.Header = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
)

Card.Body = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)

Card.Footer = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-dark-700 ${className}`}>{children}</div>
)

export default Card
