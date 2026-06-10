const API_BASE = import.meta.env.VITE_API_BASE

export const getOperationsDashboard = async (dateFrom = '', dateTo = '') => {
  const token = localStorage.getItem('token')

  const params = new URLSearchParams()
  if (dateFrom) params.append('date_from', dateFrom)
  if (dateTo) params.append('date_to', dateTo)

  const res = await fetch(
    `${API_BASE}/operations-dashboard/?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) throw new Error('Failed to fetch operations dashboard data')

  return res.json()
}