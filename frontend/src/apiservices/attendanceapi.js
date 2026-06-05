const API_BASE = 'http://127.0.0.1:8000'

export const getAttendance = async (date = '') => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()
  if (date) params.append('date', date)
  
  const res = await fetch(`${API_BASE}/attendance/?${params.toString()}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to fetch attendance')
  return res.json()
}

// MUST be named markAttendance to match the React import
export const markAttendance = async (attendanceData) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/attendance/`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(attendanceData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to mark attendance')
  return data
}

export const updateAttendance = async (id, attendanceData) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/attendance/${id}`, {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(attendanceData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update attendance')
  return data
}

export const deleteAttendance = async (id) => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/attendance/${id}`, {
    method: 'DELETE',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to delete attendance record')
  return true
}


// Add this to attendanceapi.js

export const getMonthlyReport = async (month = '') => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()
  if (month) params.append('month', month)
  
  const res = await fetch(`${API_BASE}/attendance/report/monthly?${params.toString()}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to fetch monthly report')
  return res.json()
}


export const getEmployeeReport = async (employeeId, startDate = '', endDate = '') => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()
  params.append('employee_id', employeeId)
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  
  const res = await fetch(`${API_BASE}/attendance/report/employee?${params.toString()}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error('Failed to fetch employee report')
  return res.json()
}