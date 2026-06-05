import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

const API_BASE = 'http://127.0.0.1:8000'

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
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        const message = data.detail || 'Login failed'
        return { error: { message } }
      }

      // Store token
      localStorage.setItem('token', data.access_token)

      // Backend returns user object: { id, name, email, role }
      const userInfo = data.user || {
        email,
        name: email.split('@')[0],
        role: 'admin',
      }
      localStorage.setItem('user', JSON.stringify(userInfo))
      setUser(userInfo)

      // ✅ IMPORTANT: Return the userInfo object on success so Login.jsx can read the role
      return { error: null, data: userInfo }
    } catch (err) {
      return { error: { message: 'Network error. Please check your connection.' } }
    }
  }

  const signUp = async (name, email, password, role) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 422 && Array.isArray(data.detail)) {
          const messages = data.detail.map(d => d.msg).join(', ')
          return { error: { message: messages } }
        }
        const message = data.detail || 'Registration failed'
        return { error: { message } }
      }

      return { error: null, message: data.message }
    } catch (err) {
      return { error: { message: 'Network error. Please check your connection.' } }
    }
  }

  const signOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('selectedCompany') // Also clear selected company on sign out
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)