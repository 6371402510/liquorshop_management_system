import { Menu, Sun, Moon, Bell, Search, Building2, ChevronDown } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function Header({ onToggleSidebar, title }) {
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  // ─── COMPANY STATE ───
  const [companyId, setCompanyId] = useState(() => localStorage.getItem('selectedCompanyId') || null)
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('selectedCompanyName') || null)

  // ─── Listen for company changes ───
  useEffect(() => {
    const update = () => {
      const newId = localStorage.getItem('selectedCompanyId') || null
      const newName = localStorage.getItem('selectedCompanyName') || null
      if (newId !== companyId) setCompanyId(newId)
      if (newName !== companyName) setCompanyName(newName)
    }

    window.addEventListener('storage', update)

    // Also poll for same-tab changes
    const interval = setInterval(update, 800)

    return () => {
      window.removeEventListener('storage', update)
      clearInterval(interval)
    }
  }, [companyId, companyName])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/pos?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleCompanyClick = () => {
    navigate('/select-company')
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 px-4 lg:px-6 h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      {/* Hamburger (mobile) */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Hamburger (desktop) */}
      <button
        onClick={onToggleSidebar}
        className="hidden lg:flex p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100 hidden sm:block">
        {title}
      </h1>

      {/* ─── COMPANY BADGE ─── */}
      <button
        onClick={handleCompanyClick}
        className={clsx(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs",
          companyId
            ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 cursor-pointer"
            : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer"
        )}
        title={companyId ? `Switch company from ${companyName}` : 'Select a company'}
      >
        <Building2 className={clsx("w-3.5 h-3.5", companyId ? "text-primary-500" : "text-amber-500")} />
        {companyId ? (
          <>
            <span className="font-semibold text-primary-700 dark:text-primary-300 max-w-[120px] lg:max-w-[200px] truncate">
              {companyName || 'Unknown'}
            </span>
            <ChevronDown className="w-3 h-3 text-primary-400 dark:text-primary-500" />
          </>
        ) : (
          <span className="font-semibold text-amber-700 dark:text-amber-300">Select Company</span>
        )}
      </button>

      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>
      </div>
    </header>
  )
}