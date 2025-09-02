import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

function StudentStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/store');
      setProducts(res.data);
    } catch {
      setError('Failed to load products');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-5xl mx-auto p-6 relative z-10">
      <h1 className="text-3xl font-bold mb-6">Online Store</h1>
      {loading && <div className="p-4">Loading...</div>}
      {error && <div className="text-red-600 p-2">{error}</div>}
      {products.length === 0 && !loading ? (
        <div className="text-gray-400 text-sm">No products available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(prod => (
            <div key={prod._id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
              <img src={prod.imageUrl || 'https://via.placeholder.com/120x120?text=No+Image'} alt={prod.name} className="w-32 h-32 object-cover rounded mb-3 border" />
              <div className="font-bold text-lg mb-1">{prod.name}</div>
              <div className="text-green-700 font-bold text-xl mb-1">₹{prod.cost}</div>
              <div className="text-gray-600 text-sm mb-2 text-center">{prod.description}</div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export default StudentStore; 