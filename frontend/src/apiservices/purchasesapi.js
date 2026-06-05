const API_BASE = 'http://127.0.0.1:8000'

export const getPurchases = async () => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/purchases/`, {
    method: 'GET',
    headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch purchases')
  return res.json()
}

export const createPurchase = async (purchaseData) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/purchases/`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(purchaseData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to save purchase')
  return data
}

export const getPurchaseItems = async (purchaseId) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/purchases/${purchaseId}/items`, {
    method: 'GET',
    headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch purchase items')
  return res.json()
}