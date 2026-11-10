import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './authContext';
import { api } from '../lib/api';
import AuthModal from './AuthModal';

const TOKEN_KEY = 'ip_auth_token';

const readToken = () => { try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; } };
const writeToken = t => {
  try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch { /* private mode: stay signed in for this tab only */ }
};

export default function AuthProvider({ children }) {
  const [token, setToken]   = useState(readToken);
  const [user, setUser]     = useState(null);
  const [status, setStatus] = useState(() => (readToken() ? 'loading' : 'guest'));
  const [modal, setModal]   = useState(null);          // null | 'signin' | 'signup'
  const [config, setConfig] = useState({ google: false, googleClientId: null });
  const [notice, setNotice] = useState('');

  // What the sign-in dialog can offer (Google needs GOOGLE_CLIENT_ID on the server)
  useEffect(() => {
    let off = false;
    api('/api/auth/config').then(c => { if (!off) setConfig({ google: !!c.google, googleClientId: c.googleClientId || null }); }).catch(() => {});
    return () => { off = true; };
  }, []);

  // A token kept from an earlier visit: check it once. A free Render server can take a
  // minute to wake, so network failures retry quietly; only a 401 signs the browser out.
  useEffect(() => {
    if (!token || user) return;
    let off = false;
    let timer;
    let delay = 3000;
    const check = () => {
      api('/api/auth/me', { token })
        .then(r => { if (!off) { setUser(r.user); setStatus('signedIn'); } })
        .catch(err => {
          if (off) return;
          if (err.status === 401) { writeToken(null); setToken(null); setStatus('guest'); return; }
          timer = setTimeout(check, delay);
          delay = Math.min(delay * 2, 30000);
        });
    };
    check();
    return () => { off = true; clearTimeout(timer); };
  }, [token, user]);

  const finish = useCallback(r => {
    writeToken(r.token);
    setToken(r.token);
    setUser(r.user);
    setStatus('signedIn');
    setModal(null);
    if (r.notice) setNotice(r.notice);
  }, []);

  const signIn = useCallback(async (email, password) => {
    finish(await api('/api/auth/login', { method: 'POST', body: { email, password } }));
  }, [finish]);

  const signUp = useCallback(async (name, email, password) => {
    finish(await api('/api/auth/register', { method: 'POST', body: { name, email, password } }));
  }, [finish]);

  const signInWithGoogle = useCallback(async credential => {
    finish(await api('/api/auth/google', { method: 'POST', body: { credential } }));
  }, [finish]);

  const clearLocal = useCallback(() => {
    writeToken(null);
    setToken(null);
    setUser(null);
    setStatus('guest');
  }, []);

  const signOut = useCallback(async () => {
    const t = token;
    clearLocal();
    if (t) await api('/api/auth/logout', { method: 'POST', token: t }).catch(() => {});
  }, [token, clearLocal]);

  const deleteAccount = useCallback(async () => {
    await api('/api/auth/me', { method: 'DELETE', token });
    clearLocal();
  }, [token, clearLocal]);

  const value = useMemo(() => ({
    status, user, token, config,
    openAuth: (mode = 'signin') => setModal(mode),
    signIn, signUp, signInWithGoogle, signOut, deleteAccount,
  }), [status, user, token, config, signIn, signUp, signInWithGoogle, signOut, deleteAccount]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modal && <AuthModal mode={modal} setMode={setModal} onClose={() => setModal(null)} />}
      {notice && (
        <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] max-w-md w-[calc(100%-32px)] bg-[#06525C] text-white text-sm rounded-xl px-4 py-3 shadow-lg flex items-start gap-3">
          <span className="flex-1">{notice}</span>
          <button onClick={() => setNotice('')} className="font-semibold underline underline-offset-2">OK</button>
        </div>
      )}
    </AuthContext.Provider>
  );
}
