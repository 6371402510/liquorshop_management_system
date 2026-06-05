const API_BASE = 'http://127.0.0.1:8000'

export const getProducts = async () => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/products/`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export const createProduct = async (productData) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/products/`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to create product')
  return data
}

export const updateProduct = async (id, productData) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update product')
  return data
}

export const deleteProduct = async (id) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to delete product')
  return true
}

export const searchProducts = async (query) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/products/search/?q=${query}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to search products')
  return res.json()
}