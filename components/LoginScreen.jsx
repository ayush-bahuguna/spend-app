'use client';
import React from 'react';
import { getSupabase } from '../lib/supabase';
import { SlimeSprite } from './icons';
import { PixelButton } from './ui';

export default function LoginScreen() {
  function handleGoogleSignIn() {
    getSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }

  return React.createElement('div', { className: 'screen', style: { display: 'grid', placeItems: 'center' } },
    React.createElement('div', { className: 'main-card' },
      React.createElement('div', { className: 'main-card-inner', style: { justifyContent: 'center', alignItems: 'center', gap: 0 } },
        React.createElement('div', { className: 'empty-state', style: { padding: '32px 24px' } },
          React.createElement('div', { className: 'bob', style: { marginBottom: 16 } },
            React.createElement(SlimeSprite, { size: 80 })
          ),
          React.createElement('div', { className: 'font-pixel', style: { fontSize: 22, color: 'var(--ink)', marginBottom: 8, letterSpacing: '0.05em' } }, 'SPEND'),
          React.createElement('div', { className: 'empty-sub', style: { marginBottom: 32 } }, 'SIGN IN TO SYNC YOUR DATA'),
          React.createElement(PixelButton, { onClick: handleGoogleSignIn }, 'SIGN IN WITH GOOGLE'),
        )
      )
    )
  );
}
