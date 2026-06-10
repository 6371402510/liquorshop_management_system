const API_BASE = import.meta.env.VITE_API_BASE

export const getEmployees = async (
  companyId,
  search = '',
  department = ''
) => {
  const token = localStorage.getItem('token')

  const params = new URLSearchParams()
  if (companyId) params.append('company_id', companyId)
  if (search) params.append('search', search)
  if (department && department !== 'ALL')
    params.append('department', department)

  const res = await fetch(`${API_BASE}/employees/?${params.toString()}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to fetch employees')
  return res.json()
}

export const createEmployee = async (employeeData) => {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}/employees/`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(employeeData),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to create employee')
  return data
}

export const updateEmployee = async (id, employeeData, companyId) => {
  const token = localStorage.getItem('token')

  const params = new URLSearchParams()
  if (companyId) params.append('company_id', companyId)

  const res = await fetch(
    `${API_BASE}/employees/${id}?${params.toString()}`,
    {
      method: 'PUT',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(employeeData),
    }
  )

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update employee')
  return data
}

export const deleteEmployee = async (id, companyId) => {
  const token = localStorage.getItem('token')

  const params = new URLSearchParams()
  if (companyId) params.append('company_id', companyId)

  const res = await fetch(
    `${API_BASE}/employees/${id}?${params.toString()}`,
    {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) throw new Error('Failed to delete employee')
  return true
}