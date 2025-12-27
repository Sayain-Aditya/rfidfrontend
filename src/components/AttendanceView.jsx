import React, { useState, useEffect } from 'react';

const AttendanceView = () => {
  const [attendance, setAttendance] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState([]);
  const [view, setView] = useState('daily'); // 'daily' or 'summary'
  const [filters, setFilters] = useState({
    date: '',
    employeeId: '',
    startDate: '',
    endDate: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchUsers();
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (view === 'daily') {
      fetchAttendance();
    } else {
      fetchMonthlySummary();
    }
  }, [filters, view]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/user/view/all');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await fetch(`/api/attendance/view/filters?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAttendance(data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const params = new URLSearchParams();
      params.append('month', filters.month);
      params.append('year', filters.year);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      
      const response = await fetch(`/api/attendance/view/summary?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = view === 'daily' 
      ? attendance.map(record => ({
          Date: record.date,
          Employee: record.user?.name,
          'Check In': record.checkIn || '-',
          'Check Out': record.checkOut || '-',
          Status: getStatusText(record.status)
        }))
      : summary.map(item => ({
          Employee: item.employee?.name,
          'Total Days': item.totalWorkingDays,
          'Present Days': item.presentDays,
          'Absent Days': item.absentDays,
          'Leave Days': item.leaveDays
        }));
    
    const csv = [Object.keys(csvData[0]).join(','), ...csvData.map(row => Object.values(row).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${view}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'PRESENT': case 'OUT': return 'Present';
      case 'IN': return 'Half Day';
      case 'ABSENT': return 'Absent';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PRESENT': case 'OUT': return 'bg-green-100 text-green-800';
      case 'IN': return 'bg-yellow-100 text-yellow-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <h2 className="text-2xl font-bold text-gray-900">Attendance Monitoring</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('daily')}
            className={`px-4 py-2 rounded ${view === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Daily View
          </button>
          <button
            onClick={() => setView('summary')}
            className={`px-4 py-2 rounded ${view === 'summary' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Monthly Summary
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee</label>
            <select
              value={filters.employeeId}
              onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Employees</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          
          {view === 'daily' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date Range</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Start"
                  />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="End"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {Array.from({length: 5}, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          {view === 'daily' ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.user?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.checkIn || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.checkOut || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Working Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.map((item, index) => {
                  const attendancePercent = ((item.presentDays / item.totalWorkingDays) * 100).toFixed(1);
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.employee?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalWorkingDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{item.presentDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{item.absentDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{item.leaveDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={`${attendancePercent >= 80 ? 'text-green-600' : attendancePercent >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {attendancePercent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;