import { useState, useEffect } from 'react'
import { Search, Save, Loader2, CalendarCheck, CalendarX, Clock, Calendar, AlertCircle, UserCheck, Briefcase } from 'lucide-react'
import clsx from 'clsx'

// Import API functions
import { getAttendance, markAttendance, updateAttendance } from '../apiservices/attendanceapi'
import { getEmployees } from '../apiservices/employeeapi'

// UPDATED: Removed ABSENT/HOLIDAY, Added PAID_LEAVE and UNPAID_LEAVE
const ATTENDANCE_STATUSES = ['PRESENT', 'PAID_LEAVE', 'UNPAID_LEAVE', 'HALF_DAY']

export default function EmployeeAttendance() {
  const [employees, setEmployees] = useState([])
  const [existingRecords, setExistingRecords] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [search, setSearch] = useState('')
  
  const [sheetData, setSheetData] = useState({})

  useEffect(() => {
    fetchEmployeesList()
  }, [])

  useEffect(() => {
    fetchAttendanceRecords()
  }, [selectedDate, employees])

  const fetchEmployeesList = async () => {
    try {
      const data = await getEmployees()
      setEmployees(data || [])
    } catch (err) {
      setError(err.message || 'Could not load employees')
    }
  }

  const fetchAttendanceRecords = async () => {
    if (employees.length === 0) return
    setLoading(true)
    setError('')
    try {
      const data = await getAttendance(selectedDate)
      const recordsMap = {}
      data.forEach(r => { recordsMap[r.employee_id] = r })
      setExistingRecords(recordsMap)
      
      const initialSheetData = {}
      employees.forEach(emp => {
        const record = recordsMap[emp.id]
        initialSheetData[emp.id] = {
          status: record?.status || '',
          check_in_time: record?.check_in_time || '',
          check_out_time: record?.check_out_time || '',
          notes: record?.notes || ''
        }
      })
      setSheetData(initialSheetData)
    } catch (err) {
      setError(err.message || 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleLocalChange = (employeeId, field, value) => {
    setSheetData(prev => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], [field]: value }
    }))
  }

  const handleSaveRow = async (employeeId) => {
    setSavingId(employeeId)
    setError('')
    
    const rowData = sheetData[employeeId]
    if (!rowData.status) {
      alert('Please select a status first')
      setSavingId(null)
      return
    }

    const payload = {
      employee_id: employeeId,
      date: selectedDate,
      status: rowData.status,
      check_in_time: rowData.check_in_time || null,
      check_out_time: rowData.check_out_time || null,
      notes: rowData.notes || null
    }

    try {
      const existingRecord = existingRecords[employeeId]
      if (existingRecord) {
        await updateAttendance(existingRecord.id, payload)
      } else {
        await markAttendance(payload)
      }
      fetchAttendanceRecords()
    } catch (err) {
      setError(err.message || 'Failed to save attendance')
    } finally {
      setSavingId(null)
    }
  }

  const filtered = employees.filter(e => {
    const q = search.toLowerCase()
    return !q || e.first_name.toLowerCase().includes(q) || e.last_name.toLowerCase().includes(q) || (e.employee_code || '').toLowerCase().includes(q)
  })

  // UPDATED: Summary counts based on new logic
  const presentCount = Object.values(sheetData).filter(r => r.status === 'PRESENT').length
  const paidLeaveCount = Object.values(sheetData).filter(r => r.status === 'PAID_LEAVE').length
  const unpaidLeaveCount = Object.values(sheetData).filter(r => r.status === 'UNPAID_LEAVE').length
  const halfDayCount = Object.values(sheetData).filter(r => r.status === 'HALF_DAY').length
  
  // Working Days = Present + Paid Leave + (Half Day / 2)
  const totalWorkingDays = presentCount + paidLeaveCount + (halfDayCount / 2)

  const getStatusClasses = (status) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
      case 'UNPAID_LEAVE': return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
      case 'HALF_DAY': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
      case 'PAID_LEAVE': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-8 w-64" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input-field pl-8 w-48" />
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="card px-4 py-2.5 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{employees.length} Total</span>
        </div>
        <div className="card px-4 py-2.5 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{presentCount} Present</span>
        </div>
        <div className="card px-4 py-2.5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{paidLeaveCount} Paid Leave</span>
        </div>
        <div className="card px-4 py-2.5 flex items-center gap-2">
          <CalendarX className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{unpaidLeaveCount} Unpaid Leave</span>
        </div>
        <div className="card px-4 py-2.5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{halfDayCount} Half Day</span>
        </div>
        
        {/* WORKING DAYS CARD */}
        <div className="card px-4 py-2.5 flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
          <Briefcase className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-bold text-primary-700 dark:text-primary-300">{totalWorkingDays} Working Days</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Attendance Sheet Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="table-header text-left">Employee</th>
                <th className="table-header text-left">Code / Dept</th>
                <th className="table-header text-center w-40">Status *</th>
                <th className="table-header text-center w-32">Check In</th>
                <th className="table-header text-center w-32">Check Out</th>
                <th className="table-header text-center w-40">Notes</th>
                <th className="table-header text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-sm text-gray-400">No employees found</td></tr>
              ) : filtered.map(emp => {
                const rowData = sheetData[emp.id] || {}
                return (
                  <tr key={emp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-xs">
                          {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{emp.first_name} {emp.last_name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-xs font-mono text-gray-500">{emp.employee_code || '—'}</div>
                      <div className="text-xs text-gray-400">{emp.department || '—'}</div>
                    </td>
                    <td className="table-cell">
                      <select 
                        value={rowData.status || ''} 
                        onChange={e => handleLocalChange(emp.id, 'status', e.target.value)}
                        className={clsx(
                          "w-full text-xs border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-white",
                          rowData.status ? getStatusClasses(rowData.status) : 'bg-gray-50 text-gray-400'
                        )}
                      >
                        <option value="">-- Select --</option>
                        {ATTENDANCE_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </td>
                    <td className="table-cell text-center">
                      <input type="time" value={rowData.check_in_time || ''} onChange={e => handleLocalChange(emp.id, 'check_in_time', e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-white text-center" />
                    </td>
                    <td className="table-cell text-center">
                      <input type="time" value={rowData.check_out_time || ''} onChange={e => handleLocalChange(emp.id, 'check_out_time', e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-white text-center" />
                    </td>
                    <td className="table-cell text-center">
                      <input type="text" value={rowData.notes || ''} onChange={e => handleLocalChange(emp.id, 'notes', e.target.value)} placeholder="Optional" className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-white" />
                    </td>
                    <td className="table-cell text-center">
                      <button 
                        onClick={() => handleSaveRow(emp.id)} 
                        disabled={savingId === emp.id || !rowData.status}
                        className={clsx(
                          "inline-flex items-center justify-center p-1.5 rounded-lg transition-colors",
                          rowData.status ? "text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20" : "text-gray-300 cursor-not-allowed dark:text-gray-600"
                        )}
                      >
                        {savingId === emp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}