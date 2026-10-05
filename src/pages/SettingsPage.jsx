import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useHardwareStore } from '../context/useHardwareStore'

const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export default function SettingsPage() {
  const { state, authUser, saveState, updateProfile, changePassword } = useHardwareStore()

  const [storeForm, setStoreForm] = useState({
    name: state.store.name,
    address: state.store.address,
    phone: state.store.phone,
    currency: state.store.currency,
    taxRate: state.store.taxRate,
    lowStockThreshold: state.store.lowStockThreshold,
    invoiceFooter: state.store.invoiceFooter || '',
  })
  const [storeSaved, setStoreSaved] = useState('')

  const [profileForm, setProfileForm] = useState({
    name: authUser?.name || '',
    email: authUser?.email || '',
  })
  const [profileNote, setProfileNote] = useState(null)

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [passwordNote, setPasswordNote] = useState(null)

  const theme = state.store.theme === 'light' ? 'light' : 'dark'

  const handleStoreChange = (event) => {
    const { name, value } = event.target
    setStoreForm((current) => ({ ...current, [name]: value }))
    setStoreSaved('')
  }

  const handleStoreSave = (event) => {
    event.preventDefault()
    saveState((previousState) => ({
      ...previousState,
      store: {
        ...previousState.store,
        name: storeForm.name.trim() || previousState.store.name,
        address: storeForm.address.trim(),
        phone: storeForm.phone.trim(),
        currency: storeForm.currency.trim() || previousState.store.currency,
        taxRate: Math.min(Math.max(toNumber(storeForm.taxRate, previousState.store.taxRate), 0), 1),
        lowStockThreshold: Math.max(toNumber(storeForm.lowStockThreshold, previousState.store.lowStockThreshold), 0),
        invoiceFooter: storeForm.invoiceFooter,
      },
    }))
    setStoreSaved('Store settings saved.')
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setProfileForm((current) => ({ ...current, [name]: value }))
    setProfileNote(null)
  }

  const handleProfileSave = (event) => {
    event.preventDefault()
    const result = updateProfile(profileForm)
    setProfileNote(result)
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((current) => ({ ...current, [name]: value }))
    setPasswordNote(null)
  }

  const handlePasswordSave = async (event) => {
    event.preventDefault()
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordNote({ ok: false, message: 'New passwords do not match.' })
      return
    }
    const result = await changePassword(passwordForm.current, passwordForm.next)
    setPasswordNote(result)
    if (result.ok) setPasswordForm({ current: '', next: '', confirm: '' })
  }

  const setTheme = (nextTheme) => {
    saveState((previousState) => ({
      ...previousState,
      store: { ...previousState.store, theme: nextTheme },
    }))
  }

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-header">
          <h3>Store configuration</h3>
          {storeSaved ? <span className="status-note success">{storeSaved}</span> : null}
        </div>

        <form className="stack-form" onSubmit={handleStoreSave}>
          <div className="field-row">
            <label>
              Store name
              <input name="name" value={storeForm.name} onChange={handleStoreChange} />
            </label>
            <label>
              Currency
              <input name="currency" value={storeForm.currency} onChange={handleStoreChange} />
            </label>
          </div>
          <div className="field-row">
            <label>
              Address
              <input name="address" value={storeForm.address} onChange={handleStoreChange} />
            </label>
            <label>
              Phone
              <input name="phone" value={storeForm.phone} onChange={handleStoreChange} />
            </label>
          </div>
          <div className="field-row">
            <label>
              Tax rate (0 - 1)
              <input
                name="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={storeForm.taxRate}
                onChange={handleStoreChange}
              />
            </label>
            <label>
              Low stock threshold
              <input
                name="lowStockThreshold"
                type="number"
                step="1"
                min="0"
                value={storeForm.lowStockThreshold}
                onChange={handleStoreChange}
              />
            </label>
          </div>
          <label>
            Invoice footer
            <textarea
              name="invoiceFooter"
              value={storeForm.invoiceFooter}
              onChange={handleStoreChange}
            />
          </label>
          <div className="form-actions">
            <button className="primary-button" type="submit">
              Save store settings
            </button>
          </div>
        </form>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Admin profile</h3>
        </div>

        <form className="stack-form" onSubmit={handleProfileSave}>
          <div className="field-row">
            <label>
              Name
              <input name="name" value={profileForm.name} onChange={handleProfileChange} required />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
            </label>
          </div>
          <label>
            Role
            <input value={authUser?.role || 'Administrator'} readOnly />
          </label>
          {profileNote ? (
            <p className={`status-note ${profileNote.ok ? 'success' : 'error'}`}>{profileNote.message}</p>
          ) : null}
          <div className="form-actions">
            <button className="primary-button" type="submit">
              Save profile
            </button>
          </div>
        </form>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Change password</h3>
        </div>

        <form className="stack-form" onSubmit={handlePasswordSave}>
          <div className="field-row">
            <label>
              Current password
              <input
                type="password"
                name="current"
                autoComplete="current-password"
                value={passwordForm.current}
                onChange={handlePasswordChange}
                required
              />
            </label>
            <label>
              New password
              <input
                type="password"
                name="next"
                autoComplete="new-password"
                value={passwordForm.next}
                onChange={handlePasswordChange}
                required
              />
            </label>
          </div>
          <label>
            Confirm new password
            <input
              type="password"
              name="confirm"
              autoComplete="new-password"
              value={passwordForm.confirm}
              onChange={handlePasswordChange}
              required
            />
          </label>
          {passwordNote ? (
            <p className={`status-note ${passwordNote.ok ? 'success' : 'error'}`}>{passwordNote.message}</p>
          ) : null}
          <div className="form-actions">
            <button className="primary-button" type="submit">
              Update password
            </button>
          </div>
        </form>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Appearance</h3>
        </div>

        <div className="theme-switcher">
          <button
            type="button"
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            <Moon size={16} />
            Dark
          </button>
          <button
            type="button"
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            <Sun size={16} />
            Light
          </button>
        </div>
      </section>
    </div>
  )
}
