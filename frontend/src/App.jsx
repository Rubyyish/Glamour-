import React, { useState } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toast.css';
import Login from "./Components/LoginPage/LoginPage.jsx";
import SignInPage from "./Components/SigninPage/SigninPage.jsx";
import ForgotPassword from "./Components/ForgotPassword/ForgotPassword.jsx";
import HomePage from "./Components/HomePage/HomePage.jsx";
import ProfilePage from "./Components/ProfilePage/ProfilePage.jsx";
import Wardrobe from "./Components/Wardrobe/Wardrobe.jsx";
import WardrobeDetail from "./Components/WardrobeDetail/WardrobeDetail.jsx";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard.jsx";
import AuthCallback from "./Components/AuthCallback/AuthCallback.jsx";
import Collections from "./Components/Collections/Collections.jsx";
import About from "./Components/About/About.jsx";
import CategoryPage from "./Components/CategoryPage/CategoryPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} />
        <Route path="/signup" element={!isAuthenticated ? <SignInPage /> : <Navigate to="/home" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/home" />} />
        <Route path="/reset-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/home" />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/home" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/wardrobe" element={isAuthenticated ? <Wardrobe /> : <Navigate to="/login" />} />
        <Route path="/wardrobe/:id" element={isAuthenticated ? <WardrobeDetail /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/collections" element={isAuthenticated ? <Collections /> : <Navigate to="/login" />} />
        <Route path="/category/:category" element={isAuthenticated ? <CategoryPage /> : <Navigate to="/login" />} />
        <Route path="/about" element={isAuthenticated ? <About /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} />
      </Routes>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          fontSize: '14px',
          fontWeight: '500'
        }}
        progressStyle={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
        style={{ zIndex: 9999 }}
      />
      
      {/* Loading animation styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
