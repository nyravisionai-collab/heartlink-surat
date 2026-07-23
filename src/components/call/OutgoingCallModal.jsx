/**
 * Phase 04: Outgoing Call Modal
 */
import React from 'react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import Card from '../ui/Card'

const OutgoingCallModal = ({ visible, caller, callType, statusText, onCancel }) => {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
      <Card className="w-[92%] max-w-md p-8 text-center">
        <div className="mb-6 relative inline-block">
          <Avatar
            src={caller?.photoURL}
            name={caller?.displayName || 'Unknown'}
            size="xl"
            online={false}
            className="mx-auto w-24 h-24 text-3xl"
          />
          <span className="absolute bottom-2 right-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-dark-800 animate-pulse-slow"></span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{caller?.displayName || 'Unknown'}</h2>
        <p className="text-dark-400 mb-2">{caller?.city || 'Unknown location'}</p>
        <p className="text-sm text-primary-400 font-medium mb-6 capitalize">
          {statusText || `Calling... (${callType || 'audio'})`}
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            variant="danger"
            size="lg"
            className="w-16 h-16 rounded-full p-0 flex items-center justify-center"
            onClick={onCancel}
            aria-label="Cancel call"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default OutgoingCallModal
