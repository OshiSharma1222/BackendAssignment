const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const TOKEN_KEY = 'auth_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let json = null;
  try {
    json = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    const message = json?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = json?.error?.details;
    throw err;
  }
  return json;
}

export const api = {
  register: (payload) => apiFetch('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => apiFetch('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => apiFetch('/auth/me'),

  listTasks: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    ).toString();
    return apiFetch(`/tasks${qs ? `?${qs}` : ''}`);
  },
  createTask: (payload) => apiFetch('/tasks', { method: 'POST', body: payload }),
  updateTask: (id, payload) => apiFetch(`/tasks/${id}`, { method: 'PATCH', body: payload }),
  deleteTask: (id) => apiFetch(`/tasks/${id}`, { method: 'DELETE' }),

  listUsers: () => apiFetch('/users'),
  updateUserRole: (id, role) => apiFetch(`/users/${id}/role`, { method: 'PATCH', body: { role } }),
  deleteUser: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};
