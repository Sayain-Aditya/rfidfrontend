import React, { useState, useEffect } from 'react';

const AdminComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/complaint/get');
      const data = await response.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, status, adminResponse = '') => {
    try {
      const response = await fetch(`/api/complaint/${complaintId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminResponse })
      });

      const data = await response.json();

      if (data.success) {
        fetchComplaints();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error updating complaint status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
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
      <h2 className="text-2xl font-bold text-gray-900">Complaint Management</h2>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {complaint.user?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {complaint.user?.uid}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {complaint.subject}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {complaint.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {complaint.status === 'OPEN' && (
                      <button
                        onClick={() => updateComplaintStatus(complaint._id, 'IN_PROGRESS')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        In Progress
                      </button>
                    )}
                    {complaint.status !== 'RESOLVED' && (
                      <button
                        onClick={() => updateComplaintStatus(complaint._id, 'RESOLVED', 'Issue resolved by admin')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaintManagement;