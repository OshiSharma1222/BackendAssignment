import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Toast from '../components/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Admin() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.listUsers();
      setUsers(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (u, role) => {
    try {
      await api.updateUserRole(u.id, role);
      setSuccess(`Updated ${u.email} to ${role}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (u) => {
    if (!confirm(`Delete user ${u.email}?`)) return;
    try {
      await api.deleteUser(u.id);
      setSuccess(`Deleted ${u.email}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <header className="page-header">
        <div>
          <h1>Admin – Users</h1>
          <p className="muted">Manage roles and accounts. Admin-only area.</p>
        </div>
      </header>

      <Toast type="error" message={error} onClose={() => setError('')} />
      <Toast type="success" message={success} onClose={() => setSuccess('')} />

      <section className="card">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`pill pill-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="row-actions">
                      {u.role === 'USER' ? (
                        <button className="btn btn-sm" onClick={() => changeRole(u, 'ADMIN')}>Promote</button>
                      ) : (
                        <button className="btn btn-sm" onClick={() => changeRole(u, 'USER')}>Demote</button>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => remove(u)}
                        disabled={u.id === me?.id}
                        title={u.id === me?.id ? "You can't delete yourself here" : ''}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
