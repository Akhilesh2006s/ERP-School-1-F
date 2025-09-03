import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { Play, Trash2, Plus, Youtube, Eye, BookOpen, X } from 'lucide-react';

const YouTubeVideos = () => {
  const { user, token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  
  // Debug user context
  console.log('YouTubeVideos component - User context:', { user, token });
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    classSection: '',
    subject: '',
    topic: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    // Test API connection first
    console.log('Testing API connection...');
    console.log('API base URL:', process.env.NODE_ENV === 'production' 
      ? 'https://erp-school-1-production.up.railway.app'
      : 'http://localhost:5000');
    
    fetchAssignments();
    fetchVideos();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setAssignments(res.data?.data?.user?.assignments || []);
    } catch {
      setAssignments([]);
    }
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      console.log('Fetching videos...');
      console.log('Current token from localStorage:', localStorage.getItem('token'));
      console.log('User context token:', token);
      
      const res = await api.get('/api/teacher/youtube-videos');
      console.log('Videos API response:', res.data);
      console.log('Videos array:', res.data.data?.videos);
      
      const videosData = res.data.data?.videos || [];
      console.log('Processed videos data:', videosData);
      console.log('Number of videos found:', videosData.length);
      
      // Log each video's structure
      videosData.forEach((video, index) => {
        console.log(`Video ${index}:`, {
          id: video._id,
          title: video.title,
          classId: video.classId,
          sectionId: video.sectionId,
          subject: video.subject,
          topic: video.topic
        });
      });
      
      // Check if the video we're trying to delete exists
      if (videosData.length > 0) {
        console.log('First video ID:', videosData[0]._id);
        console.log('First video full object:', videosData[0]);
      }
      
      setVideos(videosData);
    } catch (error) {
      console.error('Error fetching videos:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      setVideos([]);
    }
    setLoading(false);
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    try {
      const [classId, sectionId] = form.classSection.split('-');
      const data = {
        title: form.title,
        description: form.description,
        youtubeUrl: form.youtubeUrl,
        classId: classId,
        subject: form.subject,
        topic: form.topic
      };
      if (sectionId) data.sectionId = sectionId;
      
      await api.post('/api/teacher/youtube-videos', data);
      setMsg('Video added successfully!');
      setForm({ title: '', description: '', youtubeUrl: '', classSection: '', subject: '', topic: '' });
      fetchVideos();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add video.');
    }
    setSubmitting(false);
  };

  const handleDelete = async id => {
    console.log('=== DELETE FUNCTION CALLED ===');
    console.log('Attempting to delete video with ID:', id);
    console.log('Current videos in state:', videos);
    
    // Verify the video exists in our local state
    const videoToDelete = videos.find(v => v._id === id);
    console.log('Video to delete exists in state:', videoToDelete);
    
    if (!videoToDelete) {
      setMsg('Error: Video not found in local state. Please refresh the page.');
      console.error('Video not found in local state. Available videos:', videos);
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete "${videoToDelete.title}"?`)) return;
    
    try {
      setLoading(true);
      console.log('Sending delete request to:', `/api/teacher/youtube-videos/${id}`);
      
      // First, let's verify the video exists on the server
      try {
        const verifyRes = await api.get(`/api/teacher/youtube-videos`);
        const serverVideos = verifyRes.data.data?.videos || [];
        const videoExistsOnServer = serverVideos.find(v => v._id === id);
        console.log('Video exists on server:', !!videoExistsOnServer);
        console.log('Server videos count:', serverVideos.length);
      } catch (verifyErr) {
        console.log('Could not verify video on server:', verifyErr);
      }
      
      const response = await api.delete(`/api/teacher/youtube-videos/${id}`);
      console.log('Delete response:', response);
      
      setMsg('Video deleted successfully!');
      fetchVideos();
    } catch (err) {
      console.error('Delete error details:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      if (err.response?.status === 404) {
        setMsg('Video not found or already deleted. This might be a database sync issue.');
        console.log('404 Error - Video might not exist in database. Current videos:', videos);
      } else if (err.response?.status === 403) {
        setMsg('You do not have permission to delete this video.');
      } else if (err.response?.status === 500) {
        setMsg('Server error. Please try again later.');
      } else {
        setMsg(err.response?.data?.message || `Failed to delete video: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const openVideo = (video) => {
    setSelectedVideo(video);
    setShowPlayer(true);
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setSelectedVideo(null);
  };

  // Defensive: filter out null/undefined, non-object, or missing _id
  const safeVideos = Array.isArray(videos) ? videos.filter(video => video && typeof video === 'object' && video._id) : [];

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

      <div className="max-w-6xl mx-auto p-8 relative z-10">
                  <h1 className="text-3xl font-bold mb-6 text-purple-900 flex items-center gap-2">
                    <Youtube className="w-8 h-8 text-red-500" /> Lecture Videos
      </h1>

      {/* Professional Video Player Modal */}
      {showPlayer && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white sticky top-0 z-10">
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Youtube className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-xl font-bold truncate">{selectedVideo.title}</h2>
                  <p className="text-gray-300 text-sm">Educational Video</p>
                </div>
              </div>
              <button
                onClick={closePlayer}
                className="p-2 md:p-3 hover:bg-gray-700 rounded-full transition-all duration-200 group flex-shrink-0 ml-2"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-gray-300 group-hover:text-white" />
              </button>
            </div>

            {/* Video Container */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-6">
              <div className="relative w-full max-w-4xl lg:max-w-6xl bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
                {/* Video Player */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                    title={selectedVideo.title}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Video Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 md:p-6">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Play className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm md:text-base truncate">{selectedVideo.title}</h3>
                        <p className="text-xs md:text-sm text-gray-300">By {selectedVideo.uploadedBy?.name || 'Teacher'}</p>
                      </div>
                    </div>
                                         <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                       <button
                         onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`, '_blank')}
                         className="px-3 py-1 md:px-4 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-xs md:text-sm"
                       >
                         Open on YouTube
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Details Panel */}
            <div className="bg-white border-t border-gray-200">
              <div className="max-w-6xl mx-auto p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Description */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    {selectedVideo.description ? (
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base">{selectedVideo.description}</p>
                    ) : (
                      <p className="text-gray-500 italic text-sm md:text-base">No description available</p>
                    )}
                  </div>

                  {/* Video Metadata */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Video Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subject:</span>
                          <span className="font-medium">{selectedVideo.subject || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Topic:</span>
                          <span className="font-medium">{selectedVideo.topic || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Class:</span>
                          <span className="font-medium">{selectedVideo.classId?.name}{selectedVideo.sectionId?.name ? ` - ${selectedVideo.sectionId.name}` : ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Added:</span>
                          <span className="font-medium">{new Date(selectedVideo.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedVideo.subject && (
                          <span className="px-2 py-1 md:px-3 md:py-1 bg-blue-100 text-blue-800 text-xs md:text-sm rounded-full font-medium">
                            {selectedVideo.subject}
                          </span>
                        )}
                        {selectedVideo.topic && (
                          <span className="px-2 py-1 md:px-3 md:py-1 bg-green-100 text-green-800 text-xs md:text-sm rounded-full font-medium">
                            {selectedVideo.topic}
                          </span>
                        )}
                        {!selectedVideo.subject && !selectedVideo.topic && (
                          <span className="text-gray-500 text-xs md:text-sm">No tags available</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <button
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`, '_blank')}
                        className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Youtube className="w-4 h-4" />
                        Watch on YouTube
                      </button>
                      <button
                        onClick={() => handleDelete(selectedVideo._id)}
                        className="w-full py-2 px-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="modal-dark rounded-2xl shadow-xl border border-purple-500/30 p-8 mb-10">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-purple-400" /> Add YouTube Video
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">Title *</label>
            <input 
              type="text" 
              name="title" 
              value={form.title} 
              onChange={handleFormChange} 
              className="input-dark w-full rounded-lg" 
              required 
              placeholder="Enter video title"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">Class/Section *</label>
            <select 
              name="classSection" 
              value={form.classSection} 
              onChange={handleFormChange} 
              className="select-dark w-full rounded-lg" 
              required
            >
              <option value="">Select...</option>
              {assignments.filter(a => a && a.class && a.section).map(a => (
                <option key={a.class._id + '-' + a.section._id} value={a.class._id + '-' + a.section._id}>
                  {a.class.name} - {a.section.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">Subject</label>
            <input 
              type="text" 
              name="subject" 
              value={form.subject} 
              onChange={handleFormChange} 
              className="input-dark w-full rounded-lg" 
              placeholder="e.g., Mathematics, Science"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">Topic</label>
            <input 
              type="text" 
              name="topic" 
              value={form.topic} 
              onChange={handleFormChange} 
              className="input-dark w-full rounded-lg" 
              placeholder="e.g., Algebra, Photosynthesis"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1 text-white">YouTube URL *</label>
            <input 
              type="url" 
              name="youtubeUrl" 
              value={form.youtubeUrl} 
              onChange={handleFormChange} 
              className="input-dark w-full rounded-lg" 
              required 
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1 text-white">Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleFormChange} 
              className="input-dark w-full rounded-lg" 
              rows={3} 
              placeholder="Brief description of the video content..."
            />
          </div>
          <div className="md:col-span-2 flex gap-4 items-center">
            <button 
              type="submit" 
              className="btn-dark-primary py-3 px-6 rounded-xl font-bold shadow-lg flex items-center gap-2 text-lg transition" 
              disabled={submitting}
            >
              <Plus className="w-5 h-5" /> {submitting ? 'Adding...' : 'Add Video'}
            </button>
            {msg && <div className="text-green-400 font-semibold text-lg">{msg}</div>}
          </div>
        </form>
      </div>

      <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-purple-400" /> Uploaded Videos
      </h2>
      
      {/* Test button for debugging */}
      <div className="mb-4">
        <button
          onClick={() => {
            console.log('=== TEST BUTTON CLICKED ===');
            alert('Test button works!');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Test Button (Click to verify JavaScript is working)
        </button>
      </div>
      
      {/* Message display for operations */}
      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-center font-medium ${
          msg.includes('successfully') ? 'bg-green-900/50 text-green-300 border border-green-500/30' : 
          msg.includes('Failed') ? 'bg-red-900/50 text-red-300 border border-red-500/30' :
          'bg-blue-900/50 text-blue-300 border border-blue-500/30'
        }`}>
          {msg}
        </div>
      )}
      
      {loading ? (
                    <div className="text-center py-8 text-gray-700">Loading...</div>
      ) : safeVideos.length === 0 ? (
                  <div className="text-center py-8 text-gray-700">No videos uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeVideos.map(video => (
            <div key={video._id} className="card-purple rounded-xl shadow-lg border border-purple-500/30 overflow-hidden hover:shadow-xl transition">
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x225/cccccc/666666?text=Video+Thumbnail';
                  }}
                />
                                 <button
                   onClick={() => openVideo(video)}
                   className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-70 transition"
                 >
                   <Play className="w-16 h-16 text-white" />
                 </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">{video.title}</h3>
                {video.description && (
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{video.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  {video.subject && (
                    <span className="px-2 py-1 bg-purple-900/50 text-purple-200 text-xs rounded-full border border-purple-500/30">{video.subject}</span>
                  )}
                  {video.topic && (
                    <span className="px-2 py-1 bg-green-900/50 text-green-200 text-xs rounded-full border border-green-500/30">{video.topic}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                  <span className="font-medium">
                    {video.classId?.number ? `Class ${video.classId.number}` : video.classId?.name ? `Class ${video.classId.name}` : 'Class Not Assigned'}
                    {video.sectionId?.name ? ` - Section ${video.sectionId.name}` : ''}
                  </span>
                </div>
                <div className="flex gap-2">
                                     <button
                     onClick={() => openVideo(video)}
                     className="flex-1 py-2 px-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center gap-1"
                   >
                     <Play className="w-4 h-4" /> Watch
                   </button>
                  <button
                    onClick={() => {
                      console.log('=== DELETE BUTTON CLICKED ===');
                      console.log('Video ID:', video._id);
                      console.log('Video object:', video);
                      alert(`Delete button clicked for video: ${video._id}`);
                      handleDelete(video._id);
                    }}
                    className="py-2 px-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition border border-red-500 shadow-sm"
                    title="Delete video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  );
};

export default YouTubeVideos;
