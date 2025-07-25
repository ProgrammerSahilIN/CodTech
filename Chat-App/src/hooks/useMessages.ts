import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/supabase'
import { useAuth } from './useAuth'

type Message = Database['public']['Tables']['messages']['Row'] & {
  user_profile: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

export function useMessages(recipientId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!recipientId) {
      setMessages([])
      setLoading(false)
      return
    }

    // Only proceed when auth is loaded and user is available
    if (authLoading || !currentUser) {
      setLoading(true)
      return
    }

    fetchMessages()
    markMessagesAsSeen()

    // Set up real-time subscription for all messages
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMessage = payload.new as any
          
          // Only process messages that are part of this conversation
          const isRelevantMessage = 
            (newMessage.user_id === currentUser.id && newMessage.recipient_id === recipientId) ||
            (newMessage.user_id === recipientId && newMessage.recipient_id === currentUser.id)
          
          if (isRelevantMessage) {
            // Fetch the complete message with profile data
            try {
              const { data, error } = await supabase
                .from('messages')
                .select(`
                  *,
                  user_profile:profiles!user_id (
                    username,
                    full_name,
                    avatar_url
                  )
                `)
                .eq('id', newMessage.id)
                .single()

              if (!error && data) {
                setMessages(prev => {
                  // Check if message already exists to avoid duplicates
                  const messageExists = prev.some(msg => msg.id === data.id)
                  if (messageExists) return prev
                  
                  // Add message and sort by timestamp
                  const newMessages = [...prev, data]
                  return newMessages.sort((a, b) => 
                    new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
                  )
                })

                // If this is a message from the other user, mark it as seen
                if (newMessage.user_id === recipientId) {
                  setTimeout(() => markMessagesAsSeen(), 1000) // Small delay to ensure message is displayed
                }
              }
            } catch (error) {
              console.error('Error fetching new message with profile:', error)
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const updatedMessage = payload.new as any
          
          // Only process messages that are part of this conversation
          const isRelevantMessage = 
            (updatedMessage.user_id === currentUser.id && updatedMessage.recipient_id === recipientId) ||
            (updatedMessage.user_id === recipientId && updatedMessage.recipient_id === currentUser.id)
          
          if (isRelevantMessage) {
            // Fetch the complete updated message with profile data
            try {
              const { data, error } = await supabase
                .from('messages')
                .select(`
                  *,
                  user_profile:profiles!user_id (
                    username,
                    full_name,
                    avatar_url
                  )
                `)
                .eq('id', updatedMessage.id)
                .single()

              if (!error && data) {
                setMessages(prev => 
                  prev.map(msg => msg.id === data.id ? data : msg)
                )
              }
            } catch (error) {
              console.error('Error fetching updated message with profile:', error)
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time messages')
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('❌ Real-time subscription failed. Messages will still work but won\'t update in real-time.')
          console.warn('To enable real-time updates, ensure the messages table is published in your Supabase project.')
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Real-time subscription timed out. Retrying...')
        } else if (status === 'CLOSED') {
          console.log('🔒 Real-time subscription closed')
        }
      })

    return () => {
      console.log('🔌 Unsubscribing from real-time messages')
      supabase.removeChannel(channel)
    }
  }, [recipientId, currentUser, authLoading])

  const fetchMessages = async () => {
    if (!recipientId || !currentUser) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          user_profile:profiles!user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .or(`and(user_id.eq.${currentUser.id},recipient_id.eq.${recipientId}),and(user_id.eq.${recipientId},recipient_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsSeen = async () => {
    if (!recipientId || !currentUser) return

    try {
      // Mark messages from the selected user as seen
      await supabase.rpc('mark_messages_as_seen', {
        sender_id: recipientId,
        viewer_id: currentUser.id
      })
    } catch (error) {
      console.error('Error marking messages as seen:', error)
    }
  }

  const markMessagesAsDelivered = async () => {
    if (!currentUser) return

    try {
      // Mark messages to current user as delivered
      await supabase.rpc('mark_messages_as_delivered', {
        p_recipient_id: currentUser.id
      })
    } catch (error) {
      console.error('Error marking messages as delivered:', error)
    }
  }

  const sendMessage = async (content: string, userId: string, recipientId: string) => {
    try {
      // Get current user profile for immediate display
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', userId)
        .single()

      // Create optimistic message for immediate display
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`, // Temporary ID
        content,
        user_id: userId,
        recipient_id: recipientId,
        conversation_id: null,
        created_at: new Date().toISOString(),
        sent_at: null,
        delivered_at: null,
        seen_at: null,
        status: 'sending',
        user_profile: {
          username: currentUserProfile?.username || 'user',
          full_name: currentUserProfile?.full_name || null,
          avatar_url: currentUserProfile?.avatar_url || null,
        }
      }

      // Add optimistic message immediately
      setMessages(prev => [...prev, optimisticMessage])

      // Get or create conversation
      const { data: conversationId, error: convError } = await supabase
        .rpc('get_or_create_conversation', {
          user1: userId,
          user2: recipientId
        })

      if (convError) {
        console.warn('Conversation RPC failed, sending message without conversation_id:', convError)
      }

      // Send actual message to database
      const { data: sentMessage, error } = await supabase
        .from('messages')
        .insert({
          content,
          user_id: userId,
          recipient_id: recipientId,
          conversation_id: conversationId || null,
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .select(`
          *,
          user_profile:profiles!user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
        throw error
      }

      // Replace optimistic message with real message
      if (sentMessage) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id ? sentMessage : msg
          )
        )
      }

      // Update last seen for current user and mark messages as delivered
      await Promise.all([
        updateLastSeen(userId),
        markMessagesAsDelivered()
      ])
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const updateLastSeen = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', userId)
    } catch (error) {
      console.error('Error updating last seen:', error)
    }
  }

  // Force refresh messages when recipient changes
  const refreshMessages = async () => {
    if (recipientId && currentUser) {
      await fetchMessages()
      await markMessagesAsSeen()
    }
  }

  return {
    messages,
    loading,
    sendMessage,
    refreshMessages,
  }
}