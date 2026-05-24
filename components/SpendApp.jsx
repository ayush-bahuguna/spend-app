'use client';
import React from 'react';
import AuthGate from './AuthGate';
import App from './App';

export default function SpendApp() {
  return (
    <div className="app-stage">
      <div className="phone">
        <div className="landscape"></div>
        <AuthGate>
          <App />
        </AuthGate>
      </div>
    </div>
  );
}
