import { useState } from 'react'
import { useHardwareStore } from '../context/useHardwareStore'

const emptySupplierForm = {
  businessName: '',
  contactPerson: '',
  phone: '',
  address: '',
  email: '',
  registrationNumber: '',
  openingBalance: 0,
}

export default function SuppliersPage() {
  const { state, addSupplier } = useHardwareStore()
  const [form, setForm] = useState(emptySupplierForm)

  const handleSubmit = (event) => {
    event.preventDefault()

    const newSupplier = {
      id: `sup-${Date.now()}`,
      businessName: form.businessName,
      contactPerson: form.contactPerson,
      phone: form.phone,
      address: form.address,
      email: form.email,
      registrationNumber: form.registrationNumber,
      openingBalance: Number(form.openingBalance),
      payableBalance: Number(form.openingBalance),
      totalPurchases: 0,
    }

    addSupplier(newSupplier)
    setForm(emptySupplierForm)
  }

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-header">
          <h3>Add supplier</h3>
        </div>
        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label>
              Business name
              <input value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} required />
            </label>
            <label>
              Contact person
              <input value={form.contactPerson} onChange={(event) => setForm({ ...form, contactPerson: event.target.value })} required />
            </label>
          </div>
          <div className="field-row">
            <label>
              Phone
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
            </label>
            <label>
              Registration number
              <input value={form.registrationNumber} onChange={(event) => setForm({ ...form, registrationNumber: event.target.value })} />
            </label>
          </div>
          <div className="field-row">
            <label>
              Address
              <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
          </div>
          <div className="field-row">
            <label>
              Opening balance
              <input type="number" value={form.openingBalance} onChange={(event) => setForm({ ...form, openingBalance: event.target.value })} />
            </label>
            <button type="submit" className="primary-button">Save supplier</button>
          </div>
        </form>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Supplier accounts</h3>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Payable</th>
                <th>Purchases</th>
              </tr>
            </thead>
            <tbody>
              {state.suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.businessName}</td>
                  <td>{supplier.contactPerson}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.payableBalance}</td>
                  <td>{supplier.totalPurchases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
