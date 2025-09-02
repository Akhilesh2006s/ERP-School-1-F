import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const ROLE_LABELS = {
  principal: 'Principal',
  vice_principal: 'Vice Principal',
  headmistress: 'Headmistress',
  hod: 'Head of Department',
};

const RoleManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [specialRoles, setSpecialRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [hodDept, setHodDept] = useState({}); // { teacherId: deptName }
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [teachersRes, rolesRes] = await Promise.all([
        api.get('/admin/teachers'),
        api.get('/admin/special-roles'),
      ]);
      setTeachers(teachersRes.data.data.teachers || []);
      setSpecialRoles(rolesRes.data.data.users || []);
    } catch {
      setTeachers([]);
      setSpecialRoles([]);
    }
    setLoading(false);
  };

  const handleAssign = async (teacherId, type, department) => {
    setMsg('');
    try {
      await api.post('/admin/assign-role', { userId: teacherId, type, department });
      setMsg('Role assigned!');
      fetchAll();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to assign role.');
    }
  };

  const handleRemove = async (teacherId, type, department) => {
    setMsg('');
    try {
      await api.post('/admin/remove-role', { userId: teacherId, type, department });
      setMsg('Role removed.');
      fetchAll();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to remove role.');
    }
  };

  // Filter teachers by search and only those with no special roles
  const filteredTeachers = teachers.filter(t => {
    const q = search.toLowerCase();
    const hasRole = (t.specialRoles || []).length > 0;
    return !hasRole && (
      t.firstName.toLowerCase().includes(q) ||
      t.lastName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  });

  // Button style classes
  const btnSquare = "px-3 py-2 rounded-md font-bold shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400";
  const btnPrimary = `${btnSquare} bg-blue-600 text-white hover:bg-blue-700`;
  const btnDanger = `${btnSquare} bg-red-600 text-white hover:bg-red-700`;

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

      <div className="max-w-5xl mx-auto p-8 relative z-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Role Management</h1>
      {msg && <div className="mb-4 text-green-600 font-semibold">{msg}</div>}
      <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
        <h2 className="text-xl font-semibold mb-4">Assign Special Roles to Teachers</h2>
        <div className="mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search teachers by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input input-md w-full md:w-1/2 border-blue-200"
          />
        </div>
        {loading ? <div>Loading...</div> : filteredTeachers.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No teachers available for role assignment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full mb-8">
              <thead>
                <tr>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Principal</th>
                  <th className="text-left py-2">Vice Principal</th>
                  <th className="text-left py-2">Headmistress</th>
                  <th className="text-left py-2">HOD (Dept)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map(t => (
                  <tr key={t._id} className="border-t hover:bg-blue-50 transition">
                    <td className="py-2 font-medium">{t.firstName} {t.lastName}</td>
                    <td className="py-2">{t.email}</td>
                    <td className="py-2">
                      <button className={btnPrimary} onClick={() => handleAssign(t._id, 'principal')}>Assign</button>
                    </td>
                    <td className="py-2">
                      <button className={btnPrimary} onClick={() => handleAssign(t._id, 'vice_principal')}>Assign</button>
                    </td>
                    <td className="py-2">
                      <button className={btnPrimary} onClick={() => handleAssign(t._id, 'headmistress')}>Assign</button>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Dept name"
                          value={hodDept[t._id] || ''}
                          onChange={e => setHodDept({ ...hodDept, [t._id]: e.target.value })}
                          className="input input-xs"
                        />
                        <button
                          className={btnPrimary}
                          onClick={() => handleAssign(t._id, 'hod', hodDept[t._id])}
                          disabled={!hodDept[t._id]}
                        >Assign</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Current Special Role Assignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specialRoles.length === 0 ? <div className="text-gray-500">No special roles assigned.</div> : specialRoles.map(u => (
            <div key={u._id} className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-5 border border-blue-200 shadow">
              <div className="font-bold mb-1 text-blue-900 text-lg">{u.firstName} {u.lastName} <span className="text-gray-600 text-sm">({u.email})</span></div>
              <ul className="list-disc ml-6 mt-1">
                {u.specialRoles.map(r => (
                  <li key={r.type + (r.department || '')} className="mb-1">
                    <span className="font-semibold text-blue-700">{ROLE_LABELS[r.type]}</span>
                    {r.type === 'hod' && r.department ? <span className="ml-2 text-blue-500">({r.department})</span> : ''}
                    <button
                      className={btnDanger + " ml-4"}
                      onClick={() => handleRemove(u._id, r.type, r.department)}
                    >Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default RoleManagement; 