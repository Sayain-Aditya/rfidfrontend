import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [availableUIDs, setAvailableUIDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '', uid: '', role: 'Employee' });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editUser ? `/api/user/update/${editUser._id}` : '/api/user/register';
      const method = editUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchUsers();
        fetchAvailableUIDs();
        setShowAddForm(false);
        setEditUser(null);
        setFormData({ name: '', uid: '', role: 'Employee' });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error saving user:', error);
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
    setFormData({ name: user.name, uid: user.uid, role: user.role });
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
          onClick={() => setShowAddForm(true)}
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
                required
              />
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
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
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
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
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
    </div>
  );
};

export default UserManagement;