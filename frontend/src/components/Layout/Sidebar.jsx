import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ChartBar as BarChart3,
  Truck,
  ShoppingBag,
  LogOut,
  Wine,
  X,
  ChevronRight,
ChevronDown,
  Users,
  Settings,
  Receipt,
  FileText,
  Building2 // Added for Switch Company button
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

export default function Sidebar({ open, onClose }) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // State to hold the currently selected company ID for the Dashboard link
  const [currentCompanyId, setCurrentCompanyId] = useState(null)
  const [openMenus, setOpenMenus] = useState({
  pos: false,
})

  // Load the company ID from localStorage when the sidebar mounts or route changes
  useEffect(() => {
    const stored = localStorage.getItem('selectedCompany')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCurrentCompanyId(parsed.id)
      } catch (e) {
        console.error("Failed to parse selected company", e)
      }
    }
  }, [location.pathname]) // Re-check on route change to keep it sync

  // Define navItems inside the component so we can use the dynamic companyId
  const navItems = [
    { to: currentCompanyId ? `/dashboard/${currentCompanyId}` : '/', icon: LayoutDashboard, label: 'Dashboard' },
    // { to: '/pos', icon: ShoppingCart, label: 'POS Billing' },
    {
  label: 'POS Billing',
  icon: ShoppingCart,
  key: 'pos',
  children: [
    { to: '/pos', label: ' Counter' },
    { to: '/pos-godown', label: 'Godown' },
  ],
}, { to: '/purchases', icon: ShoppingBag, label: 'Purchase' },
 { to: '/purchase-report', icon: FileText, label: 'Purchase Report' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/inventory-report', icon: FileText, label: 'Inventory Report' },
   
    
    { to: '/stock-transfer', icon: Truck, label: 'Stock Transfer' },
    { to: '/stock-transfer-report', icon: FileText, label: 'Stock Transfer Report' },

    { to: '/reports', icon: BarChart3, label: 'Sales Reports' },
    { to: '/excise-register', icon: FileText, label: 'Excise Register' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/employee-attendance', icon: Users, label: 'Employee Attendance' },
    { to: '/attendance-reports', icon: FileText, label: 'Attendance Reports' },
    { to: '/suppliers', icon: Truck, label: 'Supplier' },
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/salary-report', icon: FileText, label: 'Salary Report' }
  ]

  const handleSignOut = async () => {
    await signOut()
    localStorage.removeItem('selectedCompany') // Clean up on sign out
    navigate('/login')
  }

  const handleSwitchCompany = () => {
    localStorage.removeItem('selectedCompany') // Clear the selected company
    navigate('/companies') // Go back to the standalone companies page
    onClose() // Close the mobile sidebar if open
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-40 h-full w-40 flex flex-col',
          'bg-gray-900 dark:bg-gray-950 border-r border-gray-800',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-0.5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Wine className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">IMFL Billing</p>
              <p className="text-gray-400 text-xs">Liquor Retail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-gray-200 text-xs font-medium truncate">{user?.email || 'Admin'}</p>
              <p className="text-gray-500 text-xs">Store Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
  const Icon = item.icon

  // SUBMENU
  if (item.children) {
    return (
      <div key={item.label}>
        <button
          onClick={() =>
            setOpenMenus((prev) => ({
              ...prev,
              [item.key]: !prev[item.key],
            }))
          }
          className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-all duration-150"
        >
          <Icon className="w-4 h-4 flex-shrink-0" />

          <span className="flex-1 text-left font-medium">
            {item.label}
          </span>

          <ChevronDown
            className={clsx(
              "w-4 h-4 transition-transform",
              openMenus[item.key] && "rotate-180"
            )}
          />
        </button>

        {openMenus[item.key] && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children.map((sub) => (
              <NavLink
                key={sub.to}
                to={sub.to}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-150",
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                  )
                }
              >
                {sub.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  // NORMAL MENU
  return (
    <NavLink
      key={item.label}
      to={item.to}
      end={item.to?.startsWith('/dashboard')}
      onClick={onClose}
      className={({ isActive }) =>
        clsx(
          'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
          isActive
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 font-medium">{item.label}</span>
          {isActive && (
            <ChevronRight className="w-3.5 h-3.5 opacity-70" />
          )}
        </>
      )}
    </NavLink>
  )
})}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-4 border-t border-gray-800 pt-3 space-y-1">
          
          {/* Switch Company Button */}
          <button
            onClick={handleSwitchCompany}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-amber-900/20 hover:text-amber-400 transition-all duration-150"
          >
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">Switch Company</span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}