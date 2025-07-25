import React, { useState } from 'react'
import { LogOut, User, Settings, Menu, X, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { ProfileModal } from './ProfileModal'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  last_seen: string | null
  created_at: string | null
}

interface ChatHeaderProps {
  selectedUser?: Profile
  currentUserProfile?: Profile
  onToggleSidebar?: () => void
  sidebarOpen?: boolean
}

export function ChatHeader({ selectedUser, currentUserProfile, onToggleSidebar, sidebarOpen }: ChatHeaderProps) {
  const { signOut } = useAuth()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileToShow, setProfileToShow] = useState<Profile | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
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

  const handleProfileClick = (profile: Profile, isOwn: boolean) => {
    setProfileToShow(profile)
    setIsOwnProfile(isOwn)
    setShowProfileModal(true)
  }

  const handleMyProfileClick = () => {
    if (currentUserProfile) {
      handleProfileClick(currentUserProfile, true)
    }
  }

  const handleSelectedUserProfileClick = () => {
    if (selectedUser) {
      handleProfileClick(selectedUser, false)
    }
  }

  return (
    <>
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {/* Mobile Menu/Back Button */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {selectedUser ? (
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {selectedUser ? (
              <button
                onClick={handleSelectedUserProfileClick}
                className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 rounded-lg p-1 sm:p-2 -m-1 sm:-m-2 transition-colors duration-200 min-w-0 flex-1"
              >
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.username}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-medium text-white">
                      {getInitials(selectedUser.full_name || selectedUser.username)}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1 text-left">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {selectedUser.full_name || selectedUser.username}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">@{selectedUser.username}</p>
                </div>
              </button>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">ChatFlow</h1>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Real-time messaging</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* My Profile Button */}
            <button
              onClick={handleMyProfileClick}
              className="inline-flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Settings className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Profile</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && profileToShow && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profile={profileToShow}
          isOwnProfile={isOwnProfile}
        />
      )}
    </>
  )
}