import React from 'react';
import { useLocation } from 'react-router-dom';

const steps = [
  { label: 'Cart', path: '/cart' },
  { label: 'Address', path: '/address' },
  { label: 'Payment', path: '/payment' },
  { label: 'Summary', path: '/summary' },
];

const getStepIndex = (pathname) => {
  if (pathname.startsWith('/cart')) return 0;
  if (pathname.startsWith('/address')) return 1;
  if (pathname.startsWith('/payment')) return 2;
  if (pathname.startsWith('/summary')) return 3;
  return 0;
};

const CheckoutStepper = () => {
  const location = useLocation();
  const activeStep = getStepIndex(location.pathname);

  return (
    <div className="w-full flex flex-col items-center my-6">
      <div className="flex items-center w-full max-w-xl justify-between relative">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeStep;
          const isActive = idx === activeStep;
          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center min-w-[70px]">
                <div className="relative z-10">
                  {isCompleted ? (
                    <div className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold border-2 border-blue-600">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 10.5l3.5 3.5 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  ) : isActive ? (
                    <div className="border-2 border-blue-600 text-blue-600 w-7 h-7 rounded-full flex items-center justify-center text-base font-bold bg-white">
                      {idx + 1}
                    </div>
                  ) : (
                    <div className="border-2 border-gray-300 text-gray-400 w-7 h-7 rounded-full flex items-center justify-center text-base font-bold bg-white">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div className={`mt-2 text-xs font-medium ${isCompleted || isActive ? 'text-black' : 'text-gray-400'}`}
                  style={isCompleted ? { fontWeight: 600 } : {}}>
                  {step.label}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${idx < activeStep ? 'bg-blue-600' : 'bg-gray-200'} mx-1`} style={{ minWidth: 32 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutStepper; 