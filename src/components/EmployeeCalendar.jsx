import React, { useState, useEffect } from 'react';

const EmployeeCalendar = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth]);

  const fetchAttendance = async () => {
    try {
      const month = currentMonth.toISOString().slice(0, 7);
      const response = await fetch(`/api/attendance/view/monthly?month=${month}`);
      const data = await response.json();
      
      if (data.success) {
        const userAttendance = data.summary.find(s => s.user._id === user._id);
        if (userAttendance) {
          setAttendance(userAttendance.records);
          setStats({
            present: userAttendance.presentDays,
            absent: userAttendance.absentDays,
            total: userAttendance.totalDays
          });
        } else {
          setAttendance([]);
          setStats({ present: 0, absent: 0, total: 0 });
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getAttendanceForDate = (day) => {
    if (!day) return null;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendance.find(a => a.date === dateStr);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
      case 'OUT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-blue-100">UID: {user.uid}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <span className="text-2xl text-green-600">✅</span>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present Days</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.present}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <span className="text-2xl text-red-600">❌</span>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent Days</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.absent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <span className="text-2xl text-blue-600">📊</span>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Attendance Calendar</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ←
            </button>
            <span className="font-medium text-gray-900">{formatMonth(currentMonth)}</span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              →
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const attendanceRecord = getAttendanceForDate(day);
              
              return (
                <div key={index} className="aspect-square">
                  {day ? (
                    <div className={`w-full h-full border-2 rounded-lg p-2 ${
                      attendanceRecord 
                        ? getStatusColor(attendanceRecord.status)
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-sm font-medium">{day}</div>
                      {attendanceRecord && (
                        <div className="text-xs mt-1">
                          <div>{attendanceRecord.checkIn}</div>
                          {attendanceRecord.checkOut && (
                            <div>{attendanceRecord.checkOut}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded"></div>
            <span className="text-sm text-gray-700">Present</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-200 rounded"></div>
            <span className="text-sm text-gray-700">Checked In</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded"></div>
            <span className="text-sm text-gray-700">Absent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded"></div>
            <span className="text-sm text-gray-700">No Record</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCalendar;