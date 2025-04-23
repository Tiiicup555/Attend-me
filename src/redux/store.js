import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import userSlice from './slice/authSlice';
import teachersReducer from '../redux/slice/teachers-slice';
import persistReducer from 'redux-persist/es/persistReducer';
import persistStore from 'redux-persist/es/persistStore';

const persistConfig = {
  key: 'userSlice',
  storage,
  whitelist: ['userInfo', 'tokens'],
};

const persistedUserReducer = persistReducer(persistConfig, userSlice);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    teachers: teachersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export const getState = store.getState;
