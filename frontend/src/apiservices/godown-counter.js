const API_BASE = 'http://127.0.0.1:8000'

export const getGodownProducts = async (companyId = null, search = '') => {
  const token = localStorage.getItem('token')
  
  // ─── ADDED COMPANY_ID QUERY PARAM ───
  let url = `${API_BASE}/api/godown/products?search=${search}`
  if (companyId) url += `&company_id=${companyId}`

  const res = await fetch(url, {
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

export const getGodownSales = async (companyId = null, dateFrom = '', dateTo = '') => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()
  
  // ─── ADDED COMPANY_ID QUERY PARAM ───
  if (companyId) params.append('company_id', companyId)
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