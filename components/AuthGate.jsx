'use client';
import React, { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';
import LoginScreen from './LoginScreen';

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
  if (!session) return React.createElement(LoginScreen);
  return React.createElement(React.Fragment, null, children);
}
