import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Search, Box, Layers, MapPin, DollarSign } from 'lucide-react';

const initialForm = {
  category: '',
  quantity: '',
  location: '',
  roomNumber: '',
  type: '',
  cost: '',
};

const InventoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState({ totalItems: 0, totalValue: 0, lowStockItems: 0, categoriesCount: 0 });
  const [categories, setCategories] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [itemsRes, summaryRes, categoriesRes] = await Promise.all([
              api.get('/api/inventory'),
      api.get('/api/inventory/summary'),
      api.get('/api/inventory/categories/summary'),
      ]);
      setItems(itemsRes.data || []);
      setSummary(summaryRes.data || {});
      setCategories(categoriesRes.data || {});
    } catch {
      setItems([]);
      setSummary({ totalItems: 0, totalValue: 0, lowStockItems: 0, categoriesCount: 0 });
      setCategories({});
    }
    setLoading(false);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async e => {
    e.preventDefault();
    setFormError(null);
    setAdding(true);
    try {
      await api.post('/api/inventory/add', form);
      setShowAddModal(false);
      setForm(initialForm);
      fetchAll();
    } catch (err) {
      setFormError('Failed to add item');
    }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      fetchAll();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  // Filter items by search
  const filteredItems = items.filter(item => {
    const q = search.toLowerCase();
    return (
      item.category?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q) ||
      item.roomNumber?.toLowerCase().includes(q) ||
      item.cost?.toLowerCase().includes(q)
    );
  });

  // Helper to parse cost (e.g., '45k' => 45000)
  function parseCost(cost) {
    if (typeof cost === 'number') return cost;
    if (!cost) return 0;
    const match = cost.toString().toLowerCase().match(/([\d,.]+)\s*(k)?/);
    if (!match) return 0;
    let value = parseFloat(match[1].replace(/,/g, ''));
    if (match[2] === 'k') value *= 1000;
    return value;
  }

  // Fix total value calculation
  useEffect(() => {
    const totalValue = items.reduce((sum, item) => sum + (parseCost(item.cost) * (parseInt(item.quantity) || 0)), 0);
    setSummary(s => ({ ...s, totalValue }));
  }, [items]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>

      <div className="p-4 max-w-7xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Inventory & Asset Management</h1>
        <p className="text-gray-800 font-medium mb-6">Track assets, manage inventory, and monitor stock levels</p>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card-gold rounded-xl p-4 flex flex-col items-center hover:scale-105 transition">
          <Box className="w-7 h-7 text-yellow-300 mb-2" />
          <div className="text-2xl font-bold text-white">{summary.totalItems}</div>
          <div className="text-yellow-200">Total Items</div>
        </div>
        <div className="card-gold rounded-xl p-4 flex flex-col items-center hover:scale-105 transition">
          <DollarSign className="w-7 h-7 text-yellow-300 mb-2" />
          <div className="text-2xl font-bold text-white">₹{summary.totalValue?.toLocaleString()}</div>
          <div className="text-yellow-200">Total Value</div>
        </div>
        <div className="card-purple rounded-xl p-4 flex flex-col items-center hover:scale-105 transition">
          <MapPin className="w-7 h-7 text-purple-300 mb-2" />
          <div className="text-2xl font-bold text-white">{summary.categoriesCount}</div>
          <div className="text-purple-200">Categories</div>
        </div>
      </div>
      {/* Search Bar and Add Button */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-blue-400" />
          <input
            type="text"
            placeholder="Search inventory by category, location, type, room, or cost..."
            className="input input-bordered w-full md:w-1/2 rounded-lg pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-full p-4 shadow-xl hover:from-blue-800 hover:to-blue-600 transition flex items-center gap-2 text-lg font-semibold" onClick={() => setShowAddModal(true)}>
          <Plus className="w-6 h-6" />
          <span className="hidden md:inline">Add Item</span>
        </button>
      </div>
      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-x-auto border border-blue-100 mb-8">
        <table className="min-w-full divide-y divide-blue-100">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white sticky top-0 z-10 rounded-t-2xl">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-2xl">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Room</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Cost</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Last Updated</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></td></tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-blue-700">
                  <div className="flex flex-col items-center gap-2">
                    <Box className="w-12 h-12 text-blue-300 mb-2" />
                    <span className="font-semibold text-lg">No items found.</span>
                    <span className="text-gray-400 text-sm">Try adjusting your search.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                if (!item || !item._id) return null; // Skip null or invalid items
                return (
                  <tr key={item._id} className={`transition group ${idx % 2 === 0 ? 'bg-blue-50/40' : 'bg-white' } hover:bg-blue-100/60`}>
                    <td className="px-4 py-3 font-medium text-blue-900 rounded-l-xl">{item.category}</td>
                    <td className="px-4 py-3">{item.type}</td>
                    <td className="px-4 py-3">{item.roomNumber}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">₹{parseCost(item.cost)?.toLocaleString()}</td>
                    <td className="px-4 py-3">{item.location}</td>
                    <td className="px-4 py-3">{item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-center rounded-r-xl">
                      <button className="p-2 rounded-full hover:bg-red-100 transition ml-2" title="Delete" onClick={() => handleDelete(item._id)}>
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Inventory Categories */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Inventory Categories</h2>
        <div className="flex flex-col gap-4">
          {Object.entries(categories).length === 0 ? (
            <div className="text-gray-500">No categories found.</div>
          ) : (
            Object.entries(categories).map(([cat, data]) => (
              <div key={cat} className="bg-white rounded-xl shadow p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold">{cat}</div>
                  <button className="text-blue-700 font-semibold hover:underline">View All</button>
                </div>
                <div className="text-gray-500 text-sm">{data.count} items <span className="mx-2">|</span> Value: ₹{data.value || '-'}</div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="modal-dark rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="modal-close absolute top-3 right-3 text-2xl font-bold"
              onClick={() => setShowAddModal(false)}
            >
              &times;
            </button>
            <h3 className="modal-title text-xl font-semibold mb-4">Add Inventory Item</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="label-dark block text-sm font-medium mb-1">Category</label>
                <input name="category" value={form.category} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="label-dark block text-sm font-medium mb-1">Room Number</label>
                <input name="roomNumber" value={form.roomNumber} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="label-dark block text-sm font-medium mb-1">Type</label>
                <input name="type" value={form.type} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" placeholder="e.g. Computer" />
              </div>
              <div>
                <label className="label-dark block text-sm font-medium mb-1">Quantity</label>
                <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="label-dark block text-sm font-medium mb-1">Cost per Item</label>
                <input name="cost" type="text" value={form.cost} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" placeholder="e.g. 45,000 or 45k INR" />
              </div>
              <div>
                <label className="label-dark block text-sm font-medium mb-1">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="input-dark w-full rounded-lg px-3 py-2" />
              </div>
              {formError && <div className="text-red-400 text-sm">{formError}</div>}
              <button
                type="submit"
                className="btn-dark-primary w-full py-2 rounded-lg font-semibold flex items-center justify-center"
                disabled={adding}
              >
                {adding ? 'Adding...' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default InventoryDashboard; 