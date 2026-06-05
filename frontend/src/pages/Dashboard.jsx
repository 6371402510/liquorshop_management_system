import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { TrendingUp, ShoppingCart, Package, TriangleAlert as AlertTriangle, IndianRupee, ChartBar as BarChart2, Users, Truck } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalSuppliers: 0,
    monthSales: 0,
  })
  const [dailySales, setDailySales] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [recentSales, setRecentSales] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const today = startOfDay(new Date()).toISOString()
    const monthStart = startOfDay(subDays(new Date(), 30)).toISOString()

    const [todaySalesRes, monthSalesRes, productsRes, suppliersRes, recentRes, lowStockRes] = await Promise.all([
      supabase.from('sales').select('total_amount').gte('created_at', today),
      supabase.from('sales').select('total_amount, created_at').gte('created_at', monthStart),
      supabase.from('products').select('id, stock_quantity, min_stock_level, category'),
      supabase.from('suppliers').select('id').eq('is_active', true),
      supabase.from('sales').select('invoice_number, customer_name, total_amount, payment_mode, created_at').order('created_at', { ascending: false }).limit(6),
      supabase.from('products').select('name, stock_quantity, min_stock_level, category').filter('stock_quantity', 'lte', 'min_stock_level').limit(5),
    ])

    const todayTotal = (todaySalesRes.data || []).reduce((s, r) => s + Number(r.total_amount), 0)
    const monthTotal = (monthSalesRes.data || []).reduce((s, r) => s + Number(r.total_amount), 0)
    const products = productsRes.data || []
    const lowStock = products.filter(p => p.stock_quantity <= p.min_stock_level)

    setStats({
      todaySales: todayTotal,
      todayOrders: (todaySalesRes.data || []).length,
      totalProducts: products.length,
      lowStockCount: lowStock.length,
      totalSuppliers: (suppliersRes.data || []).length,
      monthSales: monthTotal,
    })

    // Daily sales for chart (last 7 days)
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const dayLabel = format(d, 'MMM dd')
      const total = (monthSalesRes.data || [])
        .filter(s => s.created_at?.startsWith(dateStr))
        .reduce((sum, s) => sum + Number(s.total_amount), 0)
      return { date: dayLabel, sales: total }
    })
    setDailySales(last7)

    // Category breakdown
    const catMap = {}
    products.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + 1
    })
    setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })))

    setRecentSales(recentRes.data || [])

    // Low stock - re-fetch with proper filter
    const { data: lowStockData } = await supabase
      .from('products')
      .select('name, stock_quantity, min_stock_level, category')
      .order('stock_quantity', { ascending: true })
      .limit(5)
    const filtered = (lowStockData || []).filter(p => p.stock_quantity <= p.min_stock_level)
    setLowStockItems(filtered)

    setLoading(false)
  }

  const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)

  const statCards = [
    {
      label: "Today's Sales",
      value: `₹${fmt(stats.todaySales)}`,
      icon: IndianRupee,
      color: 'bg-emerald-500',
      sub: `${stats.todayOrders} orders`,
    },
    {
      label: 'Monthly Revenue',
      value: `₹${fmt(stats.monthSales)}`,
      icon: TrendingUp,
      color: 'bg-primary-500',
      sub: 'Last 30 days',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-amber-500',
      sub: `${stats.lowStockCount} low stock`,
    },
    {
      label: 'Suppliers',
      value: stats.totalSuppliers,
      icon: Truck,
      color: 'bg-cyan-500',
      sub: 'Active vendors',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 ">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Sales — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailySales} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-800" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={v => [`₹${fmt(v)}`, 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                paddingAngle={3} dataKey="value">
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Purchase</h3>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {lowStockItems.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">All items well stocked</p>
            ) : lowStockItems.map(p => (
              <div key={p.name} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{p.name}</p>
                  <span className="badge-warning text-xs">{p.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-500">{p.stock_quantity}</p>
                  <p className="text-xs text-gray-400">min: {p.min_stock_level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Recent sales */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Sales</h3>
            <ShoppingCart className="w-4 h-4 text-gray-400" />
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentSales.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">No sales yet</p>
            ) : recentSales.map(s => (
              <div key={s.invoice_number} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.customer_name}</p>
                  <p className="text-xs text-gray-400">{s.invoice_number} · {s.payment_mode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{fmt(s.total_amount)}</p>
                  <p className="text-xs text-gray-400">{format(new Date(s.created_at), 'h:mm a')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Low Stock Alerts</h3>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {lowStockItems.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">All items well stocked</p>
            ) : lowStockItems.map(p => (
              <div key={p.name} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{p.name}</p>
                  <span className="badge-warning text-xs">{p.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-500">{p.stock_quantity}</p>
                  <p className="text-xs text-gray-400">min: {p.min_stock_level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
