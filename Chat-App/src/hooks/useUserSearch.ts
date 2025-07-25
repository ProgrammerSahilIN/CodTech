import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  last_seen: string | null
  created_at: string | null
}

export function useUserSearch() {
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchUserByUsername = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Remove @ symbol if present at the beginning
      const cleanUsername = searchTerm.startsWith('@') 
        ? searchTerm.slice(1) 
        : searchTerm

      if (!cleanUsername.trim()) {
        setSearchResults([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${cleanUsername}%`)
        .order('username')
        .limit(10)

      if (error) throw error

      setSearchResults(data || [])
    } catch (err: any) {
      console.error('Error searching users:', err)
      setError(err.message)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const searchUserByExactUsername = async (username: string) => {
    if (!username.trim()) {
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Remove @ symbol if present at the beginning
      const cleanUsername = username.startsWith('@') 
        ? username.slice(1) 
        : username

      if (!cleanUsername.trim()) {
        setLoading(false)
        return null
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .maybeSingle()

      if (error) throw error

      return data
    } catch (err: any) {
      console.error('Error searching user by exact username:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchResults([])
    setError(null)
  }

  return {
    searchResults,
    loading,
    error,
    searchUserByUsername,
    searchUserByExactUsername,
    clearSearch,
  }
}