import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Users, Plus, Search, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MyStudents = () => {
  const [sections, setSections] = useState([]); // [{ sectionName, students: [], subjects: [] }]
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, newThisMonth: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassForm, setNewClassForm] = useState({
    number: '',
    name: '',
    section: 'A'
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Try to get all sections for the school first
      if (user?.school?._id) {
        try {
          const sectionsRes = await api.get(`/api/section/all?schoolId=${user.school._id}`);
          
          if (sectionsRes.data?.data?.classSections) {
            const classSections = sectionsRes.data.data.classSections;
            
            // Create sections with class numbers
            const sectionsWithClassNumbers = classSections.map(cs => ({
              sectionName: cs.sectionName,
              classNumber: cs.classNumber,
              students: [],
              subjects: []
            }));
            
            setSections(sectionsWithClassNumbers);
            setSummary({ total: 0, active: 0, inactive: 0, newThisMonth: 0 });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error fetching sections:', error);
        }
      }
      
      // Fallback: Get teacher's class-section assignments
      const res = await api.get('/api/teacher/classes');
      const classes = res.data?.data?.classes || [];
      
      console.log('Classes data received:', classes);
      
      // Group by section
      const sectionMap = new Map();
      let total = 0;
      classes.forEach(cls => {
        // Each class may have multiple sections/subjects
        (cls.sections || []).forEach(section => {
          const key = section._id || section.sectionId;
          if (!sectionMap.has(key)) {
            sectionMap.set(key, {
              sectionName: section.name,
              classNumber: cls.number, // may be undefined
              className: cls.name,     // fallback
              classCode: cls.code,     // fallback
              students: section.students || [],
              subjects: [],
            });
          }
          // Add subjects assigned to this teacher for this section
          (section.subjects || []).forEach(subj => {
            if (subj.teacher && subj.teacher._id === cls.teacherId) {
              sectionMap.get(key).subjects.push(subj.subject?.name || subj.name);
            }
          });
          total += (section.students || []).length;
        });
      });
      // Fallback: If no sections in class, try flat class-level students/subjects
      if (sectionMap.size === 0) {
        classes.forEach(cls => {
          sectionMap.set(cls._id, {
            sectionName: cls.name,
            classNumber: cls.number,
            students: cls.students || [],
            subjects: (cls.subjects || []).map(s => s.subject?.name || s.name),
          });
          total += (cls.students || []).length;
        });
      }
      
      const sectionsArray = Array.from(sectionMap.values());
      
      setSections(sectionsArray);
      setSummary({ total, active: 0, inactive: 0, newThisMonth: 0 });
    } catch (error) {
      console.error('Error fetching classes:', error);
      setSections([]);
      setSummary({ total: 0, active: 0, inactive: 0, newThisMonth: 0 });
    }
    setLoading(false);
  };

  // Filter by search - removed the classNumber filter to show all sections
  const filteredSections = sections.filter(s =>
    s.sectionName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClassForm.number && !newClassForm.name) {
      alert('Please enter either a class number or name');
      return;
    }

    setSubmitting(true);
    try {
      const classData = {
        number: newClassForm.number || undefined,
        name: newClassForm.name || `Class ${newClassForm.number}`,
        schoolId: user?.school?._id
      };

      console.log('Creating new class:', classData);
      
      // Create the class
      const classRes = await api.post('/api/class', classData);
      console.log('Class created:', classRes.data);

      // Create a section for this class
      const sectionData = {
        name: newClassForm.section,
        classId: classRes.data.data.class._id,
        schoolId: user?.school?._id
      };

      console.log('Creating section:', sectionData);
      const sectionRes = await api.post('/api/section', sectionData);
      console.log('Section created:', sectionRes.data);

      // Refresh the data
      await fetchAll();
      
      // Reset form and close modal
      setNewClassForm({ number: '', name: '', section: 'A' });
      setShowAddClassModal(false);
      
      alert('Class and section created successfully!');
    } catch (error) {
      console.error('Error creating class:', error);
      alert(error.response?.data?.message || 'Failed to create class. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      
      <div className="p-0 sm:p-4 max-w-7xl mx-auto relative z-10">
        <div className="py-8">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2 mb-8">
          <Users className="w-6 h-6 text-black" /> Student Management
        </h1>
        
        {/* Add Class Button */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => setShowAddClassModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add New Class
          </button>
          
          <div className="text-gray-600 text-sm">
            Total Classes: {sections.length}
          </div>
        </div>
        
        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
            <input
              type="text"
              placeholder="Search sections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-400 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:ring-2 focus:ring-gray-400/30"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-400 h-16 w-16"></div>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="text-black text-center py-12 text-lg font-medium">No sections found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSections.map((section, idx) => (
              <div key={idx} className="bg-white border-2 border-gray-300 rounded-2xl shadow-lg p-8 flex flex-col gap-4 hover:shadow-2xl transition hover:border-gray-400">
                <div className="font-bold text-xl text-black flex items-center gap-2 mb-2">
                  <BookOpen className="w-6 h-6 text-black" /> 
                  {section.classNumber ? `Class ${section.classNumber} - Section ${section.sectionName}` : 
                   section.className ? `Class ${section.className} - Section ${section.sectionName}` :
                   `Section ${section.sectionName}`}
                </div>
                <div className="flex items-center text-gray-700 mb-1 text-lg font-semibold"><span className="mr-2">👥</span> {section.students.length} Students</div>
                <div className="flex items-center text-gray-700 mb-1 text-lg font-semibold">
                  <span className="mr-2">📚</span>
                  {section.subjects.length === 0 ? (
                    <span className="text-gray-600 font-medium">No subjects assigned</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {section.subjects.map((subj, i) => (
                        <span key={i} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold border border-gray-400 shadow-sm">
                          {typeof subj === 'string' ? subj : subj.name || subj.subject?.name || 'Unnamed Subject'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add Class Modal */}
        {showAddClassModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Class</h2>
              
              <form onSubmit={handleAddClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class Number</label>
                  <input
                    type="number"
                    value={newClassForm.number}
                    onChange={(e) => setNewClassForm({...newClassForm, number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="e.g., 4, 5, 6"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class Name (Optional)</label>
                  <input
                    type="text"
                    value={newClassForm.name}
                    onChange={(e) => setNewClassForm({...newClassForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Primary, Secondary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
                  <select
                    value={newClassForm.section}
                    onChange={(e) => setNewClassForm({...newClassForm, section: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddClassModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Class'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MyStudents; 