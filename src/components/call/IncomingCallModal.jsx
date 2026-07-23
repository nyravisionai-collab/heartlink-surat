/**
 * Phase 04: Incoming Call Modal
 */
import React from 'react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import Card from '../ui/Card'

const IncomingCallModal = ({ visible, caller, callType, onAccept, onReject }) => {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
      <Card className="w-[92%] max-w-md p-8 text-center">
        <div className="mb-6">
          <Avatar
            src={caller?.photoURL}
            name={caller?.displayName || 'Unknown'}
            size="xl"
            online={false}
            className="mx-auto w-24 h-24 text-3xl"
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{caller?.displayName || 'Unknown'}</h2>
        <p className="text-dark-400 mb-2">{caller?.city || 'Unknown location'}</p>
        <p className="text-sm text-primary-400 font-medium mb-6 capitalize">
          Incoming {callType || 'audio'} call
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            variant="danger"
            size="lg"
            className="w-16 h-16 rounded-full p-0 flex items-center justify-center"
            onClick={onReject}
            aria-label="Reject call"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="w-16 h-16 rounded-full p-0 flex items-center justify-center"
            onClick={onAccept}
            aria-label="Accept call"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default IncomingCallModal
