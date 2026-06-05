const API_BASE = 'http://127.0.0.1:8000'

export const getPosProducts = async (search = '') => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/sales/pos-products/?search=${search}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to fetch POS products')
  return res.json()
}

export const processCheckout = async (saleData) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/sales/`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(saleData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Checkout failed')
  return data
}


export const getCounterSales = async (dateFrom = '', dateTo = '') => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()
  if (dateFrom) params.append('date_from', dateFrom)
  if (dateTo) params.append('date_to', dateTo)

  const res = await fetch(`${API_BASE}/sales/?${params.toString()}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to fetch counter sales')
  return res.json()
}