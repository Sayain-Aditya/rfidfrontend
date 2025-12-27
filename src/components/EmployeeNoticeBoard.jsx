import React, { useState, useEffect } from 'react';

const EmployeeNoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notice');
      const data = await response.json();
      if (data.success) {
        setNotices(data.notices);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'URGENT':
        return '🚨';
      case 'HIGH':
        return '⚠️';
      case 'MEDIUM':
        return '📢';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold">📋 Notice Board</h2>
        <p className="text-blue-100">Stay updated with company announcements</p>
      </div>

      {notices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Notices Available</h3>
          <p className="text-gray-600">Check back later for new announcements</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notices.map((notice) => (
            <div key={notice._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`h-2 ${
                notice.priority === 'URGENT' ? 'bg-red-500' :
                notice.priority === 'HIGH' ? 'bg-orange-500' :
                notice.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{getPriorityIcon(notice.priority)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{notice.title}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-base leading-relaxed mb-4">{notice.content}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center space-x-1">
                        <span>👤</span>
                        <span>Posted by {notice.createdBy?.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📅</span>
                        <span>{new Date(notice.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>🕒</span>
                        <span>{new Date(notice.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeNoticeBoard;