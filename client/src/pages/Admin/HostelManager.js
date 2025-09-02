import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Users,
  Bed,
  CheckCircle
} from 'lucide-react';

const HostelManager = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setHostels([
        { id: 1, name: 'Boys Hostel A', capacity: 100, occupied: 85, status: 'active' },
        { id: 2, name: 'Girls Hostel B', capacity: 80, occupied: 75, status: 'active' },
        { id: 3, name: 'International Hostel', capacity: 50, occupied: 30, status: 'active' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-3">
            <Home className="w-8 h-8 text-primary-600" />
            Hostel Management
          </h1>
          <p className="text-secondary-600 mt-2">Manage student accommodation</p>
        </div>
        <button className="btn btn-primary btn-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Hostel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">190</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-xl font-bold text-secondary-900">Hostel Information</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {hostels.map((hostel) => (
                <div key={hostel.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-900">{hostel.name}</h4>
                      <p className="text-sm text-secondary-600">Capacity: {hostel.capacity} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-secondary-900">{hostel.occupied}/{hostel.capacity}</p>
                    <span className="badge badge-success">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostelManager;



