import React from 'react'
import { Check, CheckCheck, Clock, Send } from 'lucide-react'

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    user_id: string
    recipient_id: string | null
    conversation_id: string | null
    created_at: string
    sent_at: string | null
    delivered_at: string | null
    seen_at: string | null
    status: 'sending' | 'sent' | 'delivered' | 'seen'
    user_profile: {
      username: string
      full_name: string | null
      avatar_url: string | null
    }
  }
  isOwnMessage: boolean
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusIcon = () => {
    if (!isOwnMessage) return null

    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400 animate-pulse" />
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'seen':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return <Send className="w-3 h-3 text-gray-400" />
    }
  }

  const getStatusText = () => {
    if (!isOwnMessage) return ''

    switch (message.status) {
      case 'sending':
        return 'Sending...'
      case 'sent':
        return 'Sent'
      case 'delivered':
        return 'Delivered'
      case 'seen':
        return 'Seen'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (message.status) {
      case 'sending':
        return 'text-gray-400'
      case 'sent':
        return 'text-gray-400'
      case 'delivered':
        return 'text-gray-500'
      case 'seen':
        return 'text-blue-500'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className={`flex items-start space-x-2 sm:space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {!isOwnMessage && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-white">
            {getInitials(message.user_profile?.full_name || message.user_profile?.username || 'U')}
          </span>
        </div>
      )}
      
      <div className={`flex flex-col max-w-[75%] sm:max-w-xs lg:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {!isOwnMessage && (
          <span className="text-xs font-medium text-gray-600 mb-1 px-1">
            {message.user_profile?.full_name || message.user_profile?.username}
          </span>
        )}
        
        <div
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
            isOwnMessage
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        </div>
        
        <div className={`flex items-center space-x-1 mt-1 px-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <span className={`text-xs text-gray-500 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {formatTime(message.created_at)}
          </span>
          
          {isOwnMessage && (
            <div className="flex items-center space-x-1">
              {getStatusIcon()}
              <span className={`text-xs ${getStatusColor()} hidden sm:inline`}>
                {getStatusText()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}