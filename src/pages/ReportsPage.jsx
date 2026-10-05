import { useHardwareStore } from '../context/useHardwareStore'

export default function ReportsPage() {
  const { state, formatCurrency } = useHardwareStore()

  const salesRevenue = state.sales.reduce((sum, sale) => sum + sale.total, 0)
  const costOfGoods = state.purchases.reduce((sum, purchase) => sum + purchase.total, 0)
  const grossProfit = salesRevenue - costOfGoods

  return (
    <div className="page-stack">
      <section className="stats-grid compact-grid">
        <article className="stat-card">
          <h3>{formatCurrency(salesRevenue)}</h3>
          <p>Gross sales</p>
        </article>
        <article className="stat-card">
          <h3>{formatCurrency(costOfGoods)}</h3>
          <p>Cost of goods</p>
        </article>
        <article className="stat-card">
          <h3>{formatCurrency(grossProfit)}</h3>
          <p>Gross profit</p>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Report summary</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Daily sales</td><td>{formatCurrency(state.sales.reduce((sum, item) => sum + item.total, 0))}</td></tr>
              <tr><td>Low-stock count</td><td>{state.products.filter((product) => product.stockQty <= product.minStock).length}</td></tr>
              <tr><td>Out-of-stock count</td><td>{state.products.filter((product) => product.stockQty === 0).length}</td></tr>
              <tr><td>Customer balances</td><td>{formatCurrency(state.customers.reduce((sum, customer) => sum + Number(customer.currentBalance || 0), 0))}</td></tr>
              <tr><td>Supplier balances</td><td>{formatCurrency(state.suppliers.reduce((sum, supplier) => sum + Number(supplier.payableBalance || 0), 0))}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
