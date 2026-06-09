import React, { useState } from 'react';
import axios from 'axios';

// ─── Icons ────────────────────────────────────────────────────────────────────
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const CheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

const BellIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);

const ChevronDown = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round"
    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

// ─── Toggle chip ──────────────────────────────────────────────────────────────
function ToggleChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        active
          ? 'bg-[#2563EB] text-white border-[#2563EB]'
          : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Specific company list ────────────────────────────────────────────────────
const COMPANY_SUGGESTIONS = [
  'Google','Microsoft','Amazon','Adobe','Flipkart','Razorpay',
  'Swiggy','Zomato','Meesho','PhonePe','CRED','Groww',
  'Qualcomm','Intel','AMD','Cadence','Texas Instruments','NVIDIA',
];

const ROLE_SUGGESTIONS = [
  'Software Engineer','Backend','Frontend','Full Stack','Data Science',
  'Machine Learning','DevOps','VLSI','Embedded','Product Management',
];

// ─────────────────────────────────────────────────────────────────────────────
export default function SubscribeForm({ backendUrl }) {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState('idle');  // idle | loading | success | error
  const [message, setMsg]   = useState('');
  const [previewUrl, setPrev] = useState(null);

  // Preferences
  const [showPrefs, setShowPrefs]       = useState(false);
  const [itCompanies, setIT]            = useState(true);
  const [eceCompanies, setECE]          = useState(false);
  const [internshipsOnly, setInternOnly]= useState(true);
  const [selCompanies, setSelCompanies] = useState([]);
  const [selRoles, setSelRoles]         = useState([]);
  const [companySearch, setCompanySearch] = useState('');
  const [roleSearch, setRoleSearch]       = useState('');

  const toggleItem = (list, setList, item) =>
    setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMsg('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMsg('');

    const preferences = {
      itCompanies,
      eceCompanies,
      internshipsOnly,
      companies: selCompanies,
      roles:     selRoles,
    };

    try {
      const res = await axios.post(
        `${backendUrl}/api/subscribe`,
        { email, preferences },
        { timeout: 15000 }   // 15s — never stays pending forever
      );

      if (res.data?.success) {
        setStatus('success');
        setMsg(res.data.message || 'Thank you for subscribing! Check your inbox.');
        setPrev(res.data.previewUrl || null);
        setEmail('');
      } else {
        throw new Error(res.data?.message || 'Subscription failed.');
      }
    } catch (err) {
      const msg =
        err.code === 'ECONNABORTED'
          ? 'Request timed out. Please check your connection and try again.'
          : err.response?.data?.message ||
            (err.message.includes('Network Error')
              ? 'Could not reach the server. Make sure the backend is running.'
              : err.message || 'Something went wrong. Please try again.');
      setStatus('error');
      setMsg(msg);
    }
    // Note: status is set explicitly in both branches above — no finally needed
    // (success branch intentionally keeps status='success', error branch sets 'error')
  };


  // ── Success state ─────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-[#BBF7D0] p-5"
        style={{ boxShadow: '0 1px 8px rgba(22,163,74,0.10)' }}>

        {/* Top success banner */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
          <div className="w-9 h-9 rounded-xl bg-[#22C55E] flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-[#15803D] leading-none">Subscribed successfully! 🎉</p>
            <p className="text-[11px] text-[#16A34A] mt-0.5">Thank you for subscribing!</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs text-[#374151] leading-relaxed mb-3">
          {message || 'Check your inbox for a welcome email. Internship alerts will start arriving every 6 hours.'}
        </p>

        {/* Inbox reminder */}
        <div className="flex items-start gap-2 p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl mb-3">
          <span className="text-base shrink-0">📬</span>
          <p className="text-[11px] text-[#92400E] leading-relaxed">
            <strong>Check your inbox</strong> for the welcome email. If you don't see it, check your spam/promotions folder and mark it as "Not Spam".
          </p>
        </div>

        {/* Preview link (Ethereal test) */}
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#2563EB] font-semibold hover:text-[#1D4ED8] transition-colors mb-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Preview welcome email (dev mode) →
          </a>
        )}

        {/* Status strip */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block"/>
            Alerts run every 6 hours
          </div>
          <button onClick={() => setStatus('idle')}
            className="text-[11px] text-[#94A3B8] hover:text-[#64748B] transition-colors">
            Edit preferences
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-card border border-[#E2E8F0] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
          <BellIcon />
        </div>
        <div>
          <h3 className="text-[#0F172A] font-bold text-sm leading-none">Job Alerts</h3>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">Every 6 hours · India only</p>
        </div>
      </div>

      <p className="text-[#64748B] text-xs leading-relaxed mb-4 mt-2">
        Get instantly notified when new internships matching your profile are detected.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Email field */}
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
          placeholder="your@email.com"
          className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
        />

        {/* Error */}
        {status === 'error' && (
          <p className="text-[11px] text-red-500 font-medium">{message}</p>
        )}

        {/* Preferences toggle */}
        <button
          type="button"
          onClick={() => setShowPrefs(!showPrefs)}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#64748B] hover:border-[#CBD5E1] transition-all"
        >
          <span className="flex items-center gap-1.5">
            <MailIcon /> Preferences
            {(selCompanies.length > 0 || selRoles.length > 0) && (
              <span className="bg-[#2563EB] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {selCompanies.length + selRoles.length}
              </span>
            )}
          </span>
          <ChevronDown open={showPrefs} />
        </button>

        {/* Preferences panel */}
        {showPrefs && (
          <div className="border border-[#E2E8F0] rounded-xl p-3 space-y-4 bg-[#FAFBFD]">

            {/* Category */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Company Category</p>
              <div className="flex flex-wrap gap-1.5">
                <ToggleChip active={itCompanies}  onClick={() => setIT(!itCompanies)}>💻 IT Companies</ToggleChip>
                <ToggleChip active={eceCompanies} onClick={() => setECE(!eceCompanies)}>🔌 ECE Companies</ToggleChip>
              </div>
            </div>

            {/* Internship toggle */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Opening Type</p>
              <div className="flex flex-wrap gap-1.5">
                <ToggleChip active={internshipsOnly}  onClick={() => setInternOnly(true)}>🎓 Internships Only</ToggleChip>
                <ToggleChip active={!internshipsOnly} onClick={() => setInternOnly(false)}>📋 All Openings</ToggleChip>
              </div>
            </div>

            {/* Specific companies */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">
                Specific Companies <span className="normal-case font-normal">(optional)</span>
              </p>
              <input
                type="text"
                value={companySearch}
                onChange={e => setCompanySearch(e.target.value)}
                placeholder="Filter companies…"
                className="w-full border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] mb-2 transition-all"
              />
              <div className="flex flex-wrap gap-1">
                {COMPANY_SUGGESTIONS
                  .filter(c => !companySearch || c.toLowerCase().includes(companySearch.toLowerCase()))
                  .map(c => (
                    <button key={c} type="button" onClick={() => toggleItem(selCompanies, setSelCompanies, c)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
                        selCompanies.includes(c)
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB]'
                      }`}>
                      {selCompanies.includes(c) ? '✓ ' : ''}{c}
                    </button>
                  ))}
              </div>
            </div>

            {/* Specific roles */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">
                Role Keywords <span className="normal-case font-normal">(optional)</span>
              </p>
              <input
                type="text"
                value={roleSearch}
                onChange={e => setRoleSearch(e.target.value)}
                placeholder="Filter roles…"
                className="w-full border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] mb-2 transition-all"
              />
              <div className="flex flex-wrap gap-1">
                {ROLE_SUGGESTIONS
                  .filter(r => !roleSearch || r.toLowerCase().includes(roleSearch.toLowerCase()))
                  .map(r => (
                    <button key={r} type="button" onClick={() => toggleItem(selRoles, setSelRoles, r)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
                        selRoles.includes(r)
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB]'
                      }`}>
                      {selRoles.includes(r) ? '✓ ' : ''}{r}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Subscribing…
            </>
          ) : 'Get Job Alerts — Free'}
        </button>

        <p className="text-[10px] text-[#94A3B8] text-center">
          No spam · Alerts every 6 hours · Unsubscribe instantly
        </p>
      </form>
    </div>
  );
}
