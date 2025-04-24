import { axiosInstance } from '../../api/api';
import { toast } from 'react-toastify';
import { authStart, authSuccess, authFailure } from './authSlice';

export const authFetch = (credentials, navigate) => async (dispatch) => {
  dispatch(authStart());

  try {
    const res = await axiosInstance.post('/api/token/', credentials);
    const { access, refresh } = res.data;

    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);

    const teachersRes = await axiosInstance.get('/api/teachers/');

    const userInfo = teachersRes.data.find(
      (teacher) => teacher.username === credentials.username
    );

    if (!userInfo) {
      throw new Error('Пользователь не найден');
    }
    dispatch(authSuccess({ tokens: { access, refresh }, userInfo }));
    toast.success('Успешная авторизация!');
    navigate('/');
  } catch (error) {
    dispatch(authFailure());
    toast.error('Ошибка авторизации!');
    console.error('Auth error:', error);
  }
};
