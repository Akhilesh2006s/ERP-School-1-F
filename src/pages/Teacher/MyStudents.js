import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Users, Plus, Search, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MyStudents = () => {
  const [sections, setSections] = useState([]); // [{ sectionName, students: [], subjects: [] }]
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, newThisMonth: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      
      <div className="p-0 sm:p-4 max-w-7xl mx-auto relative z-10">
        <div className="py-8">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2 mb-8">
          <Users className="w-6 h-6 text-black" /> Student Management
        </h1>
        
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
        </div>
      </div>
    </div>
  );
};

export default MyStudents; 