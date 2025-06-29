import React from 'react';

interface CopyIconProps {
  className?: string;
  size?: number;
}

export const CopyIcon: React.FC<CopyIconProps> = ({ className = '', size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6 6.5A1.5 1.5 0 0 1 7.5 5h5A1.5 1.5 0 0 1 14 6.5v5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 6 11.5v-5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M4 14.5A1.5 1.5 0 0 0 5.5 16h5a1.5 1.5 0 0 0 1.5-1.5v-.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
};

export const CheckIcon: React.FC<CopyIconProps> = ({ className = '', size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M15 6L8 13L5 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
