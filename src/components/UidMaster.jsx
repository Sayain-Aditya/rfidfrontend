import React, { useState, useEffect } from 'react';

const UidMaster = () => {
  const [uids, setUids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUid, setNewUid] = useState('');
  const [editUID, setEditUID] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchUIDs();
  }, []);

  const fetchUIDs = async () => {
    try {
      const response = await fetch('/api/uid-master/view/all');
      const data = await response.json();
      if (data.success) {
        setUids(data.uids);
      }
    } catch (error) {
      console.error('Error fetching UIDs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUID = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/uid-master/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: newUid })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchUIDs();
        setNewUid('');
        setShowAddForm(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error adding UID:', error);
    }
  };

  const handleEdit = (uid) => {
    setEditUID(uid._id);
    setEditValue(uid.uid);
  };

  const handleUpdate = async (uidId) => {
    try {
      const response = await fetch(`/api/uid-master/update/${uidId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: editValue })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchUIDs();
        setEditUID(null);
        setEditValue('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error updating UID');
    }
  };

  const handleDeleteUID = async (uidId) => {
    if (confirm('Are you sure you want to delete this UID?')) {
      try {
        const response = await fetch(`/api/uid-master/delete/${uidId}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          fetchUIDs();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error deleting UID:', error);
      }
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
        <h2 className="text-2xl font-bold text-gray-900">UID Master</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add UID
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Add New UID</h3>
          <form onSubmit={handleAddUID} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">UID</label>
              <input
                type="text"
                value={newUid}
                onChange={(e) => setNewUid(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter UID"
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Add UID
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewUid('');
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
                  UID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uids.map((uid) => (
                <tr key={uid._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editUID === uid._id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="border rounded px-2 py-1 text-sm w-24"
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdate(uid._id)}
                      />
                    ) : (
                      uid.uid
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      uid.isUsed 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {uid.isUsed ? 'Used' : 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {uid.employeeName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!uid.isUsed && (
                      <>
                        {editUID === uid._id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdate(uid._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditUID(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(uid)}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUID(uid._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </>
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

export default UidMaster;