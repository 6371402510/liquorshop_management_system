// apiservices/attendanceapi.js

const API_BASE = import.meta.env.VITE_API_BASE

export const getAttendance = async (companyId, date = '') => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()

  if (companyId) params.append('company_id', companyId)
  if (date) params.append('date', date)

  const res = await fetch(`${API_BASE}/attendance/?${params.toString()}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to fetch attendance')
  return res.json()
}

export const markAttendance = async (attendanceData) => {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}/attendance/`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(attendanceData),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to mark attendance')
  return data
}

export const updateAttendance = async (id, attendanceData, companyId) => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()

  if (companyId) params.append('company_id', companyId)

  const res = await fetch(
    `${API_BASE}/attendance/${id}?${params.toString()}`,
    {
      method: 'PUT',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(attendanceData),
    }
  )

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update attendance')
  return data
}

export const deleteAttendance = async (id, companyId) => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()

  if (companyId) params.append('company_id', companyId)

  const res = await fetch(
    `${API_BASE}/attendance/${id}?${params.toString()}`,
    {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) throw new Error('Failed to delete attendance record')
  return true
}

export const getMonthlyReport = async (month, companyId) => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()

  if (month) params.append('month', month)
  if (companyId) params.append('company_id', companyId)

  const res = await fetch(
    `${API_BASE}/attendance/report/monthly?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) throw new Error('Failed to fetch monthly report')
  return res.json()
}

export const getEmployeeReport = async (
  employeeId,
  companyId,
  startDate = '',
  endDate = ''
) => {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()

  params.append('employee_id', employeeId)
  if (companyId) params.append('company_id', companyId)
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const res = await fetch(
    `${API_BASE}/attendance/report/employee?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) throw new Error('Failed to fetch employee report')
  return res.json()
}