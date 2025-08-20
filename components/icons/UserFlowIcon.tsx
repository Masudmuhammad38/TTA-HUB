
import React from 'react';

export const UserFlowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M2 3h6a4 4 0 0 1 4 4v2"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v2"/>
    <path d="M12 13V9"/>
    <path d="M12 21v-4"/>
    <path d="M6 13H2v6h4v-6Z"/>
    <path d="M18 13h4v6h-4v-6Z"/>
  </svg>
);
