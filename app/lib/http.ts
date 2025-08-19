import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';

export const http = axios.create({
  baseURL,
  withCredentials: false,
});

function getTokens() {
  const access = localStorage.getItem('access_token') || '';
  const refresh = localStorage.getItem('refresh_token') || '';
  return { access, refresh };
}

function setAccessToken(token: string) {
  localStorage.setItem('access_token', token);
}

http.interceptors.request.use((config) => {
  const { access } = getTokens();
  if (access) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${access}`;
  }
  return config;
});

let isRefreshing = false;
let queue: { resolve: (v?: unknown)=>void; reject: (e: any)=>void }[] = [];

async function refreshToken() {
  const { refresh } = getTokens();
  if (!refresh) throw new Error('No refresh token');

  const resp = await axios.post(`${baseURL}login/refresh/`, { refresh });
  const newAccess = resp.data?.access;
  if (!newAccess) throw new Error('No access token in refresh response');
  setAccessToken(newAccess);
  return newAccess;
}

http.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // file d’attente pendant le refresh
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        })
          .then(() => {
            original._retry = true;
            return http(original);
          })
          .catch(Promise.reject);
      }
      try {
        isRefreshing = true;
        const token = await refreshToken();
        queue.forEach(p => p.resolve(token));
        queue = [];
        isRefreshing = false;

        original._retry = true;
        return http(original);
      } catch (e) {
        queue.forEach(p => p.reject(e));
        queue = [];
        isRefreshing = false;
        // déconnexion côté client
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);