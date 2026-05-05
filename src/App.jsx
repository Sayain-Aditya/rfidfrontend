import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import UidMaster from './components/UidMaster';
import AttendanceView from './components/AttendanceView';
import EmployeeCalendar from './components/EmployeeCalendar';
import EmployeeLeaveForm from './components/EmployeeLeaveForm';
import EmployeeComplaintForm from './components/EmployeeComplaintForm';
import EmployeeNoticeBoard from './components/EmployeeNoticeBoard';
import AdminLeaveManagement from './components/AdminLeaveManagement';
import AdminComplaintManagement from './components/AdminComplaintManagement';
import AdminNoticeBoard from './components/AdminNoticeBoard';
import AdminCalendar from './components/AdminCalendar';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employeeTab, setEmployeeTab] = useState('calendar');

  useEffect(() => {
    const savedUser = localStorage.getItem('rfid_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('rfid_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rfid_user');
    setActiveTab('dashboard');
    setEmployeeTab('calendar');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Employee view - calendar, leave, and complaints
  if (user.role === 'Employee') {
    const employeeTabs = [
      { id: 'calendar', label: 'Attendance', icon: '📅' },
      { id: 'leave', label: 'Leave', icon: '🏖️' },
      { id: 'complaint', label: 'Complaints', icon: '📝' },
      { id: 'notice', label: 'Notice Board', icon: '📋' }
    ];

    const renderEmployeeContent = () => {
      switch (employeeTab) {
        case 'calendar':
          return <EmployeeCalendar user={user} />;
        case 'leave':
          return <EmployeeLeaveForm user={user} />;
        case 'complaint':
          return <EmployeeComplaintForm user={user} />;
        case 'notice':
          return <EmployeeNoticeBoard />;
        default:
          return <EmployeeCalendar user={user} />;
      }
    };

    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">🏢 RFID Attendance System</h1>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </header>
        
        <nav className="bg-white shadow-md border-b">
          <div className="flex space-x-1 p-2">
            {employeeTabs.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  employeeTab === tab.id 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setEmployeeTab(tab.id)}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
        
        <main className="p-6">
          {renderEmployeeContent()}
        </main>
      </div>
    );
  }

  // Admin view - full access
  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'uid-master', label: 'UID Master', icon: '🔑' },
    { id: 'attendance', label: 'Attendance', icon: '📋' },
    { id: 'leaves', label: 'Leaves', icon: '🏖️' },
    { id: 'complaints', label: 'Complaints', icon: '📝' },
    { id: 'notice', label: 'Notice Board', icon: '📋' },
    { id: 'calendar', label: 'Calendar', icon: '📅' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'uid-master':
        return <UidMaster />;
      case 'attendance':
        return <AttendanceView />;
      case 'leaves':
        return <AdminLeaveManagement />;
      case 'complaints':
        return <AdminComplaintManagement />;
      case 'notice':
        return <AdminNoticeBoard />;
      case 'calendar':
        return <AdminCalendar />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">🏢 RFID Attendance System</h1>
          <div className="flex items-center space-x-4">
            <span className="text-blue-100">Welcome, {user.name} (Admin)</span>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <nav className="bg-white shadow-md border-b">
        <div className="flex space-x-1 p-2">
          {adminTabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="p-6">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;