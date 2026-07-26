import { createSlice } from '@reduxjs/toolkit';

const tripSlice = createSlice({
  name: 'trips',
  initialState: {
    selectedTripId: null,
    filters: {
      status: 'ALL', // ALL, ACTIVE, UPCOMING, PAST
      searchQuery: '',
    },
  },
  reducers: {
    setSelectedTripId: (state, action) => {
      state.selectedTripId = action.payload;
    },
    setTripFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTripFilters: (state) => {
      state.filters = { status: 'ALL', searchQuery: '' };
    },
  },
});

export const { setSelectedTripId, setTripFilters, clearTripFilters } = tripSlice.actions;
export default tripSlice.reducer;
