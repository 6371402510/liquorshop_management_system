const API_BASE = import.meta.env.VITE_API_BASE

// --- EXPENSE FUNCTIONS ---

export const getExpenses = async (companyId, startDate, endDate) => {
  const token = localStorage.getItem('token')

  const params = new URLSearchParams()
  if (companyId) params.append('company_id', companyId)
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const res = await fetch(`${API_BASE}/expenses/?${params.toString()}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to fetch expenses')
  return res.json()
}

export const createExpense = async (payload) => {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}/expenses/`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to save expense')
  return data
}

export const updateExpense = async (id, payload, companyId) => {
  const token = localStorage.getItem('token')

  const params = new URLSearchParams()
  if (companyId) params.append('company_id', companyId)

  const res = await fetch(
    `${API_BASE}/expenses/${id}?${params.toString()}`,
    {
      method: 'PUT',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  )

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update expense')
  return data
}

export const deleteExpense = async (id, companyId) => {
  const token = localStorage.getItem('token')

  const params = new URLSearchParams()
  if (companyId) params.append('company_id', companyId)

  const res = await fetch(
    `${API_BASE}/expenses/${id}?${params.toString()}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete expense')
  }

  return true
}

// --- CATEGORY FUNCTIONS ---

export const getCategories = async (companyId) => {
  const token = localStorage.getItem('token')

  const params = new URLSearchParams()
  if (companyId) params.append('company_id', companyId)

  const res = await fetch(`${API_BASE}/categories/?${params.toString()}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export const createCategory = async (name, companyId) => {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}/categories/`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      company_id: Number(companyId),
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to add category')
  return data
}

export const deleteCategory = async (id, companyId) => {
  const token = localStorage.getItem('token')

  const params = new URLSearchParams()
  if (companyId) params.append('company_id', companyId)

  const res = await fetch(
    `${API_BASE}/categories/${id}?${params.toString()}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete category')
  }

  return true
}