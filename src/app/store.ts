import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../api/baseApi';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/tasks/uiSlice';
// Side-effect imports: injectEndpoints() must run before the store is used.
import '../api/tasksApi';
import '../api/authApi';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: getDefault => getDefault().concat(baseApi.middleware),
});

setupListeners(store.dispatch); // enables refetchOnReconnect / refetchOnFocus

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
