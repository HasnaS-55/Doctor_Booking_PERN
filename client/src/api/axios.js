import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

// optional: handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // simple redirect
      if (!window.location.pathname.startsWith('/doctor')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
