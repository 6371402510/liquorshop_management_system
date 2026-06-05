const API_BASE = 'http://127.0.0.1:8000'

// --- EXPENSE FUNCTIONS ---

export const getExpenses = async (startDate, endDate) => {
  const token = localStorage.getItem('token')
  let url = `${API_BASE}/expenses/?`
  if (startDate) url += `start_date=${startDate}&`
  if (endDate) url += `end_date=${endDate}&`
  
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch expenses')
  return res.json()
}

export const createExpense = async (payload) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/expenses/`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to save expense')
  return data
}

export const updateExpense = async (id, payload) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update expense')
  return data
}

export const deleteExpense = async (id) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete expense')
}

// --- CATEGORY FUNCTIONS ---

export const getCategories = async () => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/categories/`, {
    method: 'GET',
    headers: { 
      'accept': 'application/json', 
      'Authorization': `Bearer ${token}` 
    }
  })
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export const createCategory = async (name) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/categories/`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  })
  
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to add category')
  return data
}

export const deleteCategory = async (id) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete category')
}