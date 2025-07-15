import React, { useState } from 'react';

const StatusToggle = ({ isActive, onToggle, loading }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (loading || isToggling) return;
    setIsToggling(true);
    await onToggle();
    setIsToggling(false);
  };

  const cursorClass = (loading || isToggling) ? 'cursor-wait opacity-70' : 'cursor-pointer';

  return (
    <div
      onClick={handleToggle}
      className={`relative inline-block w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${
        isActive ? 'bg-green-500' : 'bg-red-500'
      } ${cursorClass}`}
      title={isActive ? 'Deactivate User' : 'Activate User'}
    >
      <span
        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
          isActive ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </div>
  );
};

export default StatusToggle; 