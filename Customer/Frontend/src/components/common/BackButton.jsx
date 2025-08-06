// src/components/common/BackButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; // Optional icon

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md shadow mb-4 ml-4 mt-2"
    >
      <ArrowLeft size={18} />
      Back
    </button>
  );
};

export default BackButton;
