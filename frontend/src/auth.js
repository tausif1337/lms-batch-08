import { createContext, useContext } from "react";

// This lives in its own file, away from AuthContext.jsx, on purpose.
// Vite's fast refresh only works on a file that exports components and
// nothing else. Put createContext() next to AuthProvider and every edit
// does a full page reload instead of a hot swap.

export const AuthContext = createContext(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return value;
}
