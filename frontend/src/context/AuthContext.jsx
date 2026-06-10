import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})
const API_BASE = import.meta.env.VITE_API_BASE

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        localStorage.clear()
      }
    }

    setLoading(false)
  }, [])

  // LOGIN
  const signIn = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { error: { message: data.detail || 'Login failed' } }
      }

      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)

      return { error: null, data: data.user }
    } catch (err) {
      return { error: { message: 'Network error.' } }
    }
  }

  // SIGNUP
  const signUp = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'ADMIN',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 422 && Array.isArray(data.detail)) {
          const messages = data.detail.map((d) => d.msg).join(', ')
          return { error: { message: messages } }
        }

        return { error: { message: data.detail || 'Registration failed' } }
      }

      return {
        error: null,
        message: data.message || 'Account created successfully!',
      }
    } catch (err) {
      return { error: { message: 'Network error.' } }
    }
  }

  // SIGNOUT
  const signOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('selectedCompany')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)