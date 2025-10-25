'use client';

import { useEffect } from 'react';

export default function ClearCookiesPage() {
  useEffect(() => {
    // Clear all cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    // Clear localStorage
    localStorage.clear();

    // Redirect home after 1 second
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold mb-2">Clearing cookies...</p>
        <p className="text-muted-foreground">You will be redirected shortly.</p>
      </div>
    </div>
  );
}
