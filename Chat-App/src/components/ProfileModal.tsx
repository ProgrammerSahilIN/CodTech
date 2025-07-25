import React, { useState, useRef } from 'react'
import { X, Camera, Save, User, Mail, Calendar, Edit3 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  created_at: string | null
  last_seen: string | null
}

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: Profile
  isOwnProfile: boolean
}

export function ProfileModal({ isOpen, onClose, profile, isOwnProfile }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [username, setUsername] = useState(profile.username)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [loading, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  if (!isOpen) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never'
    const date = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const handleSave = async () => {
    if (!user || !isOwnProfile) return

    setSaving(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          username: username.trim(),
          avatar_url: avatarUrl.trim() || null,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setIsEditing(false)
      // Refresh the page to show updated profile
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFullName(profile.full_name || '')
    setUsername(profile.username)
    setAvatarUrl(profile.avatar_url || '')
    setIsEditing(false)
    setError('')
  }

  const handleAvatarClick = () => {
    if (isOwnProfile && isEditing) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // For demo purposes, we'll just use a placeholder URL
      // In a real app, you'd upload to Supabase Storage
      setAvatarUrl('https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 sm:p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          
          <div className="text-center">
            <div className="relative inline-block">
              <div 
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden ${
                  isOwnProfile && isEditing ? 'cursor-pointer hover:opacity-80' : ''
                }`}
                onClick={handleAvatarClick}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      {getInitials(fullName || profile.full_name || profile.username)}
                    </span>
                  </div>
                )}
              </div>
              
              {isOwnProfile && isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Name and Username */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              {isEditing && isOwnProfile ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-900 font-medium text-sm sm:text-base">
                  {profile.full_name || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              {isEditing && isOwnProfile ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your username"
                />
              ) : (
                <p className="text-gray-900 font-medium text-sm sm:text-base">@{profile.username}</p>
              )}
            </div>

            {isEditing && isOwnProfile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter avatar image URL"
                />
              </div>
            )}
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-1">Joined</p>
              <p className="text-xs sm:text-sm font-medium text-gray-900">
                {formatDate(profile.created_at)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-xs text-gray-600 mb-1">Last Seen</p>
              <p className="text-xs sm:text-sm font-medium text-gray-900">
                {formatLastSeen(profile.last_seen)}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          {isOwnProfile && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}