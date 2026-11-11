import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${BACKEND_URL.replace(/\/+$/, '')}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Fetch Laravel Sanctum CSRF cookie before authentication calls
 */
export async function getCsrfCookie(): Promise<void> {
  await axios.get(`${BACKEND_URL.replace(/\/+$/, '')}/sanctum/csrf-cookie`, {
    withCredentials: true,
    withXSRFToken: true,
  });
}

// Response interceptor: handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
