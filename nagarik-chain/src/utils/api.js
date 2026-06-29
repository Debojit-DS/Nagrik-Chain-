import axios from 'axios';

const API_BASE_URL = 'https://nagarikchain-backend.onrender.com/api/v1';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nagarik_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nagarik_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
