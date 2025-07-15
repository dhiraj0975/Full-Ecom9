// src/App.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation();
  const hideHeaderRoutes = [ '/register', '/forgot-password', '/verify-otp', '/reset-password'];
  const hideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      <ScrollToTop />
      {!hideHeader && <Header />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default App;
