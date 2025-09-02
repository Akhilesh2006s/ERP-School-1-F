import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { Play, Youtube, Eye, BookOpen, Filter, X } from 'lucide-react';

const StudentYouTubeVideos = () => {
  const { token } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/teacher/student/youtube-videos');
      setVideos(res.data.videos || []);
    } catch (err) {
      setError('Failed to load videos.');
      setVideos([]);
    }
    setLoading(false);
  };

  const openVideo = async (video) => {
    // Increment view count
    try {
      await api.post(`/api/teacher/youtube-videos/${video._id}/view`);
    } catch (err) {
      console.error('Failed to increment view count:', err);
    }
    
    // Set selected video and show player
    setSelectedVideo(video);
    setShowPlayer(true);
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setSelectedVideo(null);
  };

  // Get unique subjects and topics for filtering
  const subjects = [...new Set(videos.map(v => v.subject).filter(Boolean))];
  const topics = [...new Set(videos.map(v => v.topic).filter(Boolean))];

  // Filter videos based on selected filters
  const filteredVideos = videos.filter(video => {
    if (filterSubject && video.subject !== filterSubject) return false;
    if (filterTopic && video.topic !== filterTopic) return false;
    return true;
  });

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-6xl mx-auto p-8 relative z-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-900 flex items-center gap-2">
        <Youtube className="w-8 h-8 text-red-600" /> Educational Videos
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
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`, '_blank')}
                        className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Youtube className="w-4 h-4" />
                        Watch on YouTube
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 text-blue-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" /> Filter Videos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Subject</label>
            <select 
              value={filterSubject} 
              onChange={(e) => setFilterSubject(e.target.value)}
              className="input w-full rounded-lg border-blue-200"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Topic</label>
            <select 
              value={filterTopic} 
              onChange={(e) => setFilterTopic(e.target.value)}
              className="input w-full rounded-lg border-blue-200"
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading videos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 text-lg">{error}</div>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {videos.length === 0 ? 'No videos available yet.' : 'No videos match your filters.'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> 
              {filteredVideos.length} Video{filteredVideos.length !== 1 ? 's' : ''} Available
            </h2>
            {(filterSubject || filterTopic) && (
              <button
                onClick={() => { setFilterSubject(''); setFilterTopic(''); }}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(video => (
              <div key={video._id} className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition">
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
                  <h3 className="font-bold text-lg text-blue-900 mb-2 line-clamp-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {video.subject && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{video.subject}</span>
                    )}
                    {video.topic && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{video.topic}</span>
                    )}
                  </div>
                                     <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                     <span>By {video.uploadedBy?.name || 'Teacher'}</span>
                   </div>
                  <div className="text-xs text-gray-400 mb-3">
                    Added on {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                                     <button
                     onClick={() => openVideo(video)}
                     className="w-full py-2 px-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center gap-2"
                   >
                     <Play className="w-4 h-4" /> Watch Video
                   </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default StudentYouTubeVideos;
