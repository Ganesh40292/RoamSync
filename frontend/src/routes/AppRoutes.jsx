import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoutes from './ProtectedRoutes';
import AdminRoutes from './AdminRoutes';

// Public pages
import Home from '../pages/Home/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import NotFound from '../pages/NotFound/NotFound';
import TermsOfService from '../pages/Legal/TermsOfService';
import PrivacyPolicy from '../pages/Legal/PrivacyPolicy';

// Protected pages
import Dashboard from '../pages/Dashboard/Dashboard';
import AllTrips from '../pages/Trips/AllTrips';
import CreateTrip from '../pages/Trips/CreateTrip';
import TripDetails from '../pages/Trips/TripDetails';
import ExpenseDashboard from '../pages/Expenses/ExpenseDashboard';
import ChatRoom from '../pages/Chat/ChatRoom';
import Explore from '../pages/Explore/Explore';
import UserProfile from '../pages/Profile/UserProfile';
import AIPlannerPage from '../pages/Planner/AIPlannerPage';

// Admin pages
import AdminDashboard from '../pages/Admin/AdminDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trips" element={<AllTrips />} />
        <Route path="/trips/create" element={<CreateTrip />} />
        <Route path="/trips/:id" element={<TripDetails />} />
        <Route path="/expenses" element={<ExpenseDashboard />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/planner" element={<AIPlannerPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoutes />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Fallback Route */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
