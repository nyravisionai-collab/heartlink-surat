import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { subscribeToUsers, searchUsers as searchUsersUtil } from '../firebase/users'

export const useUserDiscovery = () => {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Subscribe to users
  useEffect(() => {
    if (!currentUser) {
      setUsers([])
      setFilteredUsers([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToUsers(currentUser.uid, (usersList) => {
      setUsers(usersList)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const filtered = searchUsersUtil(users, searchQuery)
      setFilteredUsers(filtered)
    }
  }, [users, searchQuery])

  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  return {
    users,
    filteredUsers,
    searchQuery,
    loading,
    handleSearch,
    clearSearch,
  }
}

export default useUserDiscovery
