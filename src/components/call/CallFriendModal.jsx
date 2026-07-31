/**
 * Call a Friend Modal
 * Shows all live/online users with their usernames (no long IDs).
 * Opens when the user taps the "Call a Friend" button on the dashboard.
 */
import React, { useState, useMemo } from 'react'
import Avatar from '../ui/Avatar'

const CallFriendModal = ({ visible, onlineUsers, onClose, onAudioCall, onVideoCall }) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter online users by search
  const filteredOnlineUsers = useMemo(() => {
    if (!searchQuery.trim()) return onlineUsers
    const q = searchQuery.toLowerCase().trim()
    return onlineUsers.filter((user) => {
      const name = user.displayName?.toLowerCase() || ''
      const city = user.city?.toLowerCase() || ''
      return name.includes(q) || city.includes(q)
    })
  }, [onlineUsers, searchQuery])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full sm:w-[440px] max-h-[85vh] bg-dark-900 border border-dark-700 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-dark-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/15 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Call a Friend</h2>
                <p className="text-xs text-dark-400">
                  {onlineUsers.length} {onlineUsers.length === 1 ? 'friend' : 'friends'} online now
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-800 rounded-xl transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search inside modal */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ minHeight: 0 }}>
          {filteredOnlineUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <p className="text-dark-400 font-medium">
                {searchQuery ? 'No matching friends online' : 'No friends online right now'}
              </p>
              <p className="text-dark-500 text-sm mt-1">
                {searchQuery ? 'Try a different search' : 'Check back later!'}
              </p>
            </div>
          ) : (
            filteredOnlineUsers.map((user) => (
              <div
                key={user.uid}
                className="flex items-center gap-3 p-3 bg-dark-800/50 hover:bg-dark-800 rounded-2xl transition-all group"
              >
                {/* Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={user.photoURL}
                    name={user.displayName}
                    size="md"
                    online={true}
                  />
                </div>

                {/* User Info — USERNAME only, no IDs */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm truncate">
                    {user.displayName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-dark-400">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{user.city || 'Unknown'}</span>
                  </div>
                </div>

                {/* Call Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onAudioCall(user)}
                    className="p-2.5 bg-green-500/10 hover:bg-green-500/25 text-green-500 rounded-xl transition-all active:scale-95"
                    title={`Audio call ${user.displayName}`}
                    aria-label={`Audio call ${user.displayName}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => onVideoCall(user)}
                    className="p-2.5 bg-blue-500/10 hover:bg-blue-500/25 text-blue-500 rounded-xl transition-all active:scale-95"
                    title={`Video call ${user.displayName}`}
                    aria-label={`Video call ${user.displayName}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {filteredOnlineUsers.length > 0 && (
          <div className="px-5 py-3 border-t border-dark-800 flex-shrink-0">
            <p className="text-center text-dark-500 text-xs">
              {filteredOnlineUsers.length} {filteredOnlineUsers.length === 1 ? 'friend' : 'friends'} available to call
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CallFriendModal
