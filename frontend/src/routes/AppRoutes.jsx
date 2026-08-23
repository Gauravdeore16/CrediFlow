import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Home from '../pages/Public/Home';
import Login from '../pages/Public/Login';
import Register from '../pages/Public/Register';

import CustomerDashboard from '../pages/Customer/CustomerDashboard';
import ApplyLoan from '../pages/Customer/ApplyLoan';
import LoanDetailsView from '../pages/Customer/LoanDetailsView';
import CustomerProfile from '../pages/Customer/CustomerProfile';

import OfficerDashboard from '../pages/Officer/OfficerDashboard';
import AdminDashboard from '../pages/Admin/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Verifying session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Routes */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/apply"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <ApplyLoan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/loans/:id"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'OFFICER', 'ADMIN']}>
            <LoanDetailsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerProfile />
          </ProtectedRoute>
        }
      />

      {/* Officer Routes */}
      <Route
        path="/officer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
