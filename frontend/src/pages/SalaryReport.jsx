import { useState, useEffect } from 'react'
import { Search, Calendar, IndianRupee, Loader2, AlertCircle, Briefcase, Users, FileDown, Store } from 'lucide-react'
import clsx from 'clsx'

import { getEmployees } from '../apiservices/employeeapi'
import { getMonthlyReport } from '../apiservices/attendanceapi'

export default function SalaryReport() {
  // ─── COMPANY ID FROM LOCAL STORAGE ───
  const [companyId, setCompanyId] = useState(() => localStorage.getItem('selectedCompanyId') || null)
  const companyName = localStorage.getItem('selectedCompanyName') || 'Unknown Company'

  const [employees, setEmployees] = useState([])
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [search, setSearch] = useState('')

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

  // ─── Fetch data when month or company changes ───
  useEffect(() => {
    if (!companyId) {
      setEmployees([])
      setAttendanceData([])
      setLoading(false)
      return
    }
    fetchData()
  }, [selectedMonth, companyId])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [empData, attData] = await Promise.all([
        getEmployees(Number(companyId)),
        getMonthlyReport(selectedMonth, Number(companyId))
      ])
      setEmployees(empData || [])
      setAttendanceData(attData || [])
    } catch (err) {
      setError(err.message || 'Failed to load salary data')
    } finally {
      setLoading(false)
    }
  }

  // Combine Employee Data with Attendance Data and Calculate Salary
  const reportData = employees.map(emp => {
    const attRecord = attendanceData.find(a => a.employee_id === emp.id)
    const workingDays = attRecord ? attRecord.total_working_days : 0
    
    const baseSalary = emp.salary || 0
    const perDaySalary = baseSalary / 30
    const calculatedSalary = perDaySalary * workingDays
    
    return {
      ...emp,
      workingDays,
      baseSalary,
      perDaySalary,
      calculatedSalary
    }
  })

  // Search Filter
  const filteredData = reportData.filter(e => {
    const q = search.toLowerCase()
    return !q || 
      (e.first_name || '').toLowerCase().includes(q) || 
      (e.last_name || '').toLowerCase().includes(q) || 
      (e.employee_code || '').toLowerCase().includes(q) ||
      (e.department || '').toLowerCase().includes(q)
  })

  // Summary Stats
  const totalPayout = filteredData.reduce((sum, e) => sum + e.calculatedSalary, 0)
  const totalBaseSalary = filteredData.reduce((sum, e) => sum + e.baseSalary, 0)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(value)
  }

  // ─── GUARD: NO COMPANY SELECTED ───
  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">No Company Selected</h3>
        <p className="text-sm text-gray-500 text-center max-w-md">Please select a company to view salary reports.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Company Badge */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-primary-500" />
          Salary Report
        </h2>
        {/* ─── COMPANY BADGE ─── */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
          <Store className="w-3.5 h-3.5 text-primary-500" />
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">{companyName}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, code, or department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-8 w-64"
            />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="input-field pl-8 w-48"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Employees</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredData.length}</p>
          <p className="text-xs text-gray-400 mt-1">Active & on payroll</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Base Salary</span>
            <IndianRupee className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{formatCurrency(totalBaseSalary)}</p>
          <p className="text-xs text-gray-400 mt-1">If 30 working days</p>
        </div>

        <div className="card p-5 border-l-4 border-primary-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Calculated Payout</span>
            <IndianRupee className="w-5 h-5 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(totalPayout)}</p>
          <p className="text-xs text-gray-400 mt-1">For {selectedMonth}</p>
        </div>
      </div>

      {/* Salary Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                <th className="table-header text-left">Employee</th>
                <th className="table-header text-left">Code / Dept</th>
                <th className="table-header text-left">Designation</th>
                <th className="table-header text-right">Base Salary (₹)</th>
                <th className="table-header text-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">Working Days</th>
                <th className="table-header text-right bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400">Calculated Salary (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" /></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">No employees found</td></tr>
              ) : filteredData.map(emp => (
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
                  <td className="table-cell text-sm text-gray-600 dark:text-gray-300">{emp.designation || '—'}</td>
                  <td className="table-cell text-sm font-medium text-gray-800 dark:text-gray-200 text-right">
                    {formatCurrency(emp.baseSalary)}
                  </td>
                  <td className="table-cell text-center font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">
                    {emp.workingDays}
                    <span className="text-[10px] font-normal text-gray-400 ml-1">days</span>
                  </td>
                  <td className="table-cell text-right font-bold text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/10">
                    {formatCurrency(emp.calculatedSalary)}
                  </td>
                </tr>
              ))}
            </tbody>
            
            {/* Footer Totals */}
            {!loading && filteredData.length > 0 && (
              <tfoot className="bg-gray-50 dark:bg-gray-800/30 border-t-2 border-gray-200 dark:border-gray-700">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 text-right">Grand Total:</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-100 text-right">{formatCurrency(totalBaseSalary)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400 text-center bg-blue-50 dark:bg-blue-900/20">
                    —
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-primary-600 dark:text-primary-400 text-right bg-primary-50 dark:bg-primary-900/20">
                    {formatCurrency(totalPayout)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}