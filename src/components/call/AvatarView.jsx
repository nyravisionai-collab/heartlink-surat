/**
 * Phase 04: Avatar View
 */
import React from 'react'
import Avatar from '../ui/Avatar'

const AvatarView = ({ user, size = 'lg', online = false, className = '' }) => {
  return (
    <Avatar
      src={user?.photoURL}
      name={user?.displayName || 'Unknown'}
      size={size}
      online={online}
      className={className}
    />
  )
}

export default AvatarView
