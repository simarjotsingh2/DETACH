'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Upload, Link, FileImage } from 'lucide-react'
import { uploadImage } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  stock: number
  category: string
  imageUrls: string[]
  sizes?: string[]
  isFeatured?: boolean
  discount?: number
  isActive?: boolean
}

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (product: any) => void
  product: Product
}

const categories = [
  'TSHIRTS',
  'HOODIES',
  'PANTS',
  'SHOES',
  'ACCESSORIES'
]

const availableSizes = [
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'
]

// Size order for sorting
const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

// Function to sort sizes in proper order
const sortSizes = (sizes: string[]): string[] => {
  return sizes.sort((a, b) => {
    const indexA = sizeOrder.indexOf(a)
    const indexB = sizeOrder.indexOf(b)
    return indexA - indexB
  })
}

export default function EditProductModal({ isOpen, onClose, onEdit, product }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    category: 'TSHIRTS',
    imageUrls: [''],
    sizes: [] as string[],
    isFeatured: false,
    discount: '',
    isActive: true
  })

  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        stock: product.stock?.toString() || '',
        category: product.category || 'TSHIRTS',
        imageUrls: product.imageUrls || [''],
        sizes: sortSizes(product.sizes || []),
        isFeatured: product.isFeatured || false,
        discount: product.discount?.toString() || '',
        isActive: product.isActive !== undefined ? product.isActive : true
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.price || !formData.stock) {
      toast.error('Please fill in all required fields')
      return
    }

    setUploading(true)

    try {
      let finalImageUrls: string[] = []

      if (uploadMode === 'file') {
        // Check if files are selected
        if (uploadedFiles.length === 0) {
          toast.error('Please select at least one image file')
          setUploading(false)
          return
        }

        try {
          // Upload files to Supabase
          const uploadPromises = uploadedFiles.map(file => uploadImage(file, 'products'))
          finalImageUrls = await Promise.all(uploadPromises)
        } catch (uploadError) {
          console.error('Upload error:', uploadError)
          toast.error('Failed to upload images. Please check your Supabase configuration.')
          setUploading(false)
          return
        }
      } else {
        // Use URL inputs
        finalImageUrls = formData.imageUrls.filter(url => url.trim() !== '')
      }

      const updatedProduct = {
        ...product,
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        imageUrls: finalImageUrls,
        sizes: sortSizes(formData.sizes)
      }

      onEdit(updatedProduct)
      
      toast.success('Product updated successfully!')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    } finally {
      setUploading(false)
    }
  }

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, '']
    }))
  }

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }))
  }

  const updateImageUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.map((url, i) => i === index ? value : url)
    }))
  }

  const handleSizeChange = (size: string) => {
    setFormData(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
      
      return {
        ...prev,
        sizes: sortSizes(newSizes)
      }
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast.error('Please select valid image files')
      return
    }

    const newFiles = [...uploadedFiles, ...imageFiles]
    setUploadedFiles(newFiles)

    // Create preview URLs
    const newPreviewUrls = imageFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeUploadedFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index)
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrls[index])
    
    setUploadedFiles(newFiles)
    setPreviewUrls(newPreviewUrls)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const switchUploadMode = (mode: 'url' | 'file') => {
    setUploadMode(mode)
    if (mode === 'file' && uploadedFiles.length === 0) {
      setFormData(prev => ({ ...prev, imageUrls: [''] }))
    } else if (mode === 'url' && formData.imageUrls.length === 0) {
      setUploadedFiles([])
      setPreviewUrls([])
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative bg-primary-900 border border-primary-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-800">
              <h2 className="text-xl font-semibold text-white">Edit Product</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full input-field"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full input-field min-h-[100px] resize-none"
                  placeholder="Enter product description"
                  required
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full input-field pl-8"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Original Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                      className="w-full input-field pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Stock and Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full input-field"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discount (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                      className="w-full input-field pr-8"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full input-field"
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Available Sizes
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {availableSizes.map((size) => (
                    <label
                      key={size}
                      className="flex items-center justify-center p-3 border border-primary-700 rounded-lg cursor-pointer transition-colors duration-200 hover:border-accent-500 hover:bg-accent-500/10"
                    >
                      <input
                        type="checkbox"
                        checked={formData.sizes.includes(size)}
                        onChange={() => handleSizeChange(size)}
                        className="sr-only"
                      />
                      <span className={`text-sm font-medium transition-colors duration-200 ${
                        formData.sizes.includes(size)
                          ? 'text-accent-400'
                          : 'text-gray-300'
                      }`}>
                        {size}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.sizes.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Selected sizes: {formData.sizes.join(', ')}
                  </p>
                )}
              </div>

              {/* Featured and Active */}
              <div className="flex space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-primary-700 rounded bg-primary-800"
                  />
                  <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-300">
                    Featured Product
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-primary-700 rounded bg-primary-800"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                    Active Product
                  </label>
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Images
                </label>
                
                {/* Upload Mode Toggle */}
                <div className="flex space-x-1 bg-primary-800 rounded-lg p-1 mb-4">
                  <button
                    type="button"
                    onClick={() => switchUploadMode('url')}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      uploadMode === 'url'
                        ? 'bg-accent-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-primary-700'
                    }`}
                  >
                    <Link className="w-4 h-4" />
                    <span>Image URLs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => switchUploadMode('file')}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      uploadMode === 'file'
                        ? 'bg-accent-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-primary-700'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload to Supabase</span>
                  </button>
                </div>

                {/* URL Input Mode */}
                {uploadMode === 'url' && (
                  <div className="space-y-3">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => updateImageUrl(index, e.target.value)}
                          className="flex-1 input-field"
                          placeholder="https://example.com/image.jpg"
                        />
                        {formData.imageUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageUrl(index)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="flex items-center space-x-2 text-accent-400 hover:text-accent-300 transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Image URL</span>
                    </button>
                  </div>
                )}

                {/* File Upload Mode */}
                {uploadMode === 'file' && (
                  <div className="space-y-4">
                    {/* Upload Area */}
                    <div
                      onClick={openFileDialog}
                      className="border-2 border-dashed border-primary-700 rounded-lg p-8 text-center cursor-pointer hover:border-accent-500 transition-colors duration-200"
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-primary-800 rounded-full">
                          <FileImage className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium mb-1">Upload the product images</p>
                          <p className="text-gray-400 text-sm">Click to browse or drag and drop</p>
                          <p className="text-gray-500 text-xs mt-1">PNG, JPG, GIF up to 10MB each</p>
                        </div>
                      </div>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Uploaded Files Preview */}
                    {previewUrls.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-300">Selected Images:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-primary-700"
                              />
                              <button
                                type="button"
                                onClick={() => removeUploadedFile(index)}
                                className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-1 left-1 right-1">
                                <p className="text-xs text-white bg-black/50 rounded px-2 py-1 truncate">
                                  {uploadedFiles[index]?.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-primary-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-primary-700 text-gray-300 hover:text-white hover:border-primary-600 transition-colors duration-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
