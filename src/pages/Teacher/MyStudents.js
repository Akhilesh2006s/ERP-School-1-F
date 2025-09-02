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
      console.log('Fetching teacher data...');
      console.log('User:', user);
      
      // Try to get all sections for the school first
      if (user?.school?._id) {
        console.log('School ID found:', user.school._id);
        
        try {
          const sectionsRes = await api.get(`/api/section/all?schoolId=${user.school._id}`);
          console.log('Sections response:', sectionsRes.data);
          
          if (sectionsRes.data?.data?.classSections) {
            const classSections = sectionsRes.data.data.classSections;
            console.log('Class sections:', classSections);
            
            // Create sections with class numbers
            const sectionsWithClassNumbers = classSections.map(cs => ({
              sectionName: cs.sectionName,
              classNumber: cs.classNumber,
              students: [],
              subjects: []
            }));
            
            console.log('Sections with class numbers:', sectionsWithClassNumbers);
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
      console.log('DEBUG: classes from API', classes);
      
      // Debug each class
      classes.forEach((cls, index) => {
        console.log(`Class ${index}:`, {
          id: cls._id,
          number: cls.number,
          name: cls.name,
          sectionsCount: cls.sections?.length || 0
        });
        
        if (cls.sections) {
          cls.sections.forEach((section, secIndex) => {
            console.log(`  Section ${secIndex}:`, {
              id: section._id,
              name: section.name,
              studentsCount: section.students?.length || 0,
              subjectsCount: section.subjects?.length || 0
            });
          });
        }
      });
      
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
      console.log('Final sections array:', sectionsArray);
      
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
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="p-0 sm:p-4 max-w-7xl mx-auto relative z-10">
        <div className="py-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-8">
          <Users className="w-6 h-6 text-purple-400" /> Student Management
        </h1>
        
        {/* Temporary debug section */}
        <div className="bg-yellow-900/50 border border-yellow-500/30 text-yellow-200 px-4 py-3 rounded mb-4">
          <strong>Debug Info:</strong>
          <div>User School ID: {user?.school?._id || 'Not found'}</div>
          <div>Sections count: {sections.length}</div>
          <div>Filtered sections: {filteredSections.length}</div>
          {sections.length > 0 && (
            <div>
              <strong>First section data:</strong>
              <pre className="text-xs mt-2 bg-gray-800 p-2 rounded text-gray-200">
                {JSON.stringify(sections[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-600 h-16 w-16"></div>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="text-gray-300 text-center py-12">No sections found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSections.map((section, idx) => (
              <div key={idx} className="card-purple rounded-2xl shadow-lg p-8 flex flex-col gap-4 border border-purple-500/30 hover:shadow-2xl transition">
                <div className="font-bold text-xl text-white flex items-center gap-2 mb-2">
                  <BookOpen className="w-6 h-6 text-purple-300" /> 
                  {section.classNumber ? `Class ${section.classNumber} - Section ${section.sectionName}` : `Section ${section.sectionName}`}
                </div>
                <div className="flex items-center text-gray-200 mb-1 text-lg"><span className="mr-2">👥</span> {section.students.length} Students</div>
                <div className="flex items-center text-gray-200 mb-1 text-lg">
                  <span className="mr-2">📚</span>
                  {section.subjects.length === 0 ? (
                    <span className="text-gray-400">No subjects assigned</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {section.subjects.map((subj, i) => (
                        <span key={i} className="bg-purple-900/50 text-purple-200 px-3 py-1 rounded-full text-sm font-semibold border border-purple-500/30">
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