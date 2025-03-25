/**
 * Authentication context and provider for managing Firebase authentication state.
 * @module AuthContext
 *
 * @typedef {Object} AuthContextProps
 * @property {User | null} user - The current authenticated Firebase user or null if not authenticated
 * @property {boolean} loading - Indicates whether the authentication state is still being determined
 *
 * @function useAuth
 * @returns {AuthContextProps} The current authentication context value
 *
 * @component AuthProvider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped by the provider
 *
 * This context provides:
 * - Authentication state management
 * - Loading state while determining auth status
 * - Automatic cleanup of Firebase auth listeners
 * - Access to current user information throughout the app
 *
 * // Use authentication state in components
 * const { user, loading } = useAuth();
 * @author Andrew Chen
 */
"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/clientApp";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const value: AuthContextProps = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
};
