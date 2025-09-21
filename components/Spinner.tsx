
import React from 'react';
import { LeafIcon } from './Icons';

interface SpinnerProps {
    message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 my-8">
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute w-full h-full border-4 border-dashed rounded-full animate-spin border-primary"></div>
        <LeafIcon className="w-8 h-8 text-primary" />
      </div>
      {message && <p className="text-text-secondary font-medium animate-pulse">{message}</p>}
    </div>
  );
};
