import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LuxuryForm from './LuxuryForm';

const LuxuryAdminPage = ({ token, onBack }) => {
  const [luxuryProperties, setLuxuryProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    published: 'all',
  });

  useEffect(() => {
    fetchLuxuryProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, luxuryProperties]);

  const fetchLuxuryProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allProperties = await response.json();
      const luxury = allProperties.filter((p) => p.isLuxury === true);
      setLuxuryProperties(luxury);
      setFilteredProperties(luxury);
    } catch (error) {
      console.error('Error fetching properties:', error);
      alert('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...luxuryProperties];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter((p) => p.type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    // Published filter
    if (filters.published !== 'all') {
      filtered = filtered.filter((p) =>
        filters.published === 'published' ? p.isPublished : !p.isPublished
      );
    }

    setFilteredProperties(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Property deleted successfully');
        fetchLuxuryProperties();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete property');
    }
  };

  const handleToggleVisibility = async (property) => {
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...property,
          showOnHomepage: !property.showOnHomepage,
        }),
      });

      if (response.ok) {
        alert('Visibility updated');
        fetchLuxuryProperties();
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update property');
    }
  };

  const handleSave = (savedProperty) => {
    setShowForm(false);
    setEditingProperty(null);
    fetchLuxuryProperties();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {showForm ? (
        <LuxuryForm
          property={editingProperty}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingProperty(null);
          }}
          token={token}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Luxury Properties</h1>
              <p className="text-gray-600">Manage your premium property listings</p>
            </div>
            <button
              onClick={() => {
                setEditingProperty(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition"
            >
              <Plus size={20} />
              Add New Property
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-1 relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-[52px] pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="h-[52px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Types</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="h-[52px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
              </select>

              {/* Published Filter */}
              <select
                value={filters.published}
                onChange={(e) => setFilters({ ...filters, published: e.target.value })}
                className="h-[52px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading properties...</div>
          ) : filteredProperties.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 mb-4">No luxury properties found</p>
              <button
                onClick={() => {
                  setEditingProperty(null);
                  setShowForm(true);
                }}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg"
              >
                Add First Property
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Image</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Featured</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Published</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredProperties.map((property, idx) => (
                        <motion.tr
                          key={property.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b hover:bg-gray-50 transition"
                          style={{ height: '74px' }}
                        >
                          <td className="px-6 py-4">
                            <img
                              src={property.image}
                              alt={property.title}
                              className="w-14 h-14 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/56';
                              }}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900 truncate max-w-xs">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500">{property.location}</div>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">{property.price}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                property.type === 'sale'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {property.type === 'sale' ? 'Sale' : 'Rent'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700">{property.status}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                property.isFeatured
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {property.isFeatured ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                property.isPublished
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {property.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleVisibility(property)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                title="Toggle visibility"
                              >
                                {property.showOnHomepage ? (
                                  <Eye size={18} />
                                ) : (
                                  <EyeOff size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProperty(property);
                                  setShowForm(true);
                                }}
                                className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(property.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary */}
          {filteredProperties.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Total Properties</p>
                  <p className="text-3xl font-bold text-gray-900">{luxuryProperties.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">For Sale</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {luxuryProperties.filter((p) => p.type === 'sale').length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">For Rent</p>
                  <p className="text-3xl font-bold text-green-600">
                    {luxuryProperties.filter((p) => p.type === 'rent').length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Published</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {luxuryProperties.filter((p) => p.isPublished).length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default LuxuryAdminPage;
