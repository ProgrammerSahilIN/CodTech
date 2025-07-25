import React, { useState, useRef, useEffect } from 'react'
import { Search, User, X, AtSign } from 'lucide-react'
import { useUserSearch } from '../hooks/useUserSearch'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  last_seen: string | null
  created_at: string | null
}

interface UserSearchProps {
  onSelectUser: (user: Profile) => void
  currentUserId?: string
}

export function UserSearch({ onSelectUser, currentUserId }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { searchResults, loading, error, searchUserByUsername, clearSearch } = useUserSearch()

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUserByUsername(searchTerm)
        setIsOpen(true)
      } else {
        clearSearch()
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const handleSelectUser = (user: Profile) => {
    if (user.id !== currentUserId) {
      onSelectUser(user)
      setSearchTerm('')
      setIsOpen(false)
      clearSearch()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelectUser(searchResults[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const clearSearchInput = () => {
    setSearchTerm('')
    setIsOpen(false)
    clearSearch()
    searchRef.current?.focus()
  }

  const filteredResults = searchResults.filter(user => user.id !== currentUserId)

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search users with @username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchTerm.trim() && filteredResults.length > 0) {
              setIsOpen(true)
            }
          }}
          className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
        />
        {searchTerm && (
          <button
            onClick={clearSearchInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {loading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Searching...</p>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-600">
              <p className="text-sm">Error: {error}</p>
            </div>
          )}

          {!loading && !error && filteredResults.length === 0 && searchTerm.trim() && (
            <div className="p-4 text-center text-gray-500">
              <AtSign className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No users found for "{searchTerm}"</p>
              <p className="text-xs text-gray-400 mt-1">
                Try searching with @username format
              </p>
            </div>
          )}

          {!loading && !error && filteredResults.length > 0 && (
            <div className="py-2">
              {filteredResults.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 sm:space-x-3 ${
                    index === selectedIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
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
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name || user.username}
                      </p>
                      <AtSign className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-blue-600 truncate">
                      @{user.username}
                    </p>
                    <p className="text-xs text-gray-400">
                      Last seen {formatLastSeen(user.last_seen)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}