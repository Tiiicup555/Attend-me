import { axiosInstance } from '../../api/api';
import { toast } from 'react-toastify';
import { loginFailure, loginStart, loginSuccess } from './authSlice';

export const loginFetch = (body, url, navigate) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const res = await axiosInstance.post(`${url}`, body);
    const { access, refresh } = res.data;
    localStorage.setItem('token', access);
    const userInfo = await axiosInstance.get('accounts/profile/', {
      headers: { Authorization: `Bearer ${access}` },
    });
    toast.success('Вы успешно вошли в аккаунт!');
    dispatch(
      loginSuccess({ tokens: { access, refresh }, userInfo: userInfo?.data })
    );
    navigate('/');
  } catch (error) {
    dispatch(loginFailure());
    toast.error('Неверный логин или пароль!');
  }
};
