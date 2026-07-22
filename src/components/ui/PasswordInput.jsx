import React, { useState } from 'react'
import Input from './Input'

const PasswordInput = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  showStrength = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '' }
    
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z\d]/.test(password)) score++
    
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600']
    
    return {
      score: Math.min(score, 4),
      label: labels[Math.min(score, 4)],
      color: colors[Math.min(score, 4)],
    }
  }

  const strength = showStrength ? getPasswordStrength(value) : null

  return (
    <div className={className}>
      <Input
        label={label}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        helperText={!showStrength ? helperText : undefined}
        disabled={disabled}
        required={required}
        rightIcon={
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-dark-400 hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        }
        {...props}
      />
      
      {showStrength && value && (
        <div className="mt-2">
          <div className="flex gap-1 mb-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index <= strength.score ? strength.color : 'bg-dark-700'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-dark-400">
            Password strength: <span className="font-medium">{strength.label}</span>
          </p>
        </div>
      )}
      
      {helperText && !showStrength && (
        <p className="mt-2 text-sm text-dark-400">{helperText}</p>
      )}
    </div>
  )
}

export default PasswordInput
