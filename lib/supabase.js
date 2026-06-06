'use client';
import { createBrowserClient } from '@supabase/ssr';

let client;
export function getSupabase() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookieOptions: {
          maxAge: 60 * 60 * 24 * 400, // 400 days, matching Supabase refresh token lifetime
        },
      }
    );
  }
  return client;
}
