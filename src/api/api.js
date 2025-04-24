import axios from 'axios';

export const Api = 'http://127.0.0.1:8000/api';

export const axiosInstance = axios.create({
  baseURL: Api,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
