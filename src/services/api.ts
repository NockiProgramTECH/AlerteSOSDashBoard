import axios from 'axios';

const BASE_URL = "https://alertesos.onrender.com";

// Instance Axios principale avec intercepteur JWT
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur : ajoute le token Bearer à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur réponse : gestion expiration token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${BASE_URL}/api/users/login/refresh/`, { refresh });
        localStorage.setItem('access_token', data.access);
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Endpoints ─────────────────────────────────────────
export const authService = {
  login: (username: string, password: string) =>
    api.post('/api/users/login/', { username, password }),
  getMe: () => api.get('/api/users/me/'),
};

export const alertService = {
  getAll: () => api.get('/api/users/dashboard/alerts/'),
  getById: (id: number) => api.get(`/api/users/dashboard/alerts/${id}/`),
  assign: (id: number, agent_id: number) =>
    api.post(`/api/users/dashboard/alerts/${id}/assign/`, { agent_id }),
};

export const agentService = {
  getAll: () => api.get('/api/users/dashboard/agents/'),
};
