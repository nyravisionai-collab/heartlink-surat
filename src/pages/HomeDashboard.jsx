import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useUserDiscovery } from '../hooks/useUserDiscovery'
import { setupPresence, subscribeToAllStatuses } from '../firebase/presence'
import { useCall } from '../contexts/CallContext'
import { updateLastActive } from '../firebase/users'

const HomeDashboard = () => {
  const callContext = useCall()
  const navigate = useNavigate()
  const { currentUser, userProfile, logout } = useAuth()
  const { filteredUsers, searchQuery, loading, handleSearch, clearSearch } = useUserDiscovery()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [allStatuses, setAllStatuses] = useState({})

  // Setup presence and update last active
  useEffect(() => {
    if (!currentUser) return

    // Setup presence system with display name
    const cleanup = setupPresence(currentUser.uid, userProfile?.displayName)

    // Update last active timestamp
    updateLastActive(currentUser.uid)

    return () => {
      cleanup()
    }
  }, [currentUser, userProfile?.displayName])

  // Subscribe to ALL user statuses in one listener (real-time for everyone)
  useEffect(() => {
    const unsubscribe = subscribeToAllStatuses((statuses) => {
      setAllStatuses(statuses || {})
    })
    return () => unsubscribe()
  }, [])

  // Split users into online and offline
  const onlineUsers = useMemo(() => {
    return filteredUsers.filter((user) => {
      const status = allStatuses[user.uid]
      return status?.isOnline === true
    })
  }, [filteredUsers, allStatuses])

  const offlineUsers = useMemo(() => {
    return filteredUsers.filter((user) => {
      const status = allStatuses[user.uid]
      return !status?.isOnline
    })
  }, [filteredUsers, allStatuses])

  const handleLogout = async () => {
    await logout()
    navigate('/welcome', { replace: true })
  }

  const handleAudioCall = (user) => {
    navigate('/call/voice', { state: { caller: user }, replace: false })
  }

  const handleVideoCall = (user) => {
    navigate('/call/video', { state: { caller: user }, replace: false })
  }

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  // User card component (used in both online and offline sections)
  const renderUserCard = (user) => {
    const isOnline = allStatuses[user.uid]?.isOnline || false
    
    return (
      <Card key={user.uid} className="p-4 hover:bg-dark-700/50 transition-all">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Avatar
            src={user.photoURL}
            name={user.displayName}
            size="lg"
            online={isOnline}
          />
          
          {/* User Info - shows NAME only, no IDs */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold truncate">
              {user.displayName}
            </h4>
            <div className="flex items-center gap-2 text-sm text-dark-400">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{user.city || 'Unknown'}</span>
            </div>
            
            {/* Online Status */}
            <p className="text-xs mt-1">
              {isOnline ? (
                <span className="text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse"></span>
                  Online
                </span>
              ) : (
                <span className="text-dark-500">
                  {allStatuses[user.uid]?.lastSeen
                    ? `Last seen ${formatLastSeen(allStatuses[user.uid].lastSeen)}`
                    : 'Offline'}
                </span>
              )}
            </p>
          </div>
          
          {/* Call Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleAudioCall(user)}
              className="p-3 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl transition-colors"
              title={`Audio call ${user.displayName}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            
            <button
              onClick={() => handleVideoCall(user)}
              className="p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-colors"
              title={`Video call ${user.displayName}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="min-h-screen-safe flex flex-col bg-dark-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-md border-b border-dark-800">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 2.35 3.79 1.7 4.34 1.3 5.13 1.16 6.07c-.17 1.16-.05 2.32.46 3.37.88 1.93 2.56 3.56 4.54 4.51 2.02 1.01 4.28 1.24 6.37.63 1.87-.56 3.54-1.69 4.78-3.21 1.15-1.43 1.89-3.13 2.11-4.95.19-1.67-.03-3.35-.64-4.93C20.46 3.24 20.01 3 19.47 3h-2.83c-.54 0-.99.45-.99.99 0 1.23.19 2.42.56 3.53.11.35.03.74-.24 1.02l-1.95 1.66c1.41 2.93 4.06 5.48 6.89 6.83l1.57-1.97c.27-.27.66-.35 1.01-.24 1.11.37 2.3.56 3.53.56.54 0 .99.45.99.99v2.84c0 .54-.45.99-.99.99z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Heart Link</h1>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 hover:bg-dark-800 rounded-xl transition-colors"
            >
              <Avatar
                src={userProfile?.photoURL}
                name={userProfile?.displayName}
                size="sm"
                online={true}
              />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 rounded-2xl shadow-2xl border border-dark-700 py-2 animate-scale-in">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    navigate('/settings')
                  }}
                  className="w-full px-4 py-3 text-left text-dark-300 hover:bg-dark-700 hover:text-white transition-colors flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                
                <div className="border-t border-dark-700 my-2"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-red-500 hover:bg-dark-700 transition-colors flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">
            Hello, {userProfile?.displayName || 'User'}!
          </h2>
          <p className="text-dark-400">Ready to connect?</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users by name or city..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-2xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-dark-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-dark-700 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-dark-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-dark-400">
                {searchQuery ? 'No users found' : 'No users yet'}
              </p>
              <p className="text-dark-500 text-sm mt-1">
                {searchQuery ? 'Try a different search term' : 'Invite friends to join Heart Link Surat'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Online Users Section - ALL visible at once */}
            {onlineUsers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  Online — {onlineUsers.length}
                </h3>
                <div className="space-y-3">
                  {onlineUsers.map(renderUserCard)}
                </div>
              </div>
            )}

            {/* Offline Users Section */}
            {offlineUsers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-dark-400 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-dark-500 rounded-full"></span>
                  Offline — {offlineUsers.length}
                </h3>
                <div className="space-y-3">
                  {offlineUsers.map(renderUserCard)}
                </div>
              </div>
            )}

            {/* Total count */}
            <p className="text-center text-dark-500 text-sm pb-4">
              {filteredUsers.length} total users
            </p>
          </div>
        )}
      </main>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}

export default HomeDashboard
