import { useState } from 'react'
import { useHardwareStore } from '../context/useHardwareStore'

const emptyExpenseForm = {
  category: 'Shop rent',
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  description: '',
  paymentMethod: 'Cash',
  reference: '',
}

export default function ExpensesPage() {
  const { state, formatCurrency, addExpense } = useHardwareStore()
  const [form, setForm] = useState(emptyExpenseForm)

  const handleSubmit = (event) => {
    event.preventDefault()

    const newExpense = {
      id: `exp-${Date.now()}`,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      description: form.description,
      paymentMethod: form.paymentMethod,
      reference: form.reference,
      recordedBy: 'admin@hardware.local',
    }

    addExpense(newExpense)
    setForm(emptyExpenseForm)
  }

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-header">
          <h3>Add expense</h3>
        </div>
        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label>
              Category
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                <option value="Shop rent">Shop rent</option>
                <option value="Employee salaries">Employee salaries</option>
                <option value="Electricity and utilities">Electricity and utilities</option>
                <option value="Transportation and delivery">Transportation and delivery</option>
                <option value="Loading and unloading">Loading and unloading</option>
                <option value="Repairs and maintenance">Repairs and maintenance</option>
                <option value="Packaging">Packaging</option>
                <option value="Internet and telephone">Internet and telephone</option>
                <option value="Other expenses">Other expenses</option>
              </select>
            </label>
            <label>
              Amount
              <input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
            </label>
          </div>
          <div className="field-row">
            <label>
              Date
              <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
            </label>
            <label>
              Payment method
              <select value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} />
          </label>
          <div className="field-row">
            <label>
              Reference
              <input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} />
            </label>
            <button type="submit" className="primary-button">Save expense</button>
          </div>
        </form>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Expense register</h3>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Date</th>
                <th>Description</th>
                <th>Method</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {state.expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.category}</td>
                  <td>{expense.date}</td>
                  <td>{expense.description}</td>
                  <td>{expense.paymentMethod}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
