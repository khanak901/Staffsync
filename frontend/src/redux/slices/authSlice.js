import { createSlice } from '@reduxjs/toolkit';

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem('staffsync_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const initialUser = getInitialUser();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: initialUser ? initialUser.token : null,
    isAuthenticated: !!initialUser,
    isLoading: false,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      localStorage.setItem('staffsync_user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('staffsync_user');
    },
    updateProfileSuccess: (state, action) => {
      if (state.user) {
        state.user.employeeProfile = { ...state.user.employeeProfile, ...action.payload };
        if (action.payload.avatar) {
          state.user.avatar = action.payload.avatar;
        }
        localStorage.setItem('staffsync_user', JSON.stringify(state.user));
      }
    },
  },
});

export const { setLoading, setError, loginSuccess, logout, updateProfileSuccess } = authSlice.actions;
export default authSlice.reducer;
