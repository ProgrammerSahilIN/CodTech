import { createClient } from '@supabase/supabase-js'

// Read from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check and warn early if variables are not found
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'undefined')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing')
  throw new Error('Supabase configuration is missing. Please check your .env file.')
}

// Export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for Supabase DB
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          last_seen: string | null
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          last_seen?: string | null
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          last_seen?: string | null
        }
      }
      messages: {
        Row: {
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
          profiles: {
            username: string
            full_name: string | null
            avatar_url: string | null
          }
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          recipient_id?: string | null
          conversation_id?: string | null
          created_at?: string
          sent_at?: string | null
          delivered_at?: string | null
          seen_at?: string | null
          status?: 'sending' | 'sent' | 'delivered' | 'seen'
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          recipient_id?: string | null
          conversation_id?: string | null
          created_at?: string
          sent_at?: string | null
          delivered_at?: string | null
          seen_at?: string | null
          status?: 'sending' | 'sent' | 'delivered' | 'seen'
        }
      }
      conversations: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_or_create_conversation: {
        Args: {
          user1: string
          user2: string
        }
        Returns: string
      }
      mark_messages_as_seen: {
        Args: {
          sender_id: string
          viewer_id: string
        }
        Returns: void
      }
      mark_messages_as_delivered: {
        Args: {
          recipient_id: string
        }
        Returns: void
      }
    }
  }
}
