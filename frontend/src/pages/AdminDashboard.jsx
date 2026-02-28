import React, { useEffect, useState } from 'react';
import {
  adminGetUsers,
  adminCreateUser,
  adminDeleteUser,
  adminGetStats,
  adminGetDailyReport,
  adminGetByClientReport,
  adminGetSummaryReport,
  getCurrentUser,
} from '../api';

const MANAGED_ROLES = ['STORE_MANAGER', 'DIRECTOR', 'SECURITY'];

function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [dailyReport, setDailyReport] = useState([]);
  const [byClientReport, setByClientReport] = useState([]);
  const [summaryReport, setSummaryReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'STORE_MANAGER',
  });
  const [creating, setCreating] = useState(false);

  const currentUser = getCurrentUser();

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminGetUsers(roleFilter || undefined);
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminGetStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const [daily, byClient, summary] = await Promise.all([
        adminGetDailyReport(),
        adminGetByClientReport(),
        adminGetSummaryReport(),
      ]);
      setDailyReport(daily);
      setByClientReport(byClient);
      setSummaryReport(summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else if (tab === 'analytics') loadStats();
    else if (tab === 'reports') loadReports();
  }, [tab, roleFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await adminCreateUser(
        createForm.fullName,
        createForm.email,
        createForm.password,
        createForm.role
      );
      setCreateForm({ fullName: '', email: '', password: '', role: 'STORE_MANAGER' });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminDeleteUser(id);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h5 fw-semibold mb-0">Admin Dashboard</h2>
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-sm ${tab === 'users' ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setTab('users')}
          >
            User Management
          </button>
          <button
            type="button"
            className={`btn btn-sm ${tab === 'analytics' ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setTab('analytics')}
          >
            Analytics
          </button>
          <button
            type="button"
            className={`btn btn-sm ${tab === 'reports' ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setTab('reports')}
          >
            Reports
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible py-2 small" role="alert">
          {error}
          <button type="button" className="btn-close btn-sm" onClick={() => setError('')} aria-label="Close" />
        </div>
      )}

      {tab === 'users' && (
        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="h6 fw-semibold mb-3">Create User</h3>
                <p className="text-muted small mb-2">
                  Add Store Manager, Director, or Security users.
                </p>
                <form onSubmit={handleCreateUser}>
                  <div className="mb-2">
                    <label className="form-label small">Full Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={createForm.fullName}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, fullName: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Password</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, password: e.target.value }))
                      }
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Role</label>
                    <select
                      className="form-select form-select-sm"
                      value={createForm.role}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, role: e.target.value }))
                      }
                    >
                      {MANAGED_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={creating} className="btn btn-dark btn-sm w-100">
                    {creating ? 'Creating...' : 'Create User'}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-semibold mb-0">All Users</h3>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 'auto' }}
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All roles</option>
                    <option value="CLIENT">Client</option>
                    <option value="STORE_MANAGER">Store Manager</option>
                    <option value="DIRECTOR">Director</option>
                    <option value="SECURITY">Security</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                {loading && <div className="small text-muted">Loading...</div>}
                {!loading && (
                  <div className="table-responsive">
                    <table className="table table-sm small">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td>{u.fullName}</td>
                            <td>{u.email}</td>
                            <td>
                              <span className="badge bg-secondary">{u.role}</span>
                            </td>
                            <td>
                              {u.role !== 'ADMIN' &&
                              u.role !== 'CLIENT' &&
                              u.id !== currentUser?.id ? (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm py-0"
                                  onClick={() => handleDeleteUser(u.id)}
                                >
                                  Delete
                                </button>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="row g-3">
          {stats && (
            <>
              <div className="col-md-3">
                <div className="card shadow-sm border-primary">
                  <div className="card-body py-3">
                    <div className="small text-muted">Total Gate Passes</div>
                    <div className="fs-4 fw-bold">{stats.total}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm">
                  <div className="card-body py-3">
                    <div className="small text-muted">Last 30 Days</div>
                    <div className="fs-4 fw-bold">{stats.last30Days}</div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h4 className="h6 mb-3">By Status</h4>
                    <div className="row g-2">
                      {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                        <div key={status} className="col-md-2">
                          <div className="border rounded p-2 small">
                            <span className="d-block text-muted">{status}</span>
                            <span className="fw-bold">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h4 className="h6 mb-3">By Type</h4>
                    <div className="d-flex gap-3">
                      <div>
                        Material:{' '}
                        <span className="fw-bold">{stats.byType?.MATERIAL || 0}</span>
                      </div>
                      <div>
                        Human Resource:{' '}
                        <span className="fw-bold">{stats.byType?.HUMAN_RESOURCE || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {!stats && !loading && <div className="small text-muted">No data yet</div>}
        </div>
      )}

      {tab === 'reports' && (
        <div className="row g-3">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="h6 mb-3">Gate Passes by Client</h4>
                {loading && <div className="small text-muted">Loading...</div>}
                {!loading && byClientReport.length === 0 && (
                  <div className="small text-muted">No data</div>
                )}
                {!loading && byClientReport.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-sm small">
                      <thead className="table-light">
                        <tr>
                          <th>Client</th>
                          <th>Email</th>
                          <th>Total Requests</th>
                          <th>Approved</th>
                          <th>Returned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {byClientReport.map((r, i) => (
                          <tr key={i}>
                            <td>{r.full_name}</td>
                            <td>{r.email}</td>
                            <td>{r.total_requests}</td>
                            <td>{r.approved}</td>
                            <td>{r.returned}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="h6 mb-3">Status Summary (by Type)</h4>
                {!loading && summaryReport.length === 0 && (
                  <div className="small text-muted">No data</div>
                )}
                {!loading && summaryReport.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-sm small">
                      <thead className="table-light">
                        <tr>
                          <th>Status</th>
                          <th>Type</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summaryReport.map((r, i) => (
                          <tr key={i}>
                            <td>{r.status}</td>
                            <td>{r.type}</td>
                            <td>{r.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="h6 mb-3">Daily Activity (Last 30 Days)</h4>
                {!loading && dailyReport.length === 0 && (
                  <div className="small text-muted">No data</div>
                )}
                {!loading && dailyReport.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-sm small">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyReport.map((r, i) => (
                          <tr key={i}>
                            <td>{r.date}</td>
                            <td>{r.type}</td>
                            <td>{r.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
