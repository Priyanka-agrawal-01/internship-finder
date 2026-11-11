import { useEffect, useRef, useState } from 'react';
import { useAuth } from './authContext';

/* Google Identity Services: loaded only when the dialog opens with Google turned on */
let gisPromise = null;
function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  gisPromise ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve(window.google);
    s.onerror = () => { gisPromise = null; reject(new Error('Google sign-in could not load.')); };
    document.head.appendChild(s);
  });
  return gisPromise;
}

function GoogleButton({ clientId, onCredential, onError }) {
  const box = useRef(null);
  // the latest handlers, read when Google calls back (initialize runs once per client id)
  const handlers = useRef({ onCredential, onError });
  useEffect(() => { handlers.current = { onCredential, onError }; });

  useEffect(() => {
    let off = false;
    loadGoogle().then(google => {
      if (off || !box.current) return;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => handlers.current.onCredential(credential),
        ux_mode: 'popup',
        auto_select: false,
      });
      google.accounts.id.renderButton(box.current, {
        theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill',
        width: Math.min(box.current.offsetWidth || 320, 400),
      });
    }).catch(err => { if (!off) handlers.current.onError(err.message); });
    return () => { off = true; };
  }, [clientId]);

  return <div ref={box} className="w-full flex justify-center min-h-[44px]" />;
}

const field = 'w-full rounded-xl border border-[#C3D4D2] bg-white px-3.5 py-2.5 text-sm text-[#06525C] placeholder:text-[#5E8D93] focus:outline-none focus:border-[#06525C] focus:ring-2 focus:ring-[#06525C]/15';

export default function AuthModal({ mode, setMode, onClose }) {
  const { signIn, signUp, signInWithGoogle, config } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState('');
  const firstField = useRef(null);
  const isSignUp = mode === 'signup';

  useEffect(() => { firstField.current?.focus(); }, [mode]);
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const run = async fn => {
    setBusy(true);
    setError('');
    try { await fn(); } catch (err) { setError(err.message); setBusy(false); }
  };

  const submit = e => {
    e.preventDefault();
    if (isSignUp && password.length < 8) { setError('Use at least 8 characters for your password.'); return; }
    run(() => (isSignUp ? signUp(name.trim(), email.trim(), password) : signIn(email.trim(), password)));
  };

  const switchMode = m => { setMode(m); setError(''); };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#06424A]/40 backdrop-blur-[2px]" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="auth-title" className="w-full max-w-[420px] bg-white rounded-2xl border border-[#D5E1DF] shadow-xl p-6 sm:p-7 max-h-[calc(100vh-32px)] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h2 id="auth-title" className="text-xl font-bold text-[#06525C]">{isSignUp ? 'Create your account' : 'Sign in to InternPulse'}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 -m-1.5 rounded-lg text-[#2F737D] hover:bg-[#EBF0EE]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p className="text-sm text-[#2F737D] mb-5">Your bookmarks and applications are saved to your account and show up on every device.</p>

        {config.google && config.googleClientId && (
          <>
            <GoogleButton clientId={config.googleClientId}
              onCredential={credential => run(() => signInWithGoogle(credential))}
              onError={setError} />
            <div className="flex items-center gap-3 my-5 text-xs text-[#5E8D93]">
              <span className="h-px flex-1 bg-[#D5E1DF]" />or use your email<span className="h-px flex-1 bg-[#D5E1DF]" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-3" noValidate>
          {isSignUp && (
            <label className="block">
              <span className="block text-xs font-semibold text-[#2A6870] mb-1">Name <span className="font-normal text-[#5E8D93]">(optional)</span></span>
              <input ref={firstField} className={field} value={name} onChange={e => setName(e.target.value)} autoComplete="name" maxLength={60} />
            </label>
          )}
          <label className="block">
            <span className="block text-xs font-semibold text-[#2A6870] mb-1">Email</span>
            <input ref={isSignUp ? undefined : firstField} className={field} type="email" required value={email}
              onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" />
          </label>
          <label className="block">
            <span className="flex items-center justify-between text-xs font-semibold text-[#2A6870] mb-1">
              Password
              <button type="button" onClick={() => setShowPw(s => !s)} className="font-medium text-[#2F737D] hover:text-[#06525C]">{showPw ? 'Hide' : 'Show'}</button>
            </span>
            <input className={field} type={showPw ? 'text' : 'password'} required value={password}
              onChange={e => setPassword(e.target.value)} autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={isSignUp ? 8 : undefined} placeholder={isSignUp ? 'At least 8 characters' : ''} />
          </label>

          {error && <p role="alert" className="text-sm text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={busy}
            className="w-full py-2.5 rounded-xl bg-[#06525C] hover:bg-[#043F47] disabled:opacity-60 text-white text-sm font-semibold transition-colors">
            {busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-[#2F737D] text-center mt-5">
          {isSignUp ? 'Already have an account? ' : 'New to InternPulse? '}
          <button onClick={() => switchMode(isSignUp ? 'signin' : 'signup')} className="font-semibold text-[#06525C] underline underline-offset-2">
            {isSignUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  );
}
