const API_BASE = 'http://127.0.0.1:8000'

export const getEmployees = async (search = '', department = '') => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (department && department !== 'ALL') params.append('department', department)
  
  const res = await fetch(`${API_BASE}/employees/?${params.toString()}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to fetch employees')
  return res.json()
}

export const createEmployee = async (employeeData) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/employees/`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(employeeData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to create employee')
  return data
}

export const updateEmployee = async (id, employeeData) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(employeeData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update employee')
  return data
}

export const deleteEmployee = async (id) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: 'DELETE',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to delete employee')
  return true
}