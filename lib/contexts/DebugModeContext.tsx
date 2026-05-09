"use client";

import { createContext, useContext, useState, useEffect } from "react";

const KEY = "biq_debug_role";

interface DebugModeContextValue {
  debugRole: string | null;
  setDebugRole: (role: string | null) => void;
}

const DebugModeContext = createContext<DebugModeContextValue>({
  debugRole: null,
  setDebugRole: () => {},
});

export function DebugModeProvider({ children }: { children: React.ReactNode }) {
  const [debugRole, setDebugRoleState] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(KEY);
    if (stored) setDebugRoleState(stored);
  }, []);

  const setDebugRole = (role: string | null) => {
    if (role) {
      sessionStorage.setItem(KEY, role);
    } else {
      sessionStorage.removeItem(KEY);
    }
    setDebugRoleState(role);
  };

  return (
    <DebugModeContext.Provider value={{ debugRole, setDebugRole }}>
      {children}
    </DebugModeContext.Provider>
  );
}

export function useDebugMode() {
  return useContext(DebugModeContext);
}
