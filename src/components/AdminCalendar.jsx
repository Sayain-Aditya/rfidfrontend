import React, { useState, useEffect } from 'react';

const AdminCalendar = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ present: 0, absent: 0, leave: 0 });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) fetchData();
  }, [selectedUser, currentMonth]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/user/view/all?role=Employee&limit=200');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAttendance(), fetchLeaves()]);
    setLoading(false);
  };

  const fetchAttendance = async () => {
    try {
      const month = currentMonth.toISOString().slice(0, 7);
      const res = await fetch(`/api/attendance/view/monthly?month=${month}`);
      const data = await res.json();
      if (data.success) {
        const found = data.summary.find(s => s.user._id === selectedUser);
        if (found) {
          setAttendance(found.records);
          setStats(prev => ({ ...prev, present: found.presentDays, absent: found.absentDays }));
        } else {
          setAttendance([]);
          setStats(prev => ({ ...prev, present: 0, absent: 0 }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await fetch(`/api/leave/get?userId=${selectedUser}`);
      const data = await res.json();
      if (data.success) {
        const approved = data.data.filter(l => l.status === 'APPROVED');
        setLeaves(approved);
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        let leaveDays = 0;
        approved.forEach(l => {
          const start = new Date(l.startDate);
          const end = new Date(l.endDate);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (d.toISOString().slice(0, 7) === `${year}-${month}`) leaveDays++;
          }
        });
        setStats(prev => ({ ...prev, leave: leaveDays }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getLeaveForDate = (day) => {
    if (!day) return null;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return leaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate) || null;
  };

  const getAttendanceForDate = (day) => {
    if (!day) return null;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendance.find(a => a.date === dateStr) || null;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  };

  const getCellStyle = (day) => {
    const leave = getLeaveForDate(day);
    if (leave) return 'bg-blue-100 text-blue-800 border-blue-300';
    const att = getAttendanceForDate(day);
    if (!att) return 'bg-gray-50 border-gray-200';
    switch (att.status) {
      case 'PRESENT':
      case 'OUT': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ABSENT': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const navigateMonth = (dir) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + dir);
    setCurrentMonth(d);
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedUserObj = users.find(u => u._id === selectedUser);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Employee Calendar</h2>
      </div>

      {/* Employee Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full md:w-80 border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">-- Select Employee --</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>
              {u.employeeId} - {u.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedUser && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-400">
          <p className="text-lg">Select an employee to view their calendar</p>
        </div>
      )}

      {selectedUser && (
        <>
          {/* Employee Info */}
          {selectedUserObj && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl font-bold">
                {selectedUserObj.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-lg">{selectedUserObj.name}</p>
                <p className="text-blue-100 text-sm">{selectedUserObj.employeeId} • UID: {selectedUserObj.uid}</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.present}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.absent}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.leave}</p>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Attendance Calendar</h3>
              <div className="flex items-center space-x-4">
                <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">←</button>
                <span className="font-medium text-gray-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">→</button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {weekDays.map(d => (
                      <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((day, index) => {
                      const leave = getLeaveForDate(day);
                      const att = getAttendanceForDate(day);
                      return (
                        <div key={index} className="aspect-square">
                          {day ? (
                            <div className={`w-full h-full border-2 rounded-lg p-1 ${getCellStyle(day)}`}>
                              <div className="text-sm font-medium">{day}</div>
                              {leave && <div className="text-xs mt-1">🏖️ Leave</div>}
                              {!leave && att && (
                                <div className="text-xs mt-1">
                                  <div>{att.checkIn}</div>
                                  {att.checkOut && <div>{att.checkOut}</div>}
                                </div>
                              )}
                            </div>
                          ) : <div></div>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg shadow-md p-4">
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
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
                <span className="text-sm text-gray-700">On Leave</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCalendar;
