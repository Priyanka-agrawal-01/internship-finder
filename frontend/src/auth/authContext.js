import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

/**
 * The signed-in state: { status: 'loading' | 'signedIn' | 'guest', user, token,
 * config, openAuth(mode), signIn, signUp, signInWithGoogle, signOut, deleteAccount }.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
