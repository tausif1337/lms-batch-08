import { createContext, useContext } from "react";

// The context and its hook live apart from AuthContext.jsx so that file only
// exports a component. Vite's fast refresh gives up on any file that mixes
// components with other exports.
export const AuthContext = createContext(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return value;
}
