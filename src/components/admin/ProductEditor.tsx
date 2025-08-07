import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { X, Upload, Save } from 'lucide-react'

interface ProductEditorProps {
  product?: any
  onClose: () => void
  onSave: () => void
}

const ProductEditor: React.FC<ProductEditorProps> = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    category: product?.category || 'flower',
    strain_type: product?.strain_type || 'hybrid',
    price: product?.price || 0,
    sale_price: product?.sale_price || null,
    thca_percentage: product?.thca_percentage || 0,
    thc_percentage: product?.thc_percentage || 0.3,
    cbd_percentage: product?.cbd_percentage || 0,
    inventory_count: product?.inventory_count || 0,
    images: product?.images || [],
    thumbnail: product?.thumbnail || '',
    coi_document_url: product?.coi_document_url || '',
    batch_number: product?.batch_number || '',
    status: product?.status || 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (product?.id) {
        await supabase
          .from('products')
          .update(form)
          .eq('id', product.id)
      } else {
        await supabase
          .from('products')
          .insert(form)
      }
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm({
        ...form,
        images: [...form.images, reader.result as string],
        thumbnail: form.thumbnail || reader.result as string
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU *</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({...form, sku: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={4}
            />
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="flower">Flower</option>
                <option value="pre-roll">Pre-Roll</option>
                <option value="edible">Edible</option>
                <option value="concentrate">Concentrate</option>
                <option value="vape">Vape</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Strain Type</label>
              <select
                value={form.strain_type}
                onChange={(e) => setForm({...form, strain_type: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="sativa">Sativa</option>
                <option value="indica">Indica</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Regular Price *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({...form, price: parseFloat(e.target.value)})}
                className="w-full border rounded px-3 py-2"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sale Price</label>
              <input
                type="number"
                value={form.sale_price || ''}
                onChange={(e) => setForm({...form, sale_price: e.target.value ? parseFloat(e.target.value) : null})}
                className="w-full border rounded px-3 py-2"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Inventory Count *</label>
              <input
                type="number"
                value={form.inventory_count}
                onChange={(e) => setForm({...form, inventory_count: parseInt(e.target.value)})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          {/* Cannabinoid Content */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">THCA %</label>
              <input
                type="number"
                value={form.thca_percentage}
                onChange={(e) => setForm({...form, thca_percentage: parseFloat(e.target.value)})}
                className="w-full border rounded px-3 py-2"
                step="0.1"
                max="40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">THC %</label>
              <input
                type="number"
                value={form.thc_percentage}
                onChange={(e) => setForm({...form, thc_percentage: parseFloat(e.target.value)})}
                className="w-full border rounded px-3 py-2"
                step="0.1"
                max="0.3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CBD %</label>
              <input
                type="number"
                value={form.cbd_percentage}
                onChange={(e) => setForm({...form, cbd_percentage: parseFloat(e.target.value)})}
                className="w-full border rounded px-3 py-2"
                step="0.1"
                max="30"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Images</label>
            <div className="grid grid-cols-4 gap-4">
              {form.images.map((img: string, idx: number) => (
                <div key={idx} className="relative">
                  <img src={img} alt="" className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      images: form.images.filter((_: string, i: number) => i !== idx)
                    })}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="border-2 border-dashed rounded h-24 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-gray-400" />
              </label>
            </div>
          </div>

          {/* COI Document */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Batch Number</label>
              <input
                type="text"
                value={form.batch_number}
                onChange={(e) => setForm({...form, batch_number: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">COI Document URL</label>
              <input
                type="url"
                value={form.coi_document_url}
                onChange={(e) => setForm({...form, coi_document_url: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({...form, status: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductEditor
