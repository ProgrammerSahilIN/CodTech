import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { MessageBubble } from './MessageBubble'
import { useMessages } from '../hooks/useMessages'
import { useAuth } from '../hooks/useAuth'
import { Loader2, RefreshCw } from 'lucide-react'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  last_seen: string | null
}

interface MessageListProps {
  selectedUser: Profile
}

export interface MessageListRef {
  handleRefresh: () => void
}

export const MessageList = forwardRef<MessageListRef, MessageListProps>(({ selectedUser }, ref) => {
  const { messages, loading, refreshMessages } = useMessages(selectedUser.id)
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prevMessagesLengthRef = useRef(messages.length)
  const [refreshing, setRefreshing] = useState(false)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > prevMessagesLengthRef.current) {
      // New message added, scroll smoothly
      scrollToBottom('smooth')
    } else if (messages.length !== prevMessagesLengthRef.current) {
      // Messages refreshed or changed, scroll instantly
      scrollToBottom('auto')
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages])

  useEffect(() => {
    // Scroll to bottom immediately when switching users
    scrollToBottom('auto')
  }, [selectedUser.id])

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await refreshMessages()
      // Small delay to show the refresh animation
      setTimeout(() => setRefreshing(false), 500)
    } catch (error) {
      console.error('Error refreshing messages:', error)
      setRefreshing(false)
    }
  }

  // Expose handleRefresh to parent component
  useImperativeHandle(ref, () => ({
    handleRefresh
  }))

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm sm:text-base">Loading messages...</span>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center relative p-4">
        {/* Refresh button for empty state */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50"
          title="Refresh messages"
        >
          <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>

        <div className="text-center max-w-sm mx-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl sm:text-2xl">💬</span>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">Start the conversation with {selectedUser.full_name || selectedUser.username}!</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 relative">
      {/* Refresh button - positioned in upper right corner */}
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 backdrop-blur-sm"
        title="Refresh messages"
      >
        <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
      </button>

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwnMessage={message.user_id === user?.id}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
})

MessageList.displayName = 'MessageList'