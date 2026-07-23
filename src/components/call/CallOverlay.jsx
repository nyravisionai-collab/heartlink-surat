/**
 * Phase 04: Call Overlay
 */
import React from 'react'
import Card from '../ui/Card'

const CallOverlay = ({ visible, children }) => {
  if (!visible) return null
  return (
    <div className="fixed top-4 left-4 z-[90] animate-slide-down">
      <Card className="p-3 min-w-[240px] max-w-[320px]">
        {children}
      </Card>
    </div>
  )
}

export default CallOverlay
