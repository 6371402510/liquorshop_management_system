const API_BASE = import.meta.env.VITE_API_BASE

export const getCompanies = async () => {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}/companies/`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to fetch companies')
  return res.json()
}

export const createCompany = async (companyData) => {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}/companies/`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(companyData),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to create company')
  return data
}

export const updateCompany = async (id, companyData) => {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}/companies/${id}`, {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(companyData),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update company')
  return data
}

export const deleteCompany = async (id) => {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}/companies/${id}`, {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to delete company')
  return true
}