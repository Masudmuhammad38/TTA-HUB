
import React from 'react';

export const IdentificationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <rect width="18" height="20" x="3" y="2" rx="2" />
    <path d="M3 10h18" />
    <path d="M9 6h6" />
    <path d="M9 14h.01" />
    <path d="M13 14h2" />
    <path d="M9 18h.01" />
    <path d="M13 18h2" />
  </svg>
);
