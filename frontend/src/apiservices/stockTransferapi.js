const API_BASE = 'http://127.0.0.1:8000'

export const getStockTransfers = async (companyId = null) => {
  const token = localStorage.getItem('token')
  
  // ─── ADDED COMPANY_ID QUERY PARAM ───
  let url = `${API_BASE}/stock-transfers/`
  if (companyId) {
    url += `?company_id=${companyId}`
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch transfers')
  return res.json()
}

export const createStockTransfer = async (transferData) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/stock-transfers/`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(transferData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to save transfer')
  return data
}

export const getStockTransferItems = async (transferId) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/stock-transfers/${transferId}/items`, {
    method: 'GET',
    headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch transfer items')
  return res.json()
}