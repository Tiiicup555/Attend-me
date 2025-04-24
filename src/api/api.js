import axios from 'axios';

export const Api = 'http://193.46.198.101/';

export const axiosInstance = axios.create({
  baseURL: Api,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Ошибка ответа:', error.response.status);
      console.error('Ошибка данных:', error.response.data);
    } else if (error.request) {
      console.error('Ошибка запроса:', error.request);
    } else {
      console.error('Ошибка:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
