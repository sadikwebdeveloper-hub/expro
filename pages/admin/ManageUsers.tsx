import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { User, AdminPermissions, AdminRole, PERMISSION_LABELS, ADMIN_ROLES, AuditLogEntry } from '../../types';

const emptyForm = {
  username: '',
  fullName: '',
  email: '',
  role: 'manager' as AdminRole,
  password: '',
  sendInvitation: true,
  forcePasswordChange: true,
};

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User> & { password?: string }>({});
  const [editPermissions, setEditPermissions] = useState<AdminPermissions>({});
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    const [admins, logs] = await Promise.all([
      backend.getAdmins().catch(() => [] as User[]),
      backend.getAuditLogs(50).catch(() => [] as AuditLogEntry[]),
    ]);
    setUsers(admins);
    setAuditLogs(logs);
  };

  useEffect(() => {
    load();
    setCurrentUser(backend.getCurrentUser());
  }, []);

  const showMsg = (text: string, isError = false) => {
    if (isError) {
      setErr(text);
      setMsg('');
    } else {
      setMsg(text);
      setErr('');
    }
    setTimeout(() => {
      setMsg('');
      setErr('');
    }, 3500);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await backend.createAdmin({
        username: form.username,
        fullName: form.fullName,
        email: form.email,
        role: form.role,
        password: form.password || undefined,
        sendInvitation: form.sendInvitation,
      });
      setForm(emptyForm);
      showMsg('Admin created. Invitation email sent if SMTP is enabled.');
      load();
    } catch (error: any) {
      showMsg(error.message || 'Failed to create admin', true);
    }
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setEditForm({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      forcePasswordChange: user.forcePasswordChange,
    });
    setEditPermissions(user.permissions || {});
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await backend.updateAdmin(editing.id, {
        ...editForm,
        permissions: editPermissions,
      });
      setEditing(null);
      showMsg('Admin updated');
      load();
    } catch (error: any) {
      showMsg(error.message || 'Update failed', true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this admin?')) return;
    try {
      await backend.deleteAdmin(id);
      showMsg('Admin deleted');
      load();
    } catch (error: any) {
      showMsg(error.message || 'Delete failed', true);
    }
  };

  const handleSuspend = async (id: number) => {
    try {
      await backend.suspendAdmin(id);
      showMsg('Admin suspended');
      load();
    } catch (error: any) {
      showMsg(error.message, true);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await backend.activateAdmin(id);
      showMsg('Admin activated');
      load();
    } catch (error: any) {
      showMsg(error.message, true);
    }
  };

  const handleResetPassword = async (id: number) => {
    if (!window.confirm('Reset password and send temporary credentials?')) return;
    try {
      await backend.resetAdminPassword(id);
      showMsg('Password reset. Temporary password sent via email if SMTP is enabled.');
      load();
    } catch (error: any) {
      showMsg(error.message, true);
    }
  };

  if (currentUser?.role !== 'super_admin') {
    return <div className="p-10 text-center text-red-500 font-bold">Access Denied. Super Admin only.</div>;
  }

  return (
    <div className="space-y-8">
      {msg && <div className="bg-green-100 text-green-700 p-3 rounded">{msg}</div>}
      {err && <div className="bg-red-100 text-red-700 p-3 rounded">{err}</div>}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm h-fit">
          <h3 className="font-bold text-xl mb-4">Create Admin</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <input required placeholder="Full Name" className="w-full border p-2 rounded" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <input required placeholder="Email" type="email" className="w-full border p-2 rounded" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input required placeholder="Username" className="w-full border p-2 rounded" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <input placeholder="Password (auto-generated if empty)" type="password" className="w-full border p-2 rounded" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="w-full border p-2 rounded" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}>
              {ADMIN_ROLES.map((role) => (
                <option key={role} value={role}>{role.replace('_', ' ')}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.sendInvitation} onChange={(e) => setForm({ ...form, sendInvitation: e.target.checked })} />
              Send invitation email
            </label>
            <button className="w-full bg-blue-600 text-white py-2 rounded font-bold">Create Admin</button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {users.map((u) => (
            <div key={u.id} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                    {u.fullName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold">
                      {u.fullName}{' '}
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{u.role.replace('_', ' ')}</span>
                      {u.status === 'suspended' && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded ml-1">Suspended</span>}
                      {u.forcePasswordChange && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded ml-1">Must change password</span>}
                    </h4>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                    {u.lastLogin && <p className="text-xs text-gray-400">Last login: {new Date(u.lastLogin).toLocaleString()}</p>}
                  </div>
                </div>
                {u.id !== currentUser?.id && (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => openEdit(u)} className="text-blue-600 bg-blue-50 px-3 py-1 rounded text-sm">Edit</button>
                    {u.status === 'suspended' ? (
                      <button onClick={() => handleActivate(u.id)} className="text-green-600 bg-green-50 px-3 py-1 rounded text-sm">Activate</button>
                    ) : (
                      <button onClick={() => handleSuspend(u.id)} className="text-orange-600 bg-orange-50 px-3 py-1 rounded text-sm">Suspend</button>
                    )}
                    <button onClick={() => handleResetPassword(u.id)} className="text-purple-600 bg-purple-50 px-3 py-1 rounded text-sm">Reset Password</button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-500 bg-red-50 px-3 py-1 rounded text-sm"><i className="fas fa-trash" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">Edit Admin — {editing.fullName}</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <input className="border p-2 rounded" placeholder="Full Name" value={editForm.fullName || ''} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
              <input className="border p-2 rounded" placeholder="Email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <input className="border p-2 rounded" placeholder="Username" value={editForm.username || ''} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
              <select className="border p-2 rounded" value={editForm.role || 'manager'} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as AdminRole })}>
                {ADMIN_ROLES.map((role) => (
                  <option key={role} value={role}>{role.replace('_', ' ')}</option>
                ))}
              </select>
              <input className="border p-2 rounded md:col-span-2" type="password" placeholder="New password (optional)" value={editForm.password || ''} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input type="checkbox" checked={Boolean(editForm.forcePasswordChange)} onChange={(e) => setEditForm({ ...editForm, forcePasswordChange: e.target.checked })} />
                Force password change on next login
              </label>
            </div>

            <h4 className="font-bold text-gray-600 mb-3">Permissions</h4>
            <div className="grid sm:grid-cols-2 gap-2 mb-6">
              {(Object.keys(PERMISSION_LABELS) as (keyof AdminPermissions)[]).map((key) => (
                <label key={key} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm">
                  <span>{PERMISSION_LABELS[key]}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(editPermissions[key])}
                    onChange={(e) => setEditPermissions({ ...editPermissions, [key]: e.target.checked })}
                  />
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={saveEdit} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Save Changes</button>
              <button onClick={() => setEditing(null)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-xl mb-4">Audit Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Admin</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">IP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-2 pr-4">{log.adminName || log.adminUsername}</td>
                  <td className="py-2 pr-4">{log.action}</td>
                  <td className="py-2 pr-4 text-gray-400">{log.ip}</td>
                </tr>
              ))}
              {!auditLogs.length && (
                <tr><td colSpan={4} className="py-4 text-gray-400 text-center">No audit logs yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
