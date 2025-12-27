import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/admin');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId, action) => {
    try {
      const response = await fetch(`/api/leave/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: action.toUpperCase(),
          adminResponse: `Leave ${action} by admin`
        })
      });
      
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating leave:', error);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { stats, liveStatus, pendingLeaves, complaintStats, recentComplaints, notifications } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Header with Live Time */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100 mt-1">{formatDate(currentTime)}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold">{formatTime(currentTime)}</div>
            <div className="text-blue-100 text-sm">Live Time (IST)</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalEmployees || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.presentEmployees || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.absentEmployees || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <span className="text-2xl">🏖️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Leave</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.employeesOnLeave || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Status Cards */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Present Today ({liveStatus?.present?.length || 0})</h3>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto">
            {liveStatus?.present?.map((emp, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                  <div className="text-xs text-gray-500">{emp.uid}</div>
                </div>
                <div className="text-xs text-green-600">{emp.checkIn}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Absent Employees */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Absent Today ({liveStatus?.absent?.length || 0})</h3>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto">
            {liveStatus?.absent?.map((emp, index) => (
              <div key={index} className="flex items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                  <div className="text-xs text-gray-500">{emp.uid}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">On Leave ({liveStatus?.onLeave?.length || 0})</h3>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto">
            {liveStatus?.onLeave?.map((emp, index) => (
              <div key={index} className="py-2 border-b border-gray-100 last:border-0">
                <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                <div className="text-xs text-gray-500">{emp.reason}</div>
                <div className="text-xs text-yellow-600">{emp.startDate} to {emp.endDate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Applications */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Pending Leave Applications</h3>
            {notifications?.newLeaves > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notifications.newLeaves} New
              </span>
            )}
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            {pendingLeaves?.map((leave) => (
              <div key={leave._id} className="border border-gray-200 rounded-lg p-4 mb-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{leave.user?.name}</div>
                    <div className="text-sm text-gray-500">{leave.startDate} to {leave.endDate}</div>
                    <div className="text-sm text-gray-700 mt-1">{leave.reason}</div>
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleLeaveAction(leave._id, 'approved')}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleLeaveAction(leave._id, 'rejected')}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complaint Board */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Complaint Board Status</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{complaintStats?.new || 0}</div>
                <div className="text-sm text-gray-600">New</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{complaintStats?.inProcess || 0}</div>
                <div className="text-sm text-gray-600">In Process</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{complaintStats?.resolved || 0}</div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Recent Complaints</h4>
              {recentComplaints?.map((complaint) => (
                <div key={complaint._id} className="py-2 border-b border-gray-100 last:border-0">
                  <div className="text-sm font-medium text-gray-900">{complaint.user?.name}</div>
                  <div className="text-xs text-gray-600">{complaint.subject}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Notifications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <span className="text-2xl mr-3">📝</span>
            <div>
              <div className="font-medium text-gray-900">New Leave Applications</div>
              <div className="text-sm text-gray-600">{notifications?.newLeaves || 0} pending requests</div>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-red-50 rounded-lg">
            <span className="text-2xl mr-3">📢</span>
            <div>
              <div className="font-medium text-gray-900">New Complaints</div>
              <div className="text-sm text-gray-600">{notifications?.newComplaints || 0} unresolved issues</div>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <span className="text-2xl mr-3">🔔</span>
            <div>
              <div className="font-medium text-gray-900">System Status</div>
              <div className="text-sm text-gray-600">All systems operational</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;