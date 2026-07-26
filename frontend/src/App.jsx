import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import AppRoutes from './routes/AppRoutes';
import { setCredentials } from './redux/slices/authSlice';
import storage from './utils/localStorage';
import { ToastProvider } from './components/Common/ToastNotification';
import CommandPalette from './components/Common/CommandPalette';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = storage.get('user');
    if (token && user) {
      dispatch(setCredentials({ token, user }));
    }
  }, [dispatch]);

  return (
    <>
      <CommandPalette />
      <AppRoutes />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
}
