import { useHardwareStore } from '../context/useHardwareStore'

export default function SettingsPage() {
  const { state } = useHardwareStore()

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-header">
          <h3>Store configuration</h3>
        </div>

        <div className="stack-form">
          <div className="field-row">
            <label>
              Store name
              <input value={state.store.name} readOnly />
            </label>
            <label>
              Currency
              <input value={state.store.currency} readOnly />
            </label>
          </div>
          <div className="field-row">
            <label>
              Address
              <input value={state.store.address} readOnly />
            </label>
            <label>
              Phone
              <input value={state.store.phone} readOnly />
            </label>
          </div>
          <div className="field-row">
            <label>
              Tax rate
              <input value={state.store.taxRate} readOnly />
            </label>
            <label>
              Low stock threshold
              <input value={state.store.lowStockThreshold} readOnly />
            </label>
          </div>
        </div>
      </section>
    </div>
  )
}
