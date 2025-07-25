import React, { useState, useEffect, useRef } from 'react'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { UserList } from './UserList'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Menu, X } from 'lucide-react'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  last_seen: string | null
  created_at: string | null
}

export function ChatRoom() {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messageListRef = useRef<{ handleRefresh: () => void } | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCurrentUserProfile()
    } else {
      setCurrentUserProfile(null)
      setProfileLoading(false)
    }
  }, [user])

  const fetchCurrentUserProfile = async () => {
    if (!user) {
      setProfileLoading(false)
      return
    }

    try {
      setProfileLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching current user profile:', error)
        // Create profile if it doesn't exist
        if (error.code === 'PGRST116' || !data) {
          const username = user.user_metadata?.username || 
                          user.email?.split('@')[0] || 
                          `user_${user.id.slice(0, 8)}`
          
          const fullName = user.user_metadata?.full_name || 
                          user.user_metadata?.username || 
                          user.email?.split('@')[0] || 
                          'User'

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: username,
              full_name: fullName,
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
            // Create a minimal profile object to prevent blocking
            setCurrentUserProfile({
              id: user.id,
              username: user.email?.split('@')[0] || 'user',
              full_name: user.email?.split('@')[0] || 'User',
              avatar_url: null,
              created_at: new Date().toISOString(),
              last_seen: null
            })
          } else {
            setCurrentUserProfile(newProfile)
          }
        }
      } else if (data) {
        setCurrentUserProfile(data)
      } else {
        // No profile found, create a minimal one
        setCurrentUserProfile({
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          full_name: user.email?.split('@')[0] || 'User',
          avatar_url: null,
          created_at: new Date().toISOString(),
          last_seen: null
        })
      }
    } catch (error) {
      console.error('Error fetching current user profile:', error)
      // Create a minimal profile to prevent blocking
      setCurrentUserProfile({
        id: user.id,
        username: user.email?.split('@')[0] || 'user',
        full_name: user.email?.split('@')[0] || 'User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        last_seen: null
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleSelectUser = (user: Profile) => {
    setSelectedUser(user)
    // Only close sidebar on mobile after selecting a user if we're in mobile view
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const handleMessageSent = () => {
    // Trigger refresh in MessageList component
    if (messageListRef.current) {
      messageListRef.current.handleRefresh()
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleBackToUserList = () => {
    // On mobile, when clicking back from a conversation, show the sidebar and clear selected user
    setSelectedUser(null)
    if (window.innerWidth < 1024) {
      setSidebarOpen(true)
    }
  }

  // Don't show loading screen for profile loading - show the interface immediately
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-80 sm:w-96 lg:w-80 xl:w-96
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <UserList 
          onSelectUser={handleSelectUser} 
          selectedUserId={selectedUser?.id}
        />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader 
          selectedUser={selectedUser} 
          currentUserProfile={currentUserProfile}
          onToggleSidebar={selectedUser ? handleBackToUserList : toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        {selectedUser ? (
          <div className="flex-1 flex flex-col min-h-0">
            <MessageList 
              ref={messageListRef}
              selectedUser={selectedUser} 
            />
            <MessageInput 
              selectedUser={selectedUser}
              onMessageSent={handleMessageSent}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl sm:text-3xl">💬</span>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Welcome to ChatFlow</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {window.innerWidth < 1024 ? 
                  'Tap the menu button to select a user and start chatting' : 
                  'Select a user from the sidebar to start a conversation'
                }
              </p>
              {profileLoading && (
                <p className="text-xs sm:text-sm text-gray-500">Setting up your profile...</p>
              )}
              
              {/* Mobile: Show menu button */}
              <div className="lg:hidden mt-6">
                <button
                  onClick={toggleSidebar}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <Menu className="w-4 h-4" />
                  <span>Browse Users</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}