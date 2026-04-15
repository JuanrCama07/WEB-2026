"use client";

import { createContext, useContext, useEffect } from 'react';

import type { AuthSession } from './shared';

const AuthSessionContext = createContext<AuthSession | null>(null);

let activeClientSession: AuthSession | null = null;

export function AuthSessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AuthSession | null;
}) {
  useEffect(() => {
    activeClientSession = session;

    return () => {
      activeClientSession = null;
    };
  }, [session]);

  return <AuthSessionContext.Provider value={session}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  return useContext(AuthSessionContext);
}

export function getActiveClientSession() {
  return activeClientSession;
}
