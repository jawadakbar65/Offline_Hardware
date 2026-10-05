import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useHardwareStore } from '../context/useHardwareStore'

const buildPurchaseReference = () => `PO-${Math.floor(Math.random() * 9000 + 1000)}`
const buildPurchaseId = () => `purch-${Date.now()}`
const getCurrentDateKey = () => new Date().toISOString().slice(0, 10)

export default function PurchasesPage() {
  const { state, formatCurrency, addPurchase } = useHardwareStore()
  const [supplierId, setSupplierId] = useState('sup-001')
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([
    { productId: 'prod-001', name: 'Cement Bag 50kg', quantity: 10, unitCost: 1350 },
  ])

  const filteredProducts = useMemo(() => {
    const keyword = query.toLowerCase()
    return state.products.filter((product) => {
      if (!keyword) return true
      return [product.name, product.sku].some((field) => field?.toLowerCase().includes(keyword))
    })
  }, [query, state.products])

  const supplier = state.suppliers.find((item) => item.id === supplierId)
  const total = cart.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.productId === product.id)
      if (existing) {
        return current.map((entry) => (entry.productId === product.id ? { ...entry, quantity: entry.quantity + 1 } : entry))
      }

      return [...current, { productId: product.id, name: product.name, quantity: 1, unitCost: product.purchasePrice }]
    })
  }

  const recordPurchase = () => {
    const purchase = {
      id: buildPurchaseId(),
      reference: buildPurchaseReference(),
      date: getCurrentDateKey(),
      supplierId,
      supplierName: supplier?.businessName || 'Unknown supplier',
      items: cart.map((item) => ({ productId: item.productId, name: item.name, quantity: item.quantity, unitCost: item.unitCost })),
      total,
      amountPaid: 0,
      outstanding: total,
      status: 'pending',
    }

    addPurchase(purchase)
    setCart([])
  }

  return (
    <div className="page-stack">
      <div className="content-grid sales-layout">
        <section className="panel-card">
          <div className="panel-header">
            <h3>Purchase order</h3>
          </div>

          <label>
            Supplier
            <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
              {state.suppliers.map((entry) => (
                <option key={entry.id} value={entry.id}>{entry.businessName}</option>
              ))}
            </select>
          </label>

          <div className="search-box" style={{ marginTop: '1rem' }}>
            <Search size={16} />
            <input type="text" value={query} placeholder="Search product for purchase" onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="catalog-list">
            {filteredProducts.slice(0, 8).map((product) => (
              <button key={product.id} type="button" className="catalog-item" onClick={() => addToCart(product)}>
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.sku}</small>
                </div>
                <span>{formatCurrency(product.purchasePrice)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-header">
            <h3>Received goods</h3>
          </div>

          <div className="cart-list">
            {cart.length ? cart.map((item) => (
              <div key={item.productId} className="cart-row">
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.quantity} x {formatCurrency(item.unitCost)}</small>
                </div>
                <strong>{formatCurrency(item.quantity * item.unitCost)}</strong>
              </div>
            )) : <p className="empty-copy">No items in purchase list.</p>}
          </div>

          <div className="totals-box">
            <div><span>Amount</span><strong>{formatCurrency(total)}</strong></div>
            <div><span>Paid</span><strong>{formatCurrency(0)}</strong></div>
            <div className="grand-total"><span>Balance</span><strong>{formatCurrency(total)}</strong></div>
          </div>

          <button type="button" className="primary-button full-width" onClick={recordPurchase}>Record purchase</button>
        </section>
      </div>
    </div>
  )
}
