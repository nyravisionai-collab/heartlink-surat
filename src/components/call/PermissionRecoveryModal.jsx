/**
 * Phase 05: Permission Recovery Modal
 */
import React from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'

const PermissionRecoveryModal = ({ visible, missingPermissions, onRetry, onContinueWithout }) => {
  if (!visible) return null

  const hasAudio = missingPermissions?.audio === false || missingPermissions?.audio === true ? false : true
  const hasVideo = missingPermissions?.video === false || missingPermissions?.video === true ? false : true

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
      <Card className="w-[92%] max-w-md p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Permission Needed</h3>
        <p className="text-dark-400 mb-4 text-sm">
          To make this call, please allow access to:
        </p>
        <ul className="text-sm text-left mb-4 space-y-1">
          {!hasAudio && <li className="text-red-400">Microphone access</li>}
          {!hasVideo && <li className="text-red-400">Camera access</li>}
        </ul>
        <div className="flex gap-3">
          <Button variant="primary" size="md" onClick={onRetry}>
            Retry
          </Button>
          {onContinueWithout && (
            <Button variant="ghost" size="md" onClick={onContinueWithout}>
              Continue Without
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

export default PermissionRecoveryModal
