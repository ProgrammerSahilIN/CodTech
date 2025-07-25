import React, { useState, useEffect } from 'react'
import { User, MessageCircle, MoreVertical } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ProfileModal } from './ProfileModal'
import { UserSearch } from './UserSearch'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  last_seen: string | null
  created_at: string | null
}

interface UserListProps {
  onSelectUser: (user: Profile) => void
  selectedUserId?: string
}

export function UserList({ onSelectUser, selectedUserId }: UserListProps) {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileToShow, setProfileToShow] = useState<Profile | null>(null)
  const { user: currentUser, loading: authLoading } = useAuth()

  useEffect(() => {
    // Only fetch users when auth is complete and we have a current user
    if (!authLoading && currentUser) {
      fetchUsers()
      
      // Set up real-time subscription for user status updates
      const channel = supabase
        .channel('user-status-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
          },
          (payload) => {
            const updatedProfile = payload.new as Profile
            setUsers(prev => 
              prev.map(user => 
                user.id === updatedProfile.id ? updatedProfile : user
              )
            )
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else if (!authLoading && !currentUser) {
      // If auth is complete but no user, clear users and stop loading
      setUsers([])
      setLoading(false)
    }
  }, [currentUser, authLoading])

  const fetchUsers = async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.id)
        .order('last_seen', { ascending: false, nullsLast: true })
        .limit(20) // Limit to prevent long loading times

      if (error) {
        console.error('Error fetching users:', error)
        setUsers([])
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never'
    const date = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Online'
    if (diffInMinutes < 5) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getOnlineStatus = (lastSeen: string | null) => {
    if (!lastSeen) return 'offline'
    const date = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 5) return 'online'
    if (diffInMinutes < 30) return 'away'
    return 'offline'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      default: return 'bg-gray-300'
    }
  }

  const handleUserProfileClick = (e: React.MouseEvent, user: Profile) => {
    e.stopPropagation()
    setProfileToShow(user)
    setShowProfileModal(true)
  }

  const handleSearchUserSelect = (user: Profile) => {
    onSelectUser(user)
    // Add the user to the recent users list if not already there
    if (!users.some(u => u.id === user.id)) {
      setUsers(prev => [user, ...prev])
    }
  }

  if (authLoading) {
    return (
      <div className="w-full h-full bg-white/90 backdrop-blur-lg border-r border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="w-full h-full bg-white/90 backdrop-blur-lg border-r border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500 p-4">
          <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Please sign in to view users</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-full h-full bg-white/90 backdrop-blur-lg border-r border-gray-200 flex flex-col">
        <div className="p-3 sm:p-4 border-b border-gray-200 space-y-3 sm:space-y-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          
          {/* User Search Component */}
          <UserSearch 
            onSelectUser={handleSearchUserSelect}
            currentUserId={currentUser.id}
          />
          
          <div className="text-xs text-gray-500 text-center">
            Search for users with @username to start a conversation
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium mb-1">No recent conversations</p>
              <p className="text-xs">Use the search above to find users by @username</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Recent Conversations
                </p>
              </div>
              {users.map((user) => {
                const status = getOnlineStatus(user.last_seen)
                return (
                  <div
                    key={user.id}
                    className={`group relative w-full p-2 sm:p-3 rounded-lg text-left transition-all duration-200 hover:bg-gray-50 ${
                      selectedUserId === user.id ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <button
                      onClick={() => onSelectUser(user)}
                      className="w-full flex items-center space-x-2 sm:space-x-3"
                    >
                      <div className="relative flex-shrink-0">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-xs sm:text-sm font-medium text-white">
                              {getInitials(user.full_name || user.username)}
                            </span>
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 ${getStatusColor(status)} rounded-full border-2 border-white`}></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.full_name || user.username}
                          </p>
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          @{user.username}
                        </p>
                        <p className={`text-xs ${status === 'online' ? 'text-green-600' : 'text-gray-400'}`}>
                          {formatLastSeen(user.last_seen)}
                        </p>
                      </div>
                    </button>

                    {/* Profile Button */}
                    <button
                      onClick={(e) => handleUserProfileClick(e, user)}
                      className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200"
                    >
                      <MoreVertical className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && profileToShow && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profile={profileToShow}
          isOwnProfile={false}
        />
      )}
    </>
  )
}