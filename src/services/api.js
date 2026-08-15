import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'https://devlearn-backend-2mhy.onrender.com').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.userMessage = 'Le serveur est momentanément indisponible. Réessayez dans quelques secondes.';
    } else if (error.response.status >= 500) {
      error.userMessage = 'Le serveur rencontre un problème. Vérifiez le déploiement du backend.';
    }
    return Promise.reject(error);
  },
);

export default api;
