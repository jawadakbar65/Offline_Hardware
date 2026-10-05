import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppContext } from './storeContext'
import { isSupabaseConfigured, supabase } from '../services/supabaseClient'

const STORAGE_KEY = 'hardware-store-demo-v1'
const DEFAULT_ADMIN_NAME = 'jawadali'
const DEFAULT_ADMIN_EMAIL = 'jawadali@hardware.local'
const DEFAULT_ADMIN_HASH = '30b8893ececa1085ee0aeb42356a25f0c419becc44c50e9f4e5028481f074491' // sha256('jawad321')
const LEGACY_ADMIN_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' // sha256('admin123')

const currencyFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
})

const productSeed = [
  {
    id: 'prod-001',
    name: 'Cement Bag 50kg',
    sku: 'CEM-50',
    barcode: '890123456001',
    category: 'Cement, sand, and construction materials',
    brand: 'Maple Cement',
    description: 'High-strength cement suitable for construction and masonry work.',
    unit: 'bag',
    purchasePrice: 1350,
    sellingPrice: 1650,
    wholesalePrice: 1580,
    stockQty: 24,
    minStock: 8,
    location: 'A-01',
    supplierId: 'sup-001',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    createdAt: '2025-09-15',
    updatedAt: '2026-10-01',
    archived: false,
  },
  {
    id: 'prod-002',
    name: 'Hex Head Bolt M10 x 50',
    sku: 'BOLT-M10-50',
    barcode: '890123456002',
    category: 'Nails, screws, bolts, and nuts',
    brand: 'FastFix',
    description: 'Industrial-grade hex head bolt with strong grip and corrosion resistance.',
    unit: 'box',
    purchasePrice: 220,
    sellingPrice: 290,
    wholesalePrice: 260,
    stockQty: 42,
    minStock: 15,
    location: 'B-02',
    supplierId: 'sup-002',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80',
    createdAt: '2025-09-18',
    updatedAt: '2026-10-01',
    archived: false,
  },
  {
    id: 'prod-003',
    name: 'Heavy Duty Drill Machine',
    sku: 'DRILL-HD-12',
    barcode: '890123456003',
    category: 'Power tools and accessories',
    brand: 'PowerCore',
    description: 'Corded heavy-duty drill with variable speed and impact driver compatibility.',
    unit: 'piece',
    purchasePrice: 18000,
    sellingPrice: 24500,
    wholesalePrice: 22800,
    stockQty: 6,
    minStock: 3,
    location: 'C-04',
    supplierId: 'sup-003',
    image: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f7?auto=format&fit=crop&w=600&q=80',
    createdAt: '2025-09-22',
    updatedAt: '2026-10-01',
    archived: false,
  },
  {
    id: 'prod-004',
    name: 'PVC Pipe 1 Inch',
    sku: 'PIPE-PVC-1',
    barcode: '890123456004',
    category: 'Pipes, fittings, and valves',
    brand: 'FlowGuard',
    description: 'Premium PVC pipe for drainage and water installation.',
    unit: 'meter',
    purchasePrice: 120,
    sellingPrice: 170,
    wholesalePrice: 150,
    stockQty: 0,
    minStock: 12,
    location: 'D-01',
    supplierId: 'sup-004',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80',
    createdAt: '2025-08-11',
    updatedAt: '2026-09-20',
    archived: false,
  },
]

const customersSeed = [
  { id: 'cus-001', name: 'Ahsan Builders', phone: '0300-1234567', address: 'Lahore', email: 'ahsan@builders.com', type: 'contractor', creditLimit: 150000, openingBalance: 0, currentBalance: 42000, totalPurchases: 235000 },
  { id: 'cus-002', name: 'Bilal Hardware Mart', phone: '0321-7654321', address: 'Karachi', email: 'bilal@mart.pk', type: 'wholesale', creditLimit: 200000, openingBalance: 0, currentBalance: 18000, totalPurchases: 98000 },
  { id: 'cus-003', name: 'Niaz Family Store', phone: '0312-9088766', address: 'Islamabad', email: 'niaz.store@gmail.com', type: 'retail', creditLimit: 50000, openingBalance: 10000, currentBalance: 5000, totalPurchases: 68000 },
]

const suppliersSeed = [
  { id: 'sup-001', businessName: 'Lahore Building Supply', contactPerson: 'Mr. Karim', phone: '0300-4455667', address: 'Lahore', email: 'karim@building.pk', registrationNumber: 'REG-1001', openingBalance: 0, payableBalance: 45000, totalPurchases: 210000 },
  { id: 'sup-002', businessName: 'FastFix Tools', contactPerson: 'Ms. Neelam', phone: '0311-7788990', address: 'Faisalabad', email: 'sales@fastfix.pk', registrationNumber: 'REG-1002', openingBalance: 12000, payableBalance: 12500, totalPurchases: 168000 },
  { id: 'sup-003', businessName: 'PowerCore Imports', contactPerson: 'Mr. Hassan', phone: '0345-5566778', address: 'Karachi', email: 'hassan@powercore.com', registrationNumber: 'REG-1003', openingBalance: 0, payableBalance: 62000, totalPurchases: 305000 },
  { id: 'sup-004', businessName: 'FlowGuard Pipes', contactPerson: 'Ali Raza', phone: '0333-1122334', address: 'Rawalpindi', email: 'ali@flowguard.pk', registrationNumber: 'REG-1004', openingBalance: 15000, payableBalance: 35000, totalPurchases: 145000 },
]

const salesSeed = [
  { id: 'sale-001', invoiceNumber: 'INV-1001', date: '2026-10-02', customerId: 'cus-001', customerName: 'Ahsan Builders', items: [{ productId: 'prod-001', name: 'Cement Bag 50kg', quantity: 8, unitPrice: 1650, discount: 0 }], subtotal: 13200, tax: 0, discount: 0, total: 13200, amountPaid: 10000, outstanding: 3200, paymentMethod: 'Bank Transfer', status: 'partial', notes: 'Deposit on account' },
  { id: 'sale-002', invoiceNumber: 'INV-1002', date: '2026-10-02', customerId: 'cus-003', customerName: 'Niaz Family Store', items: [{ productId: 'prod-002', name: 'Hex Head Bolt M10 x 50', quantity: 20, unitPrice: 290, discount: 0 }], subtotal: 5800, tax: 0, discount: 200, total: 5600, amountPaid: 5600, outstanding: 0, paymentMethod: 'Cash', status: 'paid', notes: 'Retail sale' },
]

const purchasesSeed = [
  { id: 'purch-001', reference: 'PO-2001', date: '2026-10-01', supplierId: 'sup-001', supplierName: 'Lahore Building Supply', items: [{ productId: 'prod-001', name: 'Cement Bag 50kg', quantity: 30, unitCost: 1350 }], total: 40500, amountPaid: 25000, outstanding: 15500, status: 'partial' },
  { id: 'purch-002', reference: 'PO-2002', date: '2026-10-02', supplierId: 'sup-003', supplierName: 'PowerCore Imports', items: [{ productId: 'prod-003', name: 'Heavy Duty Drill Machine', quantity: 4, unitCost: 18000 }], total: 72000, amountPaid: 72000, outstanding: 0, status: 'paid' },
]

const expensesSeed = [
  { id: 'exp-001', category: 'Electricity and utilities', amount: 12500, date: '2026-10-02', description: 'Monthly electricity bill', paymentMethod: 'Bank Transfer', reference: 'ELEC-1021', recordedBy: 'admin@hardware.local' },
  { id: 'exp-002', category: 'Transportation and delivery', amount: 6800, date: '2026-10-02', description: 'Supplier delivery charges', paymentMethod: 'Cash', reference: 'DEL-870', recordedBy: 'manager@hardware.local' },
]

const paymentSeed = [
  { id: 'pay-001', type: 'customer', amount: 10000, date: '2026-10-02', method: 'Bank Transfer', reference: 'RCPT-1001', linkedId: 'sale-001' },
  { id: 'pay-002', type: 'supplier', amount: 25000, date: '2026-10-01', method: 'Bank Transfer', reference: 'VOUCH-2001', linkedId: 'purch-001' },
]

const auditSeed = [
  { id: 'audit-001', action: 'Created store setup', user: 'admin@hardware.local', time: '2026-10-01T09:00:00Z' },
  { id: 'audit-002', action: 'Received new cement order', user: 'manager@hardware.local', time: '2026-10-01T14:20:00Z' },
]

const makeInitialState = () => ({
  store: {
    name: 'Hardware Hub Pro',
    address: 'Main GT Road, Lahore',
    phone: '+92 300 1234567',
    currency: 'PKR',
    taxRate: 0.12,
    invoiceFooter: 'Thank you for shopping with Hardware Hub Pro.',
    lowStockThreshold: 10,
    theme: 'dark',
  },
  products: productSeed,
  customers: customersSeed,
  suppliers: suppliersSeed,
  sales: salesSeed,
  purchases: purchasesSeed,
  expenses: expensesSeed,
  payments: paymentSeed,
  auditLog: auditSeed,
  users: [
    { id: 'user-admin', name: DEFAULT_ADMIN_NAME, email: DEFAULT_ADMIN_EMAIL, role: 'Administrator', passwordHash: DEFAULT_ADMIN_HASH },
    { id: 'user-manager', name: 'Manager User', email: 'manager@hardware.local', role: 'Manager', passwordHash: '866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5' },
    { id: 'user-sales', name: 'Sales User', email: 'sales@hardware.local', role: 'Salesperson', passwordHash: '6bc0a63cb29c92306020c0a6bbc358cc4628db277dc06e253535e126517ad637' },
  ],
})

// One-time migration: previously stored admin accounts still using the
// default password get the new default credentials (jawadali / jawad321).
const migrateAdminCredentials = (users) =>
  users.map((user) =>
    user.id === 'user-admin' && user.passwordHash === LEGACY_ADMIN_HASH
      ? { ...user, name: DEFAULT_ADMIN_NAME, email: DEFAULT_ADMIN_EMAIL, passwordHash: DEFAULT_ADMIN_HASH }
      : user,
  )

const loadPersistedState = () => {
  const seed = makeInitialState()

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return seed

    const parsed = JSON.parse(saved)
    return {
      ...seed,
      ...parsed,
      store: { ...seed.store, ...(parsed.store || {}) },
      products: Array.isArray(parsed.products) ? parsed.products : seed.products,
      customers: Array.isArray(parsed.customers) ? parsed.customers : seed.customers,
      suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : seed.suppliers,
      sales: Array.isArray(parsed.sales) ? parsed.sales : seed.sales,
      purchases: Array.isArray(parsed.purchases) ? parsed.purchases : seed.purchases,
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : seed.expenses,
      payments: Array.isArray(parsed.payments) ? parsed.payments : seed.payments,
      users: migrateAdminCredentials(Array.isArray(parsed.users) ? parsed.users : seed.users),
      auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : seed.auditLog,
    }
  } catch {
    return seed
  }
}

const hashPassword = async (value) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function AppProvider({ children }) {
  const [state, setState] = useState(loadPersistedState)
  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem('hardware-auth-user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    document.documentElement.dataset.theme = state.store.theme === 'light' ? 'light' : 'dark'
  }, [state.store.theme])

  const persistState = (updater) => {
    setState((previousState) => {
      const nextState = typeof updater === 'function' ? updater(previousState) : updater
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
      return nextState
    })
  }

  const login = useCallback(async (identifier, password) => {
    const needle = String(identifier || '').trim().toLowerCase()
    const savedUser = state.users.find(
      (user) => user.email.toLowerCase() === needle || user.name.toLowerCase() === needle,
    )
    if (!savedUser) return { ok: false, message: 'User not found.' }

    const passwordHash = await hashPassword(password)
    if (savedUser.passwordHash !== passwordHash) {
      return { ok: false, message: 'Invalid password.' }
    }

    const normalizedUser = {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
    }

    setAuthUser(normalizedUser)
    localStorage.setItem('hardware-auth-user', JSON.stringify(normalizedUser))
    return { ok: true, user: normalizedUser }
  }, [state.users])

  const logout = useCallback(() => {
    setAuthUser(null)
    localStorage.removeItem('hardware-auth-user')
  }, [])

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!authUser) return { ok: false, message: 'Not signed in.' }
      if (!newPassword || String(newPassword).length < 6) {
        return { ok: false, message: 'New password must be at least 6 characters.' }
      }

      const currentHash = await hashPassword(currentPassword)
      const storedUser = state.users.find((user) => user.id === authUser.id)
      if (!storedUser || storedUser.passwordHash !== currentHash) {
        return { ok: false, message: 'Current password is incorrect.' }
      }

      const nextHash = await hashPassword(newPassword)
      persistState((previousState) => ({
        ...previousState,
        users: previousState.users.map((user) =>
          user.id === authUser.id ? { ...user, passwordHash: nextHash } : user,
        ),
        auditLog: [
          {
            id: `audit-${Date.now()}`,
            action: 'Changed account password',
            user: authUser.email,
            time: new Date().toISOString(),
          },
          ...previousState.auditLog,
        ],
      }))
      return { ok: true, message: 'Password updated successfully.' }
    },
    [authUser, state.users],
  )

  const updateProfile = useCallback(
    (updates) => {
      if (!authUser) return { ok: false, message: 'Not signed in.' }

      const name = String(updates.name || '').trim()
      const email = String(updates.email || '').trim()
      if (!name) return { ok: false, message: 'Name cannot be empty.' }
      if (!email) return { ok: false, message: 'Email cannot be empty.' }

      const emailTaken = state.users.some(
        (user) => user.id !== authUser.id && user.email.toLowerCase() === email.toLowerCase(),
      )
      if (emailTaken) return { ok: false, message: 'That email is already used by another user.' }

      const nextUser = { ...authUser, name, email }
      persistState((previousState) => ({
        ...previousState,
        users: previousState.users.map((user) =>
          user.id === authUser.id ? { ...user, name, email } : user,
        ),
      }))
      setAuthUser(nextUser)
      localStorage.setItem('hardware-auth-user', JSON.stringify(nextUser))
      return { ok: true, message: 'Profile updated.' }
    },
    [authUser, state.users],
  )

  const value = useMemo(() => ({
    state,
    authUser,
    login,
    logout,
    changePassword,
    updateProfile,
    saveState: persistState,
    formatCurrency: (value) => currencyFormatter.format(value || 0),
    hasSupabase: isSupabaseConfigured,
    supabase,
    canUseDemoMode: !isSupabaseConfigured,
    addProduct: (product) => {
      persistState((previousState) => ({
        ...previousState,
        products: [product, ...previousState.products],
      }))
    },
    updateProduct: (productId, updates) => {
      persistState((previousState) => ({
        ...previousState,
        products: previousState.products.map((product) => (product.id === productId ? { ...product, ...updates, updatedAt: new Date().toISOString().slice(0, 10) } : product)),
      }))
    },
    addSale: (sale) => {
      persistState((previousState) => ({
        ...previousState,
        sales: [sale, ...previousState.sales],
      }))
    },
    addPurchase: (purchase) => {
      persistState((previousState) => ({
        ...previousState,
        purchases: [purchase, ...previousState.purchases],
      }))
    },
    addExpense: (expense) => {
      persistState((previousState) => ({
        ...previousState,
        expenses: [expense, ...previousState.expenses],
      }))
    },
    addCustomer: (customer) => {
      persistState((previousState) => ({
        ...previousState,
        customers: [customer, ...previousState.customers],
      }))
    },
    addSupplier: (supplier) => {
      persistState((previousState) => ({
        ...previousState,
        suppliers: [supplier, ...previousState.suppliers],
      }))
    },
  }), [authUser, changePassword, login, logout, state, updateProfile])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
