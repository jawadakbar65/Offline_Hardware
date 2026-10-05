import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useHardwareStore } from '../context/useHardwareStore'

const buildInvoiceNumber = () => `INV-${Math.floor(Math.random() * 9000 + 1000)}`
const buildSaleId = () => `sale-${Date.now()}`
const getCurrentDateKey = () => new Date().toISOString().slice(0, 10)

export default function SalesPage() {
  const { state, formatCurrency, addSale } = useHardwareStore()
  const [query, setQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('cus-001')
  const [cart, setCart] = useState([
    { productId: 'prod-001', name: 'Cement Bag 50kg', quantity: 2, unitPrice: 1650 },
  ])

  const productCatalog = useMemo(() => {
    const keyword = query.toLowerCase()
    return state.products.filter((product) => {
      if (!keyword) return true
      return [product.name, product.sku, product.barcode].some((field) => field?.toLowerCase().includes(keyword))
    })
  }, [query, state.products])

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const total = subtotal
  const customer = state.customers.find((entry) => entry.id === selectedCustomerId)

  const addToCart = (product) => {
    const existing = cart.find((item) => item.productId === product.id)

    if (existing) {
      setCart((current) => current.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
      return
    }

    setCart((current) => [...current, { productId: product.id, name: product.name, quantity: 1, unitPrice: product.sellingPrice }])
  }

  const finalizeSale = () => {
    const sale = {
      id: buildSaleId(),
      invoiceNumber: buildInvoiceNumber(),
      date: getCurrentDateKey(),
      customerId: selectedCustomerId,
      customerName: customer?.name || 'Walk-in customer',
      items: cart.map((item) => ({ productId: item.productId, name: item.name, quantity: item.quantity, unitPrice: item.unitPrice, discount: 0 })),
      subtotal,
      tax: 0,
      discount: 0,
      total,
      amountPaid: total,
      outstanding: 0,
      paymentMethod: 'Cash',
      status: 'paid',
      notes: 'Retail point-of-sale sale',
    }

    addSale(sale)
    setCart([])
  }

  return (
    <div className="page-stack">
      <div className="content-grid sales-layout">
        <section className="panel-card">
          <div className="panel-header">
            <h3>POS catalog</h3>
          </div>

          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search product by SKU or name" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>

          <div className="catalog-list">
            {productCatalog.slice(0, 8).map((product) => (
              <button key={product.id} type="button" className="catalog-item" onClick={() => addToCart(product)}>
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.sku}</small>
                </div>
                <span>{formatCurrency(product.sellingPrice)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-header">
            <h3>Cart</h3>
          </div>

          <label>
            Customer
            <select value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}>
              {state.customers.map((customerEntry) => (
                <option key={customerEntry.id} value={customerEntry.id}>{customerEntry.name}</option>
              ))}
            </select>
          </label>

          <div className="cart-list">
            {cart.length ? cart.map((item) => (
              <div key={item.productId} className="cart-row">
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.quantity} x {formatCurrency(item.unitPrice)}</small>
                </div>
                <strong>{formatCurrency(item.quantity * item.unitPrice)}</strong>
              </div>
            )) : <p className="empty-copy">No items in cart.</p>}
          </div>

          <div className="totals-box">
            <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div><span>Tax</span><strong>{formatCurrency(0)}</strong></div>
            <div className="grand-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
          </div>

          <button type="button" className="primary-button full-width" onClick={finalizeSale}>Complete sale</button>
        </section>
      </div>
    </div>
  )
}
