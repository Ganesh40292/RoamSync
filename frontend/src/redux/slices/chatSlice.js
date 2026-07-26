import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    connectionStatus: 'DISCONNECTED', // DISCONNECTED, CONNECTING, CONNECTED
    activeRoomId: null,
    unreadCounts: {}, // tripId -> count
  },
  reducers: {
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    setActiveRoomId: (state, action) => {
      state.activeRoomId = action.payload;
      if (action.payload) {
        state.unreadCounts[action.payload] = 0;
      }
    },
    incrementUnreadCount: (state, action) => {
      const tripId = action.payload;
      if (state.activeRoomId !== tripId) {
        state.unreadCounts[tripId] = (state.unreadCounts[tripId] || 0) + 1;
      }
    },
    clearUnreadCount: (state, action) => {
      state.unreadCounts[action.payload] = 0;
    },
  },
});

export const { setConnectionStatus, setActiveRoomId, incrementUnreadCount, clearUnreadCount } = chatSlice.actions;
export default chatSlice.reducer;
