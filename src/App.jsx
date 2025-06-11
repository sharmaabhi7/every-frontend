import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Auth Components
import Register from './components/auth/Register'
import VerifyOTP from './components/auth/VerifyOTP'
import Login from './components/auth/Login'
import AdminLogin from './components/auth/AdminLogin'
import SignAgreement from './components/auth/SignAgreement'

// User Components
import Dashboard from './components/dashboard/Dashboard'
import WorkEditor from './components/work/WorkEditor'
import UserProfile from './components/user/UserProfile'
import ViewAgreement from './components/user/ViewAgreement'

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard'
import UserManagement from './components/admin/UserManagement'
import AgreementManagement from './components/admin/AgreementManagement'
import SignedAgreements from './components/admin/SignedAgreements'

// Landing Page
import LandingPage from './components/landing/LandingPage'

// Context
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'

// Protected Routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  if (!token) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/sign-agreement/:token" element={<SignAgreement />} />

            {/* User Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/work-editor"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <WorkEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-agreement"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <ViewAgreement />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/agreements"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AgreementManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/signed-agreements"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SignedAgreements />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App

