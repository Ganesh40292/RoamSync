import { createSlice } from '@reduxjs/toolkit';

const plannerSlice = createSlice({
  name: 'planner',
  initialState: {
    lastGeneratedItinerary: null,
    isGenerating: false,
    activeDayFilter: 1,
  },
  reducers: {
    setLastGeneratedItinerary: (state, action) => {
      state.lastGeneratedItinerary = action.payload;
    },
    setGenerating: (state, action) => {
      state.isGenerating = action.payload;
    },
    setActiveDayFilter: (state, action) => {
      state.activeDayFilter = action.payload;
    },
    clearPlannerState: (state) => {
      state.lastGeneratedItinerary = null;
      state.activeDayFilter = 1;
    },
  },
});

export const { setLastGeneratedItinerary, setGenerating, setActiveDayFilter, clearPlannerState } = plannerSlice.actions;
export default plannerSlice.reducer;
