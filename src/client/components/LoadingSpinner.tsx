import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

function LoadingSpinner({ message = 'Laster...' }: LoadingSpinnerProps) {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p style={{ marginTop: '1rem' }}>{message}</p>
    </div>
  );
}

export default LoadingSpinner;