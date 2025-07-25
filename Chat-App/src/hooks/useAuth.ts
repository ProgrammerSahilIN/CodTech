import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const ensureProfileExists = async (user: User) => {
    try {
      // First, try to get the existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      // If profile exists, update last seen and return it
      if (existingProfile && !fetchError) {
        await updateLastSeen(user.id)
        return existingProfile
      }

      // If profile doesn't exist, create one
      if (!existingProfile) {
        // Prioritize user metadata, then fall back to email-based defaults
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
            last_seen: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          // Don't throw here - let the user continue even if profile creation fails
          return null
        }

        return newProfile
      }

      // If it's a different error, log it but don't throw
      if (fetchError) {
        console.error('Error fetching profile:', fetchError)
        return null
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error)
      // Don't throw - let the user continue
      return null
    }
  }

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout
    let lastSeenInterval: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        setError(null)
        
        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Supabase configuration is missing. Please check your environment variables.')
        }

        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout')
            setLoading(false)
          }
        }, 5000) // 5 second timeout

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setError(`Authentication error: ${error.message}`)
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (session?.user && mounted) {
          setUser(session.user)
          // Try to ensure profile exists, but don't block on it
          ensureProfileExists(session.user).catch(err => {
            console.error('Profile creation failed, but continuing:', err)
          })

          // Set up periodic last seen updates (every 2 minutes for more frequent updates)
          lastSeenInterval = setInterval(() => {
            updateLastSeen(session.user.id)
          }, 2 * 60 * 1000) // 2 minutes
        } else if (mounted) {
          setUser(null)
        }
      } catch (error: any) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setError(`Initialization error: ${error.message}`)
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        try {
          setError(null)
          if (session?.user) {
            setUser(session.user)
            // Try to ensure profile exists, but don't block on it
            ensureProfileExists(session.user).catch(err => {
              console.error('Profile creation failed during auth change, but continuing:', err)
            })

            // Set up periodic last seen updates for new session
            if (lastSeenInterval) {
              clearInterval(lastSeenInterval)
            }
            lastSeenInterval = setInterval(() => {
              updateLastSeen(session.user.id)
            }, 2 * 60 * 1000) // 2 minutes
          } else {
            setUser(null)
            // Clear last seen interval when user signs out
            if (lastSeenInterval) {
              clearInterval(lastSeenInterval)
            }
          }
        } catch (error: any) {
          console.error('Error handling auth state change:', error)
          setUser(session?.user || null)
        } finally {
          if (mounted) {
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (lastSeenInterval) {
        clearInterval(lastSeenInterval)
      }
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setError(null)
      // Pass username and full_name as user metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: username,
          }
        }
      })

      if (error) throw error

      // The profile will be created by the database trigger or ensureProfileExists
      return data
    } catch (error: any) {
      console.error('Error during sign up:', error)
      setError(`Sign up error: ${error.message}`)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error during sign in:', error)
      setError(`Sign in error: ${error.message}`)
      throw error
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      // Update last seen before signing out
      if (user) {
        await updateLastSeen(user.id)
      }
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      console.error('Error during sign out:', error)
      setError(`Sign out error: ${error.message}`)
      throw error
    }
  }

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  }
}