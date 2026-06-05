const API_BASE = 'http://127.0.0.1:8000'

export const getGodownProducts = async (search = '') => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/api/godown/products?search=${search}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`  
    }
  })
  if (!res.ok) throw new Error('Failed to fetch Godown products')
  return res.json()
}

export const processGodownCheckout = async (saleData) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/api/godown/checkout`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(saleData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Godown checkout failed')
  return data
}

export const getGodownSales = async (dateFrom = '', dateTo = '') => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()
  if (dateFrom) params.append('date_from', dateFrom)
  if (dateTo) params.append('date_to', dateTo)

  const res = await fetch(`${API_BASE}/api/godown/sales?${params.toString()}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to fetch godown sales')
  return res.json()
}