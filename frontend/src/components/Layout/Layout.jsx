import { useState, useEffect } from 'react'
import { useLocation, Outlet } from 'react-router-dom' // <-- Import Outlet here
import Sidebar from './Sidebar'
import Header from './Header'

const pageTitles = {
  '/companies': 'Company Management',
  '/pos': 'POS Billing',
  '/inventory': 'Inventory',
  '/purchases': 'Purchase Entry',
  '/suppliers': 'Supplier Management',
  '/reports': 'Sales Reports',
  '/employees': 'Employees',
  '/expenses': 'Expenses',
  '/excise-register': 'Excise Register',
}

export default function Layout() { // Removed { children } prop
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Handle dynamic dashboard route title
  let title = pageTitles[location.pathname]
  if (location.pathname.startsWith('/dashboard')) {
    title = 'Dashboard'
  }
  if (!title) title = 'IMFL Billing'

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          title={title}
        />
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 lg:p-6">
          {/* Replace {children} with <Outlet /> */}
          <Outlet /> 
        </main>
      </div>
    </div>
  )
}