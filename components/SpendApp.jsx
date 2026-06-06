'use client';
import React from 'react';
import AuthGate from './AuthGate';
import App from './App';

export default function SpendApp() {
  return (
    <div className="app-stage">
      <div className="phone">
        <div className="landscape">
          <div className="sun"></div>
          <div className="cloud c1"></div>
          <div className="cloud c2"></div>
          <div className="cloud c3"></div>
          <div className="cloud c4"></div>
          <div className="tree-simple t-left">
            <div className="leaf l1"></div>
            <div className="leaf l2"></div>
            <div className="leaf l3"></div>
            <div className="trunk"></div>
          </div>
          <div className="tree-simple t-left2">
            <div className="leaf l1"></div>
            <div className="leaf l2"></div>
            <div className="leaf l3"></div>
            <div className="trunk"></div>
          </div>
          <div className="tree-simple t-right">
            <div className="leaf l1"></div>
            <div className="leaf l2"></div>
            <div className="leaf l3"></div>
            <div className="trunk"></div>
          </div>
          <div className="tree-simple t-right2">
            <div className="leaf l1"></div>
            <div className="leaf l2"></div>
            <div className="leaf l3"></div>
            <div className="trunk"></div>
          </div>
          <div className="grass"></div>
          <div className="dirt"></div>
        </div>
        <AuthGate>
          <App />
        </AuthGate>
      </div>
    </div>
  );
}
