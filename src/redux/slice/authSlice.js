import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '../../api/api';

export const LoginUser = createAsyncThunk(
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart());
      console.log('Attempting to login with credentials:', credentials);  

      const response = await axiosInstance.post('/api/token/', credentials);
      console.log('Response from /api/token/:', response); 

      if (response.status !== 200) {
        throw new Error('Неверный логин или пароль');
      }

      const { access } = response.data;
      localStorage.setItem('accessToken', access);

      const allTeachers = await axiosInstance.get('http://127.0.0.1:8000/api/teachers/', {
        headers: { Authorization: `Bearer ${access}` },
      });

      const currentUser = allTeachers.data.find(
        (teacher) => teacher.username === credentials.username
      );

      if (!currentUser) {
        throw new Error('Пользователь не найден среди учителей');
      }

      const userInfo = await axiosInstance.get(`http://127.0.0.1:8000/api/teachers/${currentUser.id}/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      return { tokens: { access }, userInfo: userInfo?.data };
    } catch (error) {
      console.error('Error during login:', error); 
      const errorMessage = error.response ? error.response.data : error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  tokens: null,
  userInfo: null,
  loading: false,
  error: null, 
};

export const userSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.tokens = action.payload.tokens;
      state.userInfo = action.payload.userInfo;
      state.loading = false;
      state.error = null; 
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload; 
    },
    setToken: (state, action) => {
      state.tokens = action.payload;
    },
    logOut: (state) => {
      state.tokens = null;
      state.userInfo = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(LoginUser.pending, (state) => {
        state.loading = true;
        state.error = null; 
      })
      .addCase(LoginUser.fulfilled, (state, action) => {
        state.tokens = action.payload.tokens;
        state.userInfo = action.payload.userInfo;
        state.loading = false;
        state.error = null;
      })
      .addCase(LoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка при входе'; 
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, setToken, logOut } =
  userSlice.actions;

export default userSlice.reducer;
