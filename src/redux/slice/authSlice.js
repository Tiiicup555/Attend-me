import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '../../api/api';

export const loginUser = createAsyncThunk(
  'userInfo/loginUser',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart());
      const response = await axiosInstance.post('/teacher_api/login/teacher/', credentials);
      dispatch(loginSuccess(response.data));
      return response.data;
    } catch (error) {
      dispatch(loginFailure());
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  tokens: null,
  userInfo: null,
  loading: false,
  error: false,
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
      state.error = false;
    },
    loginFailure: (state) => {
      state.loading = false;
      state.error = true;
    },
    setToken: (state, action) => {
      state.tokens = action.payload;
    },
    logOut: (state) => {
      state.tokens = null;
      state.userInfo = null;
      state.loading = false;
      state.error = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.tokens = action.payload.tokens;
        state.userInfo = action.payload.userInfo;
        state.loading = false;
        state.error = false;
      })
      .addCase(loginUser.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, setToken, logOut } =
  userSlice.actions;

export default userSlice.reducer;

