const API_BASE = 'http://127.0.0.1:8000'

export const getSuppliers = async () => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/suppliers/`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to fetch suppliers')
  return res.json()
}

export const createSupplier = async (supplierData) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/suppliers/`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(supplierData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to create supplier')
  return data
}

export const updateSupplier = async (id, supplierData) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(supplierData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update supplier')
  return data
}

export const deleteSupplier = async (id) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'DELETE',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to delete supplier')
  return true
}