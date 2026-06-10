const API_BASE = import.meta.env.VITE_API_BASE

export const getDashboardData = async (companyId, date = '') => {
  const token = localStorage.getItem('token')

  const params = new URLSearchParams()
  if (companyId) params.append('company_id', companyId)
  if (date) params.append('date', date)

  const res = await fetch(`${API_BASE}/dashboard/?${params.toString()}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to fetch dashboard data')
  }

  return res.json()
}