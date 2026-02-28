import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token');
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register(fullName, email, password) {
  const res = await api.post('/auth/register', { fullName, email, password });
  return res.data;
}

export async function login(email, password) {
  // #region agent log
  fetch('http://127.0.0.1:7266/ingest/6c409540-0d76-4982-9db6-bbf19cf14aa4', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'a41491',
    },
    body: JSON.stringify({
      sessionId: 'a41491',
      runId: 'pre-fix',
      hypothesisId: 'H3',
      location: 'frontend/src/api.js:login:call',
      message: 'Calling /auth/login',
      data: { email },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  const res = await api.post('/auth/login', { email, password });
  const { token, user } = res.data;

  // #region agent log
  fetch('http://127.0.0.1:7266/ingest/6c409540-0d76-4982-9db6-bbf19cf14aa4', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'a41491',
    },
    body: JSON.stringify({
      sessionId: 'a41491',
      runId: 'pre-fix',
      hypothesisId: 'H3',
      location: 'frontend/src/api.js:login:response',
      message: 'Received /auth/login response',
      data: { email, role: user?.role },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  localStorage.setItem('gp_token', token);
  localStorage.setItem('gp_user', JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem('gp_token');
  localStorage.removeItem('gp_user');
}

// Admin APIs
export async function adminGetUsers(role) {
  const params = role ? { role } : {};
  const res = await api.get('/admin/users', { params });
  return res.data;
}

export async function adminCreateUser(fullName, email, password, role) {
  const res = await api.post('/admin/users', { fullName, email, password, role });
  return res.data;
}

export async function adminDeleteUser(id) {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
}

export async function adminGetStats() {
  const res = await api.get('/admin/stats');
  return res.data;
}

export async function adminGetDailyReport() {
  const res = await api.get('/admin/reports/daily');
  return res.data;
}

export async function adminGetByClientReport() {
  const res = await api.get('/admin/reports/by-client');
  return res.data;
}

export async function adminGetSummaryReport() {
  const res = await api.get('/admin/reports/summary');
  return res.data;
}

export function getCurrentUser() {
  const raw = localStorage.getItem('gp_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default api;

