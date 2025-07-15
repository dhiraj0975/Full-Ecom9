import React from 'react';
import { useNavigate } from 'react-router-dom';

const DShopLogo = () => {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center h-16 cursor-pointer"
      style={{ minWidth: 120 }}
      onClick={() => navigate('/')}
      title="D-Shop Logo"
    >
      <img
        src="/" // 🔵 Yahan apni image ka path ya URL daal do
        alt="D-Shop Logo"
        className="h-10 w-auto object-contain"
      />
    </div>
  );
};

export default DShopLogo;
