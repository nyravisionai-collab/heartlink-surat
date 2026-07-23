/**
 * Phase 05: Call Quality Indicator
 */
import React from 'react'

const qualityConfig = {
  excellent: { label: 'Excellent', color: 'text-green-400', bars: 4 },
  good: { label: 'Good', color: 'text-green-400', bars: 3 },
  fair: { label: 'Fair', color: 'text-yellow-400', bars: 2 },
  poor: { label: 'Poor', color: 'text-red-400', bars: 1 },
  disconnected: { label: 'Disconnected', color: 'text-red-500', bars: 0 },
}

const CallQualityIndicator = ({ quality = 'good', className = '' }) => {
  const info = qualityConfig[quality] || qualityConfig.good
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label={`Network quality: ${info.label}`}>
      <div className="flex items-end gap-0.5 h-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              i <= info.bars ? info.color + ' bg-current' : 'bg-dark-600'
            }`}
            style={{ height: `${i * 6}px` }}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${info.color}`}>{info.label}</span>
    </div>
  )
}

export default CallQualityIndicator
