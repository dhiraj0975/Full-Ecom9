// src/App.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import BackButton from './components/common/BackButton'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation();

  const hideHeaderRoutes = [
    '/register',
    '/forgot-password',
    '/verify-otp',
    '/reset-password'
  ];

  const hideBackButtonRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/verify-otp',
    '/reset-password'
  ];

 const hideFooterRoutes = [
  '/login',
  '/register',
  '/forgot-password',  // <-- Add this line
  '/verify-otp',       // Agar OTP page pe bhi footer nahi chahiye
  '/reset-password'    // Agar reset page pe bhi footer nahi chahiye
];


  const hideHeader = hideHeaderRoutes.includes(location.pathname);
  const hideFooter = hideFooterRoutes.includes(location.pathname);

  // Check if current path is product detail page
  const isProductDetailPage = location.pathname.startsWith('/products/') && location.pathname !== '/products';
  const hideBackButton = hideBackButtonRoutes.includes(location.pathname) || isProductDetailPage;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      <ScrollToTop />

      {!hideHeader && <Header />}

      <main className="flex-1">
        {!hideBackButton && <BackButton />}
        <AppRoutes />
      </main>

      {!hideFooter && <Footer />}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default App;
