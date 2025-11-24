"use client";
import React from 'react';
import './CenteredLoader.css';

function CenteredLoader({ minHeight = '200px' }) {
  return (
    <div className="centered-loader-container" style={{ minHeight }}>
      <div className="centered-loader">
        <div className="loader-spinner"></div>
      </div>
    </div>
  );
}

export default CenteredLoader;

