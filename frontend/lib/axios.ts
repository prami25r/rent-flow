import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: false,
});

function getToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )rf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.error ??
      err?.message ??
      'Unexpected error';
    return Promise.reject({ status, message });
  }
);

export { api };
