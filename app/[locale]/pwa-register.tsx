"use client";

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const canRegister =
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!canRegister) {
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('ClearUp PWA service worker registration failed:', error);
    });
  }, []);

  return null;
}
