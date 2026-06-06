import { useState, useEffect } from 'react'
import { Search, Calendar, Loader2, AlertCircle, CalendarDays, UserCircle, FileText, Store } from 'lucide-react'
import clsx from 'clsx'

import { getAttendance, getMonthlyReport, getEmployeeReport } from '../apiservices/attendanceapi'
import { getEmployees } from '../apiservices/employeeapi'

const TABS = [
  { id: 'DAY', label: 'Day Wise', icon: CalendarDays },
  { id: 'MONTH', label: 'Month Wise', icon: Calendar },
  { id: 'EMPLOYEE', label: 'Employee Wise', icon: UserCircle },
]

export default function AttendanceReports() {
  // ─── COMPANY ID FROM LOCAL STORAGE ───
  const [companyId, setCompanyId] = useState(() => localStorage.getItem('selectedCompanyId') || null)
  const companyName = localStorage.getItem('selectedCompanyName') || 'Unknown Company'

  const [activeTab, setActiveTab] = useState('MONTH')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Data states
  const [employees, setEmployees] = useState([])
  const [dayData, setDayData] = useState([])
  const [monthData, setMonthData] = useState([])
  const [empData, setEmpData] = useState([])
  
  // Filter States
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [search, setSearch] = useState('')

  // Employee Wise Filters
  const [empSelectedId, setEmpSelectedId] = useState('')
  const [empStartDate, setEmpStartDate] = useState(new Date().toISOString().split('T')[0])
  const [empEndDate, setEmpEndDate] = useState(new Date().toISOString().split('T')[0])

  // ─── Listen for company changes ───
  useEffect(() => {
    const handleStorage = () => {
      const newId = localStorage.getItem('selectedCompanyId') || null
      if (newId !== companyId) setCompanyId(newId)
    }
    window.addEventListener('storage', handleStorage)
    const interval = setInterval(() => {
      const newId = localStorage.getItem('selectedCompanyId') || null
      if (newId !== companyId) setCompanyId(newId)
    }, 1000)
    return () => {
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [companyId])

  // ─── Fetch employees when company changes ───
  useEffect(() => {
    if (!companyId) {
      setEmployees([])
      return
    }
    fetchEmployees()
  }, [companyId])

  // ─── Fetch reports when filters or company change ───
  useEffect(() => {
    if (!companyId) return
    if (activeTab === 'DAY') fetchDayData()
    if (activeTab === 'MONTH') fetchMonthData()
  }, [activeTab, selectedDate, selectedMonth, companyId])

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees(Number(companyId))
      setEmployees(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchDayData = async () => {
    setLoading(true); setError('')
    try {
      const data = await getAttendance(Number(companyId), selectedDate)
      setDayData(data || [])
    } catch (err) { setError(err.message) } 
    finally { setLoading(false) }
  }

  const fetchMonthData = async () => {
    setLoading(true); setError('')
    try {
      const data = await getMonthlyReport(selectedMonth, Number(companyId))
      setMonthData(data || [])
    } catch (err) { setError(err.message) } 
    finally { setLoading(false) }
  }

  const fetchEmployeeData = async () => {
    if (!empSelectedId) return alert("Please select an employee")
    setLoading(true); setError('')
    try {
      const data = await getEmployeeReport(empSelectedId, Number(companyId), empStartDate, empEndDate)
      setEmpData(data || [])
    } catch (err) { setError(err.message) } 
    finally { setLoading(false) }
  }

  const filteredMonthData = monthData.filter(r => {
    const q = search.toLowerCase()
    return !q || (r.employee_name || '').toLowerCase().includes(q) || (r.employee_code || '').toLowerCase().includes(q)
  })

  const getStatusClasses = (status) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
      case 'UNPAID_LEAVE': return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
      case 'HALF_DAY': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
      case 'PAID_LEAVE': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // ─── GUARD: NO COMPANY SELECTED ───
  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">No Company Selected</h3>
        <p className="text-sm text-gray-500 text-center max-w-md">Please select a company to view attendance reports.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Company Badge */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary-500" />
          Attendance Reports
        </h2>
        {/* ─── COMPANY BADGE ─── */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
          <Store className="w-3.5 h-3.5 text-primary-500" />
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">{companyName}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setError('') }}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-8 w-full"
          />
        </div>

        {activeTab === 'DAY' && (
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input-field w-48" />
        )}

        {activeTab === 'MONTH' && (
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="input-field w-48" />
        )}

        {activeTab === 'EMPLOYEE' && (
          <>
            <select value={empSelectedId} onChange={e => setEmpSelectedId(e.target.value)} className="input-field w-60">
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.employee_code})
                </option>
              ))}
            </select>
            <input type="date" value={empStartDate} onChange={e => setEmpStartDate(e.target.value)} className="input-field w-44" />
            <input type="date" value={empEndDate} onChange={e => setEmpEndDate(e.target.value)} className="input-field w-44" />
            <button onClick={fetchEmployeeData} className="btn-primary">
              <FileText className="w-4 h-4" /> Generate
            </button>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Tables */}
      {loading ? (
        <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" /></div>
      ) : (
        <>
          {/* DAY WISE REPORT */}
          {activeTab === 'DAY' && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="table-header text-left">Employee</th>
                      <th className="table-header text-left">Code</th>
                      <th className="table-header text-left">Status</th>
                      <th className="table-header text-left">Check In</th>
                      <th className="table-header text-left">Check Out</th>
                      <th className="table-header text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {dayData.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">No records for {selectedDate}</td></tr>
                    ) : dayData.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="table-cell font-medium text-gray-800 dark:text-gray-200">{r.employee_name || '—'}</td>
                        <td className="table-cell font-mono text-xs text-gray-500">{r.employee_code || '—'}</td>
                        <td className="table-cell">
                          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', getStatusClasses(r.status))}>
                            {r.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="table-cell text-sm">{r.check_in_time || '—'}</td>
                        <td className="table-cell text-sm">{r.check_out_time || '—'}</td>
                        <td className="table-cell text-sm text-gray-500 max-w-[200px] truncate">{r.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MONTH WISE REPORT */}
          {activeTab === 'MONTH' && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="table-header text-left">Employee</th>
                      <th className="table-header text-left">Code</th>
                      <th className="table-header text-left">Department</th>
                      <th className="table-header text-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">Present</th>
                      <th className="table-header text-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">Paid Leave</th>
                      <th className="table-header text-center bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">Unpaid Leave</th>
                      <th className="table-header text-center bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">Half Day</th>
                      <th className="table-header text-center">Working Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filteredMonthData.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-10 text-sm text-gray-400">No records found for {selectedMonth}</td></tr>
                    ) : filteredMonthData.map(r => (
                      <tr key={r.employee_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="table-cell font-medium text-gray-800 dark:text-gray-200">{r.employee_name || '—'}</td>
                        <td className="table-cell font-mono text-xs text-gray-500">{r.employee_code || '—'}</td>
                        <td className="table-cell text-sm text-gray-500">{r.department || '—'}</td>
                        <td className="table-cell text-center font-bold text-emerald-600 dark:text-emerald-400">{r.present_days}</td>
                        <td className="table-cell text-center font-bold text-blue-600 dark:text-blue-400">{r.paid_leave_days}</td>
                        <td className="table-cell text-center font-bold text-red-600 dark:text-red-400">{r.unpaid_leave_days}</td>
                        <td className="table-cell text-center font-bold text-amber-600 dark:text-amber-400">{r.half_days}</td>
                        <td className="table-cell text-center font-semibold text-gray-800 dark:text-gray-200">{r.total_working_days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EMPLOYEE WISE REPORT */}
          {activeTab === 'EMPLOYEE' && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="table-header text-left">Date</th>
                      <th className="table-header text-left">Employee Name</th>
                      <th className="table-header text-left">Status</th>
                      <th className="table-header text-left">Check In</th>
                      <th className="table-header text-left">Check Out</th>
                      <th className="table-header text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {empData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-sm text-gray-400">
                          {empSelectedId ? "No records found for this period" : "Select an employee and dates, then click Generate"}
                        </td>
                      </tr>
                    ) : empData.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="table-cell font-medium text-gray-800 dark:text-gray-200">
                          {formatDate(r.date)}
                        </td>
                        <td className="table-cell text-gray-700 dark:text-gray-300">
                          {r.employee_name || '—'}
                        </td>
                        <td className="table-cell">
                          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', getStatusClasses(r.status))}>
                            {r.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="table-cell text-sm text-gray-600 dark:text-gray-300">
                          {r.check_in_time || '—'}
                        </td>
                        <td className="table-cell text-sm text-gray-600 dark:text-gray-300">
                          {r.check_out_time || '—'}
                        </td>
                        <td className="table-cell text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                          {r.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}