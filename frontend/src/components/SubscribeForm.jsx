import React, { useState } from 'react';
import axios from 'axios';

// Inline SVGs for status messages
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brandSecondary">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-400">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function SubscribeForm({ backendUrl }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');
    setPreviewUrl(null);

    try {
      const response = await axios.post(`${backendUrl}/api/subscribe`, { email });
      setStatus('success');
      setMessage(response.data.message || 'Subscription successful!');
      if (response.data.previewUrl) {
        setPreviewUrl(response.data.previewUrl);
      }
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        'Failed to subscribe. Please verify your connection.'
      );
    }
  };

  return (
    <div className="relative glass-panel rounded-3xl p-8 md:p-12 shadow-2xl border border-darkBorder overflow-hidden">
      
      {/* Decorative colored glow spheres */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-brandPrimary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brandSecondary/10 rounded-full blur-3xl animate-pulse-glow" />

      <div className="relative max-w-2xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3">
          Get Instant Internship Alerts 📬
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-lg mb-8 leading-relaxed">
          Subscribe to the InternPulse newsletter. We scan the job boards and send fresh opportunities straight to your inbox weekly.
        </p>

        {/* Status Alerts */}
        {status === 'success' && (
          <div className="w-full max-w-md p-4 mb-6 rounded-2xl bg-brandSecondary/10 border border-brandSecondary/20 text-slate-200 flex flex-col gap-2 items-center text-sm">
            <div className="flex items-center gap-2">
              <CheckCircleIcon />
              <span className="font-semibold text-brandSecondary">{message}</span>
            </div>
            {previewUrl && (
              <div className="mt-1 text-xs">
                <span className="text-slate-400">Development mode preview: </span>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-bold underline inline-flex items-center gap-0.5"
                >
                  View Sent Email Inbox ↗
                </a>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="w-full max-w-md p-4 mb-6 rounded-2xl bg-red-950/20 border border-red-800/30 text-red-200 flex items-center gap-3 text-sm">
            <AlertTriangleIcon />
            <span className="font-semibold">{message}</span>
          </div>
        )}

        {/* Subscription Input Form */}
        <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MailIcon />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              placeholder="name@university.edu"
              className="w-full bg-slate-900/80 border border-darkBorder hover:border-slate-700 focus:border-brandPrimary text-slate-100 placeholder-slate-500 text-sm rounded-2xl pl-12 pr-4 py-3.5 outline-none transition-all duration-200 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading' || !email}
            className="px-6 py-3.5 bg-brandPrimary hover:bg-brandPrimaryHover disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {status === 'loading' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Subscribing...</span>
              </>
            ) : (
              <span>Notify Me</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
