import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

function OnlineStoreDashboard() {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', cost: '', description: '', imageUrl: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/store');
      setProducts(res.data);
    } catch {
      setError('Failed to load products');
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview('');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let imageUrl = newProduct.imageUrl;
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await api.post('/store/upload', formData);
        imageUrl = uploadRes.data.imageUrl;
      }
      await api.post('/store/add', { ...newProduct, cost: Number(newProduct.cost), imageUrl });
      setShowAddModal(false);
      setNewProduct({ name: '', cost: '', description: '', imageUrl: '' });
      setImageFile(null);
      setImagePreview('');
      fetchProducts();
    } catch {
      setError('Failed to add product');
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/store/${id}`);
      fetchProducts();
    } catch {}
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs with vibrant colors */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-300/60 to-indigo-400/60 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-300/60 to-pink-400/60 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-indigo-300/60 to-blue-400/60 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-br from-pink-300/60 to-purple-400/60 rounded-full blur-xl animate-bounce-slow"></div>
        
        {/* Hexagonal shapes with vibrant colors */}
        <div className="absolute top-1/4 left-1/6 w-16 h-16 bg-gradient-to-br from-blue-300/50 to-indigo-400/50 clip-hexagon animate-twinkle"></div>
        <div className="absolute top-3/4 right-1/6 w-12 h-12 bg-gradient-to-br from-purple-300/50 to-pink-400/50 clip-hexagon animate-twinkle" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-gradient-to-br from-indigo-300/50 to-blue-400/50 clip-hexagon animate-twinkle" style={{animationDelay: '2s'}}></div>
        
        {/* Particle effects with vibrant colors */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-400/80 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400/80 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-indigo-400/80 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        
        {/* Animated waves */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-200/40 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-purple-200/40 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-gradient-to-br from-pink-300/40 to-rose-400/40 rotate-45 animate-float-slow"></div>
        <div className="absolute top-2/3 right-1/4 w-6 h-6 bg-gradient-to-br from-indigo-300/40 to-blue-400/40 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-1/3 right-1/3 w-10 h-10 bg-gradient-to-br from-green-300/40 to-emerald-400/40 rotate-12 animate-float"></div>
      </div>

      <div className="max-w-5xl mx-auto p-6 relative z-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Online Store</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowAddModal(true)}>
          + Add Product
        </button>
      </div>
      {loading && <div className="p-4">Loading...</div>}
      {products.length === 0 ? (
        <div className="text-gray-400 text-sm">No products yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(prod => (
            <div key={prod._id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
              <img src={prod.imageUrl || 'https://via.placeholder.com/120x120?text=No+Image'} alt={prod.name} className="w-32 h-32 object-cover rounded mb-3 border" />
              <div className="font-bold text-lg mb-1">{prod.name}</div>
              <div className="text-green-700 font-bold text-xl mb-1">₹{prod.cost}</div>
              <div className="text-gray-600 text-sm mb-2 text-center">{prod.description}</div>
              <button className="border px-3 py-1 rounded text-red-600 mt-2" onClick={() => handleDeleteProduct(prod._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowAddModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Add Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input className="input input-bordered w-full rounded-lg" placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
              <input className="input input-bordered w-full rounded-lg" type="number" placeholder="Cost (₹)" value={newProduct.cost} onChange={e => setNewProduct({ ...newProduct, cost: e.target.value })} required />
              <input className="input input-bordered w-full rounded-lg" placeholder="Image URL (optional)" value={newProduct.imageUrl} onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })} />
              <input className="input input-bordered w-full rounded-lg" type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded mx-auto" />}
              <textarea className="input input-bordered w-full rounded-lg" placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold">Add</button>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default OnlineStoreDashboard; 