import { axiosInstance } from '../../api/api';
import { toast } from 'react-toastify';
import { loginFailure, loginStart, loginSuccess } from './authSlice';

export const loginFetch = (body, url, navigate) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const res = await axiosInstance.post(`${url}`, body);
    const { access, refresh } = res.data;

    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);

    const allTeachers = await axiosInstance.get(`/api/teachers/`, {
      headers: { Authorization: `Bearer ${access}` },
    });

    const currentUser = allTeachers.data.find(
      (teacher) => teacher.username === body.username
    );

    if (!currentUser) {
      throw new Error('Пользователь не найден среди учителей');
    }

    const userInfo = await axiosInstance.get(`/api/teachers/${currentUser.id}/`, {
      headers: { Authorization: `Bearer ${access}` },
    });

    toast.success('Вы успешно вошли в аккаунт!');
    dispatch(
      loginSuccess({ tokens: { access, refresh }, userInfo: userInfo?.data })
    );
    navigate('/');
  } catch (error) {
    console.error(error);
    dispatch(loginFailure());
    toast.error('Неверный логин или пароль!');
  }
};
