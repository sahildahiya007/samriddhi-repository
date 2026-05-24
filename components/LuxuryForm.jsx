import React, { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LuxuryForm = ({ property = null, onSave, onCancel, token }) => {
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: property?.title || '',
    slug: property?.slug || '',
    category: 'luxury',
    type: property?.type || 'sale',
    price: property?.price || '',
    priceLabel: property?.priceLabel || '₹',
    location: property?.location || '',
    address: property?.address || '',
    description: property?.description || '',
    bedrooms: property?.bedrooms || '3',
    bathrooms: property?.bathrooms || '2',
    area: property?.area || '',
    floor: property?.floor || '',
    furnishing: property?.furnishing || 'Furnished',
    parking: property?.parking || '',
    facing: property?.facing || 'East',
    reraNumber: property?.reraNumber || '',
    status: property?.status || 'Available',
    rating: property?.rating || '4.8',
    highlights: property?.highlights || [],
    nearbyPlaces: property?.nearbyPlaces || [],
    image: property?.image || '',
    images: property?.images || [],
    callNumber: property?.callNumber || '',
    whatsappNumber: property?.whatsappNumber || '',
    showOnHomepage: property?.showOnHomepage ?? true,
    isFeatured: property?.isFeatured ?? false,
    isPublished: property?.isPublished ?? true,
    isLuxury: true,
  });

  const [uploading, setUploading] = useState(false);
  const [highlightInput, setHighlightInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Auto-generate slug from title
    if (name === 'title') {
      setFormData((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      }));
    }
  };

  const handleImageUpload = async (e, isGallery = false) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formDataImg = new FormData();
        formDataImg.append('image', file);

        const response = await fetch('/api/uploads/property-image', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataImg,
        });

        if (response.ok) {
          const data = await response.json();
          if (isGallery) {
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, data.url],
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              image: data.url,
            }));
          }
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        highlights: [...prev.highlights, highlightInput.trim()],
      }));
      setHighlightInput('');
    }
  };

  const removeHighlight = (idx) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = property ? 'PUT' : 'POST';
      const url = property ? `/api/properties/${property.id}` : '/api/properties';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const saved = await response.json();
        alert(`Property ${property ? 'updated' : 'created'} successfully!`);
        onSave(saved);
      } else {
        alert('Failed to save property');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Error saving property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {property ? 'Edit Luxury Property' : 'Add Luxury Property'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={28} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Property Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Luxury Golf Course Penthouse"
              className="w-full h-[52px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Slug (auto-generated)
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className="w-full h-[52px] px-4 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
        </div>

        {/* Type & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full h-[52px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full h-[52px] px-4 border border-gray-300 rounded-lg"
            >
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Rented">Rented</option>
            </select>
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Price *
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="8.5 Cr"
              className="w-full h-[52px] px-4 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Price Label
            </label>
            <input
              type="text"
              name="priceLabel"
              value={formData.priceLabel}
              onChange={handleInputChange}
              placeholder="₹"
              className="w-full h-[52px] px-4 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="DLF Phase 5, Gurgaon"
              className="w-full h-[52px] px-4 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Tower A, DLF Phase 5..."
              className="w-full h-[52px] px-4 border border-gray-300 rounded-lg"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Premium luxury apartment with world-class amenities..."
            className="w-full h-[130px] px-4 py-3 border border-gray-300 rounded-lg resize-none"
          ></textarea>
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { name: 'bedrooms', label: 'Bedrooms' },
            { name: 'bathrooms', label: 'Bathrooms' },
            { name: 'area', label: 'Area (sq ft)' },
            { name: 'floor', label: 'Floor' },
            { name: 'parking', label: 'Parking' },
            { name: 'facing', label: 'Facing' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {field.label}
              </label>
              <input
                type="text"
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                className="w-full h-[52px] px-4 border border-gray-300 rounded-lg"
              />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Furnishing
            </label>
            <select
              name="furnishing"
              value={formData.furnishing}
              onChange={handleInputChange}
              className="w-full h-[52px] px-4 border border-gray-300 rounded-lg"
            >
              <option>Furnished</option>
              <option>Semi-Furnished</option>
              <option>Unfurnished</option>
              <option>Ultra Luxury</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              RERA Number
            </label>
            <input
              type="text"
              name="reraNumber"
              value={formData.reraNumber}
              onChange={handleInputChange}
              placeholder="HRERA-1234-5678"
              className="w-full h-[52px] px-4 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Call Number
            </label>
            <input
              type="tel"
              name="callNumber"
              value={formData.callNumber}
              onChange={handleInputChange}
              placeholder="+91 9876543210"
              className="w-full h-[52px] px-4 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
              placeholder="+91 9876543210"
              className="w-full h-[52px] px-4 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Main Image
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-[52px] border-2 border-dashed border-orange-300 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-50 transition disabled:opacity-50"
          >
            <Upload size={20} className="text-orange-600" />
            {uploading ? 'Uploading...' : 'Upload Main Image'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, false)}
            hidden
          />
          {formData.image && (
            <div className="mt-4">
              <img
                src={formData.image}
                alt="Main"
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Gallery Images
          </label>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-[52px] border-2 border-dashed border-orange-300 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-50 transition disabled:opacity-50"
          >
            <Upload size={20} className="text-orange-600" />
            {uploading ? 'Uploading...' : 'Upload Gallery Images'}
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageUpload(e, true)}
            hidden
          />
          {formData.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt={`Gallery ${idx}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Highlights */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Highlights
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
              placeholder="Add highlight (e.g., Infinity Pool)"
              className="flex-1 h-[52px] px-4 border border-gray-300 rounded-lg"
            />
            <button
              type="button"
              onClick={addHighlight}
              className="bg-orange-500 text-white px-6 h-[52px] rounded-lg flex items-center gap-2 hover:bg-orange-600"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.highlights.map((h, idx) => (
              <div
                key={idx}
                className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
              >
                {h}
                <button
                  type="button"
                  onClick={() => removeHighlight(idx)}
                  className="hover:text-orange-900"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="showOnHomepage"
              checked={formData.showOnHomepage}
              onChange={handleInputChange}
              className="w-5 h-5"
            />
            <label className="font-semibold text-gray-700">Show on Homepage</label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleInputChange}
              className="w-5 h-5"
            />
            <label className="font-semibold text-gray-700">Featured Luxury Property</label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleInputChange}
              className="w-5 h-5"
            />
            <label className="font-semibold text-gray-700">Publish</label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : property ? 'Update Property' : 'Add Property'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default LuxuryForm;
