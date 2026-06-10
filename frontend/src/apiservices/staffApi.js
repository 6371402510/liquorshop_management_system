const API_BASE = import.meta.env.VITE_API_BASE

// Get all users (Managers & Salesmen)
export const getUsers = async () => {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}/auth/users`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    // safer error handling (prevents HTML crash)
    const errorText = await res.text()
    console.error('API Error Response:', errorText)

    throw new Error(
      `Failed to fetch users (Status: ${res.status}). Check backend route.`
    )
  }

  return res.json()
}

// Create a new user (Manager or Salesman)
export const createUser = async (userData) => {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}/auth/users`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to create user')

  return data
}