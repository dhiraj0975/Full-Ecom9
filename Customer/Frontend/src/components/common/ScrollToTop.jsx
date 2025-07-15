import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instant scroll for auth pages, smooth for others
    const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password', '/verify-mobile-otp'].includes(pathname);
    
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: isAuthPage ? 'auto' : 'smooth'
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop; 