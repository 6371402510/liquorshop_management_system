import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Loader2 } from 'lucide-react' // For loading spinner

import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import POSGodown from './pages/POS-godown'
import Inventory from './pages/Inventory'
import Suppliers from './pages/Suppliers'
import Purchases from './pages/Purchases'
import Reports from './pages/Reports'
import WineShopBillingUIDesign from './pages/bill'
import Employees from './pages/Employees'
import Expenses from './pages/Expenses'
import ExciseRegister from './pages/ExciseRegister'
import Companies from './pages/Company.jsx'
import StockTransfer from './pages/StockTransfer.jsx'
import PurchaseReport from './pages/PurcheseReport.jsx'
import InventoryReport from './pages/InventoryReport.jsx'
import StockTransferReport from './pages/StockTransferReport.jsx'
import ExciseReports from './pages/ExciseRegister.jsx'
import EmployeeAttendance from './pages/EmployeeAttendance.jsx'
import AttendanceReports from './pages/AttendanceReports.jsx'
import IFMLDashboard from './pages/IFML.jsx'
import SalaryReport from './pages/SalaryReport.jsx'



// 1. Create a ProtectedRoute component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Show a loading spinner while checking localStorage for the token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  // If there is no user, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If the user is logged in, render the child components
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* === PUBLIC ROUTE === */}
      {/* If user is already logged in and tries to go to /login, redirect them away */}
      <Route path="/login" element={<Login />} />

      {/* === PROTECTED STANDALONE PAGE (No Sidebar) === */}
      <Route 
        path="/companies" 
        element={
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        } 
      />

      {/* === PROTECTED MAIN APP PAGES (With Sidebar & Header) === */}
      {/* Notice we wrap the Layout itself with ProtectedRoute */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard/:companyId" element={<Dashboard />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/pos-godown" element={<POSGodown />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/WineShopBillingUIDesigny" element={<WineShopBillingUIDesign />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/excise-register" element={<ExciseRegister />} />
        <Route path="/stock-transfer" element={<StockTransfer />} />
        <Route path="/purchase-report" element={<PurchaseReport />} />
        <Route path="/inventory-report" element={<InventoryReport />} />
        <Route path="/stock-transfer-report" element={<StockTransferReport />} />
        <Route path="/excise-reports" element={<ExciseReports />} />
        <Route path="/employee-attendance" element={<EmployeeAttendance />} />
        <Route path="/attendance-reports" element={<AttendanceReports />} />
      
        <Route path="/ifml-dashboard" element={<IFMLDashboard />} />
        <Route path="/salary-report" element={<SalaryReport />} />

      </Route>

      {/* === REDIRECTS === */}
      <Route path="/" element={<Navigate to="/companies" replace />} />
      <Route path="*" element={<Navigate to="/companies" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}