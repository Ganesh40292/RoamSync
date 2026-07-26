import { createSlice } from '@reduxjs/toolkit';

const expenseSlice = createSlice({
  name: 'expenses',
  initialState: {
    filterCategory: 'ALL',
    searchQuery: '',
    ledgerViewMode: 'LIST', // LIST or CHART
  },
  reducers: {
    setFilterCategory: (state, action) => {
      state.filterCategory = action.payload;
    },
    setExpenseSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setLedgerViewMode: (state, action) => {
      state.ledgerViewMode = action.payload;
    },
  },
});

export const { setFilterCategory, setExpenseSearchQuery, setLedgerViewMode } = expenseSlice.actions;
export default expenseSlice.reducer;
