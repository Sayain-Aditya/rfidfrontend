import React, { useState, useEffect } from 'react';

const AdminNoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'MEDIUM'
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/notice/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: JSON.parse(localStorage.getItem('rfid_user'))._id
        })
      });

      const data = await response.json();

      if (data.success) {
        fetchNotices();
        setFormData({ title: '', content: '', priority: 'MEDIUM' });
        setShowForm(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error creating notice');
    }
  };

  const handleDelete = async (noticeId) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      try {
        const response = await fetch(`/api/notice/${noticeId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchNotices();
        }
      } catch (error) {
        alert('Error deleting notice');
      }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Notice Board Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          📝 Create Notice
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Create New Notice</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Create Notice
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', content: '', priority: 'MEDIUM' });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {notices.map((notice) => (
          <div key={notice._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(notice.priority)}`}>
                    {notice.priority}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{notice.content}</p>
                <div className="text-sm text-gray-500">
                  Posted by {notice.createdBy?.name} • {new Date(notice.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(notice._id)}
                className="text-red-600 hover:text-red-900 ml-4"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNoticeBoard;