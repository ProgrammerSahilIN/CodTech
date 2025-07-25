import React, { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useMessages } from '../hooks/useMessages'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  last_seen: string | null
}

interface MessageInputProps {
  selectedUser: Profile
  onMessageSent?: () => void // Callback to trigger refresh
}

export function MessageInput({ selectedUser, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { user } = useAuth()
  const { sendMessage } = useMessages(selectedUser.id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || !user || sending) return

    setSending(true)
    
    try {
      await sendMessage(message.trim(), user.id, selectedUser.id)
      setMessage('')
      inputRef.current?.focus()
      
      // Trigger refresh after successful message send
      if (onMessageSent) {
        // Small delay to ensure message is processed
        setTimeout(() => {
          onMessageSent()
        }, 100)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  return (
    <div className="bg-white/90 backdrop-blur-lg border-t border-gray-200 p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${selectedUser.full_name || selectedUser.username}...`}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
            disabled={sending}
            maxLength={1000}
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          {message.length > 800 && (
            <div className="absolute right-12 sm:right-14 bottom-2 sm:bottom-3 text-xs text-gray-500">
              {1000 - message.length}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex-shrink-0"
        >
          {sending ? (
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
          ) : (
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </form>
    </div>
  )
}