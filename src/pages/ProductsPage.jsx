import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PackagePlus, Search } from 'lucide-react'
import { useHardwareStore } from '../context/useHardwareStore'

const buildProductId = () => `prod-${Date.now()}`
const getCurrentDateKey = () => new Date().toISOString().slice(0, 10)

const emptyForm = {
  name: '',
  sku: '',
  barcode: '',
  category: 'Cement, sand, and construction materials',
  brand: '',
  description: '',
  unit: 'piece',
  purchasePrice: 0,
  sellingPrice: 0,
  wholesalePrice: 0,
  stockQty: 0,
  minStock: 0,
  location: '',
  supplierId: 'sup-001',
}

export default function ProductsPage() {
  const { state, formatCurrency, addProduct, updateProduct } = useHardwareStore()
  const [query, setQuery] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ defaultValues: emptyForm })

  const filteredProducts = useMemo(() => {
    const keyword = query.toLowerCase()
    return state.products.filter((product) => {
      if (!keyword) return true
      return [product.name, product.sku, product.barcode, product.category].some((field) => field?.toLowerCase().includes(keyword))
    })
  }, [query, state.products])

  const onSubmit = (values) => {
    const currentDate = getCurrentDateKey()
    const payload = {
      ...values,
      id: selectedProductId || buildProductId(),
      createdAt: selectedProductId ? state.products.find((item) => item.id === selectedProductId)?.createdAt || currentDate : currentDate,
      updatedAt: currentDate,
      archived: false,
      purchasePrice: Number(values.purchasePrice),
      sellingPrice: Number(values.sellingPrice),
      wholesalePrice: Number(values.wholesalePrice),
      stockQty: Number(values.stockQty),
      minStock: Number(values.minStock),
    }

    if (selectedProductId) {
      updateProduct(selectedProductId, payload)
    } else {
      addProduct(payload)
    }

    reset(emptyForm)
    setSelectedProductId('')
  }

  const handleEdit = (product) => {
    setSelectedProductId(product.id)
    Object.entries(product).forEach(([key, value]) => setValue(key, value))
  }

  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input type="text" placeholder="Search products by name or SKU" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            reset(emptyForm)
            setSelectedProductId('')
            document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        >
          <PackagePlus size={16} />
          Add product
        </button>
      </div>

      <div className="content-grid">
        <section className="panel-card form-panel">
          <div className="panel-header">
            <h3>{selectedProductId ? 'Edit product' : 'New product'}</h3>
          </div>

          <form id="product-form" className="stack-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="field-row">
              <label>
                Product name
                <input {...register('name', { required: 'Required' })} />
                {errors.name && <small>{errors.name.message}</small>}
              </label>
              <label>
                SKU
                <input {...register('sku', { required: 'Required' })} />
              </label>
            </div>

            <div className="field-row">
              <label>
                Barcode
                <input {...register('barcode')} />
              </label>
              <label>
                Category
                <select {...register('category')}>
                  <option value="Cement, sand, and construction materials">Cement, sand, and construction materials</option>
                  <option value="Nails, screws, bolts, and nuts">Nails, screws, bolts, and nuts</option>
                  <option value="Hand tools">Hand tools</option>
                  <option value="Power tools and accessories">Power tools and accessories</option>
                  <option value="Plumbing materials">Plumbing materials</option>
                  <option value="Electrical supplies">Electrical supplies</option>
                  <option value="Paint, brushes, and accessories">Paint, brushes, and accessories</option>
                  <option value="Locks, hinges, and door fittings">Locks, hinges, and door fittings</option>
                  <option value="Pipes, fittings, and valves">Pipes, fittings, and valves</option>
                  <option value="Adhesives and sealants">Adhesives and sealants</option>
                  <option value="Safety equipment">Safety equipment</option>
                  <option value="Welding supplies">Welding supplies</option>
                  <option value="Steel and metal accessories">Steel and metal accessories</option>
                  <option value="Building and finishing materials">Building and finishing materials</option>
                </select>
              </label>
            </div>

            <div className="field-row">
              <label>
                Brand
                <input {...register('brand')} />
              </label>
              <label>
                Unit
                <select {...register('unit')}>
                  <option value="piece">Piece</option>
                  <option value="box">Box</option>
                  <option value="packet">Packet</option>
                  <option value="kilogram">Kilogram</option>
                  <option value="gram">Gram</option>
                  <option value="ton">Ton</option>
                  <option value="meter">Meter</option>
                  <option value="foot">Foot</option>
                  <option value="liter">Liter</option>
                  <option value="bag">Bag</option>
                </select>
              </label>
            </div>

            <label>
              Description
              <textarea {...register('description')} rows={3} />
            </label>

            <div className="field-row">
              <label>
                Purchase price
                <input type="number" step="0.01" {...register('purchasePrice')} />
              </label>
              <label>
                Selling price
                <input type="number" step="0.01" {...register('sellingPrice')} />
              </label>
            </div>

            <div className="field-row">
              <label>
                Wholesale price
                <input type="number" step="0.01" {...register('wholesalePrice')} />
              </label>
              <label>
                Current stock
                <input type="number" step="0.01" {...register('stockQty')} />
              </label>
            </div>

            <div className="field-row">
              <label>
                Min stock
                <input type="number" step="0.01" {...register('minStock')} />
              </label>
              <label>
                Location
                <input {...register('location')} />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">{selectedProductId ? 'Save changes' : 'Create product'}</button>
              <button type="button" className="secondary-button" onClick={() => { reset(emptyForm); setSelectedProductId('') }}>Reset</button>
            </div>
          </form>
        </section>

        <section className="panel-card table-panel">
          <div className="panel-header">
            <h3>Inventory list</h3>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <small>{product.category}</small>
                    </td>
                    <td>{product.sku}</td>
                    <td>{product.stockQty}</td>
                    <td>{product.unit}</td>
                    <td>{formatCurrency(product.sellingPrice)}</td>
                    <td>
                      <button type="button" className="ghost-button" onClick={() => handleEdit(product)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
