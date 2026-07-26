import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    activeTab: 'METRICS', // METRICS, USERS, TRIPS
  },
  reducers: {
    setAdminActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setAdminActiveTab } = adminSlice.actions;
export default adminSlice.reducer;
