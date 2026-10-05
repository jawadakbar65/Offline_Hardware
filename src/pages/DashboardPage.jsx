import { ArrowDownRight, ArrowUpRight, CreditCard, PackageCheck, ShoppingBag, TrendingUp, Warehouse } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useHardwareStore } from '../context/useHardwareStore'

const getTodayKey = () => new Date().toISOString().slice(0, 10)

export default function DashboardPage() {
  const { state, formatCurrency } = useHardwareStore()
  const navigate = useNavigate()

  const products = state.products
  const sales = state.sales
  const purchases = state.purchases
  const expenses = state.expenses
  const customers = state.customers
  const suppliers = state.suppliers
  const todayKey = getTodayKey()

  const totalInventoryValue = products.reduce((sum, product) => sum + product.stockQty * product.purchasePrice, 0)
  const totalProducts = products.length
  const todaySales = sales.filter((item) => item.date === todayKey).reduce((sum, item) => sum + item.total, 0)
  const todayPurchases = purchases.filter((item) => item.date === todayKey).reduce((sum, item) => sum + item.total, 0)
  const todayExpenses = expenses.filter((item) => item.date === todayKey).reduce((sum, item) => sum + item.amount, 0)
  const customerDebt = customers.reduce((sum, customer) => sum + Number(customer.currentBalance || customer.openingBalance || 0), 0)
  const supplierDebt = suppliers.reduce((sum, supplier) => sum + Number(supplier.payableBalance || 0), 0)
  const lowStock = products.filter((product) => product.stockQty <= product.minStock)
  const outOfStock = products.filter((product) => product.stockQty === 0)

  const monthlyData = [
    { month: 'Jan', sales: 250000, profit: 71000 },
    { month: 'Feb', sales: 280000, profit: 83000 },
    { month: 'Mar', sales: 320000, profit: 96000 },
    { month: 'Apr', sales: 300000, profit: 89000 },
    { month: 'May', sales: 360000, profit: 118000 },
    { month: 'Jun', sales: 430000, profit: 135000 },
  ]

  const topProducts = products
    .map((product) => {
      const sold = sales.reduce((count, sale) => {
        const totalUnits = sale.items.reduce((sum, item) => (item.productId === product.id ? sum + item.quantity : sum), 0)
        return count + totalUnits
      }, 0)

      return { ...product, sold }
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4)

  const statCards = [
    { label: 'Total Products', value: totalProducts, icon: PackageCheck, badge: '+8% vs last month', trend: 'up' },
    { label: 'Inventory Value', value: formatCurrency(totalInventoryValue), icon: Warehouse, badge: 'Stocked', trend: 'up' },
    { label: 'Today Sales', value: formatCurrency(todaySales), icon: ShoppingBag, badge: 'Cash + credit', trend: 'up' },
    { label: 'Today Purchases', value: formatCurrency(todayPurchases), icon: ArrowDownRight, badge: 'Received goods', trend: 'down' },
    { label: 'Today Expenses', value: formatCurrency(todayExpenses), icon: CreditCard, badge: 'Operating', trend: 'down' },
    { label: 'Outstanding Receivables', value: formatCurrency(customerDebt), icon: TrendingUp, badge: 'Customer balances', trend: 'up' },
    { label: 'Outstanding Payables', value: formatCurrency(supplierDebt), icon: ArrowUpRight, badge: 'Supplier balances', trend: 'down' },
  ]

  return (
    <div className="page-stack">
      <section className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, badge, trend }) => (
          <article key={label} className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">
                <Icon size={18} />
              </div>
              <span className={`trend-badge ${trend}`}>{badge}</span>
            </div>
            <h3>{value}</h3>
            <p>{label}</p>
          </article>
        ))}
      </section>

      <section className="two-column panel-grid">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Monthly sales and profit</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="sales" stroke="#f59e0b" fill="url(#salesFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Top-selling products</h3>
          </div>
          <div className="list-stack">
            {topProducts.map((product) => (
              <div key={product.id} className="list-row">
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.category}</small>
                </div>
                <div className="list-amount">
                  <span>{product.sold} sold</span>
                  <strong>{formatCurrency(product.sellingPrice * product.sold)}</strong>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="three-column panel-grid">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Low-stock alerts</h3>
          </div>
          <div className="list-stack compact">
            {lowStock.length ? lowStock.slice(0, 4).map((product) => (
              <div key={product.id} className="list-row warning">
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.location}</small>
                </div>
                <span>{product.stockQty} left</span>
              </div>
            )) : <p className="empty-copy">No low-stock items.</p>}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Out-of-stock</h3>
          </div>
          <div className="list-stack compact">
            {outOfStock.length ? outOfStock.slice(0, 4).map((product) => (
              <div key={product.id} className="list-row error">
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.sku}</small>
                </div>
                <span>0 stock</span>
              </div>
            )) : <p className="empty-copy">All products are stocked.</p>}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Quick actions</h3>
          </div>
          <div className="quick-actions">
            <button type="button" className="primary-button" onClick={() => navigate('/sales')}>New Sale</button>
            <button type="button" className="secondary-button" onClick={() => navigate('/products')}>Add Product</button>
            <button type="button" className="secondary-button" onClick={() => navigate('/purchases')}>New Purchase</button>
            <button type="button" className="secondary-button" onClick={() => navigate('/customers')}>Add Customer</button>
          </div>
        </article>
      </section>

      <section className="two-column panel-grid">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Recent sales</h3>
          </div>
          <div className="list-stack compact">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="list-row">
                <div>
                  <strong>{sale.invoiceNumber}</strong>
                  <small>{sale.customerName}</small>
                </div>
                <div className="list-amount">
                  <span>{sale.status}</span>
                  <strong>{formatCurrency(sale.total)}</strong>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Recent purchases</h3>
          </div>
          <div className="list-stack compact">
            {purchases.slice(0, 5).map((purchase) => (
              <div key={purchase.id} className="list-row">
                <div>
                  <strong>{purchase.reference}</strong>
                  <small>{purchase.supplierName}</small>
                </div>
                <div className="list-amount">
                  <span>{purchase.status}</span>
                  <strong>{formatCurrency(purchase.total)}</strong>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Sales trend</h3>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="sales" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
