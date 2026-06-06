const API_BASE = 'http://127.0.0.1:8000'

export const getDashboardData = async (companyId) => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()
  if (companyId) params.append('company_id', companyId)

  const res = await fetch(`${API_BASE}/dashboard/?${params.toString()}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to fetch dashboard data')
  }
  
  return res.json()
}