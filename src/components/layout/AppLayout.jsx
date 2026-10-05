import { BarChart3, Boxes, CreditCard, LayoutDashboard, Package2, ReceiptText, Settings, ShoppingCart, Truck, Users } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useHardwareStore } from '../../context/useHardwareStore'

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Package2 },
  { label: 'Sales', path: '/sales', icon: ShoppingCart },
  { label: 'Purchases', path: '/purchases', icon: Truck },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Suppliers', path: '/suppliers', icon: CreditCard },
  { label: 'Expenses', path: '/expenses', icon: ReceiptText },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export default function AppLayout() {
  const { authUser, logout } = useHardwareStore()
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-icon">
            <Boxes size={22} />
          </div>
          <div>
            <p className="eyebrow">Hardware</p>
            <h2>Management</h2>
          </div>
        </div>

        <nav className="nav-menu">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{authUser?.name?.[0] || 'A'}</span>
            <div>
              <strong>{authUser?.name || 'Admin'}</strong>
              <small>{authUser?.role || 'Administrator'}</small>
            </div>
          </div>
          <button className="ghost-button" type="button" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operations overview</p>
            <h1>Hardware Store Dashboard</h1>
          </div>

          <div className="topbar-actions">
            <button type="button" className="secondary-button" onClick={() => navigate('/products')}>Search</button>
            <button type="button" className="secondary-button" onClick={() => navigate('/reports')}>Reports</button>
            <button type="button" className="primary-button" onClick={() => navigate('/sales')}>+ New Sale</button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}
