import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import Toast from '../components/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const empty = { title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' };

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: 1, limit: 10 });
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.listTasks(filters);
      setTasks(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm(empty);
    setEditingId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      title: form.title,
      description: form.description || null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };
    try {
      if (editingId) {
        await api.updateTask(editingId, payload);
        setSuccess('Task updated');
      } else {
        await api.createTask(payload);
        setSuccess('Task created');
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.details?.[0]?.message || err.message);
    }
  };

  const onEdit = (t) => {
    setEditingId(t.id);
    setForm({
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.deleteTask(id);
      setSuccess('Task deleted');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <header className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p className="muted">
            Signed in as <strong>{user?.name}</strong> ({user?.role}).
            {user?.role === 'ADMIN' && ' As an admin you can see tasks from all users.'}
          </p>
        </div>
      </header>

      <Toast type="error" message={error} onClose={() => setError('')} />
      <Toast type="success" message={success} onClose={() => setSuccess('')} />

      <section className="card">
        <h2>{editingId ? 'Edit task' : 'Create a new task'}</h2>
        <form onSubmit={onSubmit} className="grid-form">
          <label className="col-2">
            Title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              maxLength={160}
            />
          </label>
          <label className="col-2">
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              maxLength={2000}
            />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>PENDING</option>
              <option>IN_PROGRESS</option>
              <option>DONE</option>
            </select>
          </label>
          <label>
            Priority
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
            </select>
          </label>
          <label>
            Due date
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </label>
          <div className="form-actions col-2">
            <button className="btn btn-primary" type="submit">
              {editingId ? 'Save changes' : 'Create task'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="filters">
          <input
            placeholder="Search title/description..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          >
            <option value="">All statuses</option>
            <option>PENDING</option>
            <option>IN_PROGRESS</option>
            <option>DONE</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
          >
            <option value="">All priorities</option>
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
          </select>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="muted">No tasks yet. Create your first task above.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due</th>
                  {user?.role === 'ADMIN' && <th>Owner</th>}
                  <th />
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.title}</strong>
                      {t.description && <div className="muted small">{t.description}</div>}
                    </td>
                    <td><span className={`pill pill-${t.status.toLowerCase()}`}>{t.status}</span></td>
                    <td><span className={`pill pill-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                    <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    {user?.role === 'ADMIN' && <td>{t.owner?.email}</td>}
                    <td className="row-actions">
                      <button className="btn btn-sm" onClick={() => onEdit(t)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => onDelete(t.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <button
            className="btn btn-ghost btn-sm"
            disabled={meta.page <= 1}
            onClick={() => setFilters({ ...filters, page: meta.page - 1 })}
          >
            Prev
          </button>
          <span className="muted small">
            Page {meta.page} of {meta.totalPages} · {meta.total} tasks
          </span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => setFilters({ ...filters, page: meta.page + 1 })}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
