import React from 'react';

const HospitalLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center p-5">
      <div className="relative w-24 h-24">
        {/* Heartbeat SVG */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          <path
            d="M3 12H6L9 3L13 21L17 12H21"
            stroke="var(--color-error)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse-fast"
            style={{
              filter: "drop-shadow(0 0 4px var(--color-error))",
            }}
          />
        </svg>
        
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-slate-200 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute inset-0 border-4 border-t-secondary rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-primary font-bold tracking-wider animate-pulse">LOADING...</p>
    </div>
  );
};

export default HospitalLoader;
