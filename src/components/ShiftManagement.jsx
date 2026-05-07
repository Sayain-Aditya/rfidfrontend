import React, { useState, useEffect } from 'react';

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editShift, setEditShift] = useState(null);
  const [formData, setFormData] = useState({ shiftName: '', startTime: '', endTime: '', graceMinutes: 15, minimumHours: 4 });
  const [assignData, setAssignData] = useState({ userId: '', shiftId: '' });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchShifts();
    fetchUsers();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await fetch('/api/shift/get');
      const data = await res.json();
      if (data.success) setShifts(data.shifts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/user/view/all?role=Employee&limit=200');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editShift ? `/api/shift/${editShift._id}` : '/api/shift/create';
    const method = editShift ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        fetchShifts();
        setShowForm(false);
        setEditShift(null);
        setFormData({ shiftName: '', startTime: '', endTime: '', graceMinutes: 15, minimumHours: 4 });
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (shiftId) => {
    if (!confirm('Delete this shift? It will be unassigned from all employees.')) return;
    try {
      const res = await fetch(`/api/shift/${shiftId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchShifts();
      else alert(data.message);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssign = async () => {
    if (!assignData.userId) { alert('Select an employee'); return; }
    try {
      const res = await fetch('/api/shift/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignData)
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchUsers();
        setTimeout(() => { setShowAssignModal(false); setMsg(''); setAssignData({ userId: '', shiftId: '' }); }, 1500);
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Shift Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Assign Shift
          </button>
          <button
            onClick={() => { setShowForm(true); setEditShift(null); setFormData({ shiftName: '', startTime: '', endTime: '', graceMinutes: 15, minimumHours: 4 }); }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Create Shift
          </button>
        </div>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">{editShift ? 'Edit Shift' : 'Create New Shift'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Shift Name</label>
                <input
                  type="text"
                  value={formData.shiftName}
                  onChange={(e) => setFormData({ ...formData, shiftName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g. Morning Shift"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Grace Minutes</label>
                <input
                  type="number"
                  value={formData.graceMinutes}
                  onChange={(e) => setFormData({ ...formData, graceMinutes: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Hours</label>
                <input
                  type="number"
                  value={formData.minimumHours}
                  onChange={(e) => setFormData({ ...formData, minimumHours: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  min="1"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                {editShift ? 'Update' : 'Create'} Shift
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditShift(null); }} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Shift Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Assign Shift to Employee</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee</label>
                <select
                  value={assignData.userId}
                  onChange={(e) => setAssignData({ ...assignData, userId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Employee</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.employeeId} - {u.name} {u.currentShift ? '(has shift)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Shift</label>
                <select
                  value={assignData.shiftId}
                  onChange={(e) => setAssignData({ ...assignData, shiftId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">-- No Shift (Unassign) --</option>
                  {shifts.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.shiftName} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>
              {msg && <p className="text-green-600 text-sm">{msg}</p>}
            </div>
            <div className="flex space-x-2 mt-4">
              <button onClick={handleAssign} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                Assign
              </button>
              <button onClick={() => { setShowAssignModal(false); setAssignData({ userId: '', shiftId: '' }); setMsg(''); }} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shifts Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Shifts ({shifts.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grace (min)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shifts.map(shift => {
                const assignedUsers = users.filter(u => u.currentShift === shift._id || u.currentShift?._id === shift._id);
                return (
                  <tr key={shift._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{shift.shiftName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{shift.startTime}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{shift.endTime}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{shift.graceMinutes}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{shift.minimumHours}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {assignedUsers.length > 0
                        ? assignedUsers.map(u => u.name).join(', ')
                        : <span className="text-gray-400">None</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => { setEditShift(shift); setFormData({ shiftName: shift.shiftName, startTime: shift.startTime, endTime: shift.endTime, graceMinutes: shift.graceMinutes, minimumHours: shift.minimumHours }); setShowForm(true); }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(shift._id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {shifts.length === 0 && (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No shifts created yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employees with Shifts */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Employee Shift Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Shift</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(u => {
                const shift = shifts.find(s => s._id === u.currentShift || s._id === u.currentShift?._id);
                return (
                  <tr key={u._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.employeeId}</td>
                    <td className="px-6 py-4 text-sm">
                      {shift
                        ? <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{shift.shiftName} ({shift.startTime} - {shift.endTime})</span>
                        : <span className="text-gray-400">Not Assigned</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShiftManagement;
