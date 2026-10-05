import { useState } from 'react'
import { useHardwareStore } from '../context/useHardwareStore'

const emptyCustomerForm = {
  name: '',
  phone: '',
  address: '',
  email: '',
  type: 'retail',
  creditLimit: 0,
  openingBalance: 0,
}

export default function CustomersPage() {
  const { state, addCustomer } = useHardwareStore()
  const [form, setForm] = useState(emptyCustomerForm)

  const handleSubmit = (event) => {
    event.preventDefault()

    const newCustomer = {
      id: `cus-${Date.now()}`,
      name: form.name,
      phone: form.phone,
      address: form.address,
      email: form.email,
      type: form.type,
      creditLimit: Number(form.creditLimit),
      openingBalance: Number(form.openingBalance),
      currentBalance: Number(form.openingBalance),
      totalPurchases: 0,
    }

    addCustomer(newCustomer)
    setForm(emptyCustomerForm)
  }

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-header">
          <h3>Add customer</h3>
        </div>
        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
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
              Type
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="contractor">Contractor</option>
              </select>
            </label>
            <label>
              Credit limit
              <input type="number" value={form.creditLimit} onChange={(event) => setForm({ ...form, creditLimit: event.target.value })} />
            </label>
          </div>
          <div className="field-row">
            <label>
              Opening balance
              <input type="number" value={form.openingBalance} onChange={(event) => setForm({ ...form, openingBalance: event.target.value })} />
            </label>
            <button type="submit" className="primary-button">Save customer</button>
          </div>
        </form>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Customer ledger</h3>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Phone</th>
                <th>Credit limit</th>
                <th>Balance</th>
                <th>Total purchases</th>
              </tr>
            </thead>
            <tbody>
              {state.customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.type}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.creditLimit}</td>
                  <td>{customer.currentBalance}</td>
                  <td>{customer.totalPurchases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
