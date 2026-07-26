import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token') || null;
let user = null;
try {
  const cachedUser = localStorage.getItem('user');
  if (cachedUser && cachedUser !== 'undefined' && cachedUser !== 'null') {
    user = JSON.parse(cachedUser);
  } else {
    localStorage.removeItem('user');
  }
} catch (e) {
  localStorage.removeItem('user');
  user = null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user,
    token,
    isAuthenticated: !!token,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user || null;
      state.token = token || null;
      state.isAuthenticated = !!token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
