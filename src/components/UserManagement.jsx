import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [availableUIDs, setAvailableUIDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '', uid: '', role: 'Employee' });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [nextEmployeeId, setNextEmployeeId] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState(null);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');

  const fetchNextEmployeeId = async () => {
    try {
      const response = await fetch('/api/user/next-employee-id');
      const data = await response.json();
      if (data.success) {
        setNextEmployeeId(data.nextEmployeeId);
      }
    } catch (error) {
      console.error('Error fetching next employee ID:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAvailableUIDs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/user/view/all');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUIDs = async () => {
    try {
      const response = await fetch('/api/uid-master/view/available');
      const data = await response.json();
      if (data.success) {
        setAvailableUIDs(data.availableUIDs);
      }
    } catch (error) {
      console.error('Error fetching UIDs:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editUser ? `/api/user/update/${editUser._id}` : '/api/user/register';
      const method = editUser ? 'PUT' : 'POST';
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchUsers();
        fetchAvailableUIDs();
        setShowAddForm(false);
        setEditUser(null);
        setFormData({ name: '', email: '', password: '', address: '', uid: '', role: 'Employee' });
        setProfileImage(null);
        setImagePreview(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const [showUidModal, setShowUidModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUid, setSelectedUid] = useState('');

  const handleToggleStatus = async (userId, currentStatus) => {
    if (currentStatus) {
      // Deactivating user - direct toggle
      if (confirm('Are you sure you want to deactivate this user?')) {
        try {
          const response = await fetch(`/api/user/toggle-status/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          
          const data = await response.json();
          
          if (data.success) {
            fetchUsers();
          } else {
            alert(data.message);
          }
        } catch (error) {
          console.error('Error toggling user status:', error);
        }
      }
    } else {
      // Activating user - show UID selection modal
      setSelectedUserId(userId);
      setShowUidModal(true);
    }
  };

  const handleActivateUser = async () => {
    if (!selectedUid) {
      alert('Please select a UID');
      return;
    }

    try {
      const response = await fetch(`/api/user/toggle-status/${selectedUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUid: selectedUid })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchUsers();
        fetchAvailableUIDs();
        setShowUidModal(false);
        setSelectedUserId(null);
        setSelectedUid('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/user/delete/${userId}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          fetchUsers();
          fetchAvailableUIDs();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({ name: user.name, email: user.email, password: '', address: user.address, uid: user.uid, role: user.role });
    setImagePreview(user.profileImage ? `/uploads/profiles/${user.profileImage}` : null);
    setShowAddForm(true);
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
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => {
            setShowAddForm(true);
            fetchNextEmployeeId();
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add User
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">
            {editUser ? 'Edit User' : 'Add New User'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                <input
                  type="text"
                  value={nextEmployeeId}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                  disabled
                  placeholder="Auto-generated"
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required={!editUser}
                  placeholder={editUser ? 'Leave blank to keep current password' : ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows="2"
                required
              />
            </div>
            
            {!editUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700">UID</label>
                <select
                  value={formData.uid}
                  onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select UID</option>
                  {availableUIDs.map((uid) => (
                    <option key={uid._id} value={uid.uid}>
                      {uid.uid}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-20 h-20 object-cover rounded-full border"
                  />
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                {editUser ? 'Update' : 'Add'} User
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditUser(null);
                  setFormData({ name: '', email: '', password: '', address: '', uid: '', role: 'Employee' });
                  setProfileImage(null);
                  setImagePreview(null);
                  setNextEmployeeId('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showUidModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Select New UID to Activate User</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Available UIDs</label>
              <select
                value={selectedUid}
                onChange={(e) => setSelectedUid(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select UID</option>
                {availableUIDs.map((uid) => (
                  <option key={uid._id} value={uid.uid}>
                    {uid.uid}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleActivateUser}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Activate User
              </button>
              <button
                onClick={() => {
                  setShowUidModal(false);
                  setSelectedUserId(null);
                  setSelectedUid('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
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
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.profileImage ? (
                      <img
                        src={`/uploads/profiles/${user.profileImage}`}
                        alt={user.name}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {user.employeeId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.uid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.isActive !== false}
                        onChange={() => handleToggleStatus(user._id, user.isActive !== false)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setPasswordUserId(user._id);
                        setPasswordData({ oldPassword: '', newPassword: '' });
                        setPasswordMsg('');
                        setShowPasswordModal(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Password
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Old Password</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              {passwordMsg && (
                <p className={`text-sm ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMsg}
                </p>
              )}
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/user/change-password/${passwordUserId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(passwordData)
                    });
                    const data = await response.json();
                    setPasswordMsg(data.message);
                    if (data.success) setTimeout(() => setShowPasswordModal(false), 1500);
                  } catch (error) {
                    setPasswordMsg('Something went wrong');
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Change
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;