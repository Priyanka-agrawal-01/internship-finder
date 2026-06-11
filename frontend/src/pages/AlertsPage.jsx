import React, { useState } from 'react';
import axios from 'axios';

const getBackendUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};
const BACKEND_URL = getBackendUrl();

const PREF_LABELS = [
  { key: 'itCompanies',       label: '💻 IT Companies' },
  { key: 'eceCompanies',      label: '🔌 ECE Companies' },
  { key: 'remoteInternships', label: '🌐 Remote Internships' },
  { key: 'productCompanies',  label: '🏢 Product Companies' },
  { key: 'startups',          label: '🚀 Startups' },
  { key: 'aiMlRoles',         label: '🧠 AI/ML Roles' },
  { key: 'frontendRoles',     label: '🎨 Frontend Roles' },
  { key: 'backendRoles',      label: '⚙️ Backend Roles' },
  { key: 'vlsiRoles',         label: '📟 VLSI Roles' },
  { key: 'embeddedRoles',     label: '🕹️ Embedded Roles' },
];

const LOCATIONS = ['India', 'Remote', 'United States', 'Europe', 'Other Countries'];

const FREQUENCIES = [
  { value: 'instant', label: '⚡ Instant' },
  { value: '6hours', label: '⏱ Every 6 Hours' },
  { value: 'daily', label: '📅 Daily Digest' },
];

export default function AlertsPage() {
  const [email, setEmail] = useState('');
  
  // State for preferences checkboxes
  const [prefs, setPrefs] = useState({
    itCompanies: true,
    eceCompanies: false,
    remoteInternships: false,
    productCompanies: false,
    startups: false,
    aiMlRoles: false,
    frontendRoles: false,
    backendRoles: false,
    vlsiRoles: false,
    embeddedRoles: false,
  });

  // State for location preferences
  const [selectedLocations, setSelectedLocations] = useState(['India', 'Remote']);

  // State for frequency dropdown
  const [frequency, setFrequency] = useState('6hours');

  // Status and messages
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleCheckboxChange = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLocationChange = (loc) => {
    setSelectedLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const executeAction = async (actionType) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      setPreviewUrl(null);
      return;
    }

    setStatus('loading');
    setMessage('');
    setPreviewUrl(null);

    const payload = {
      email: email.trim().toLowerCase(),
      preferences: {
        ...prefs,
        frequency,
        locations: selectedLocations,
      }
    };

    try {
      if (actionType === 'unsubscribe') {
        const res = await axios.post(`${BACKEND_URL}/api/subscribe/unsubscribe`, { email: payload.email });
        if (res.data.success) {
          setStatus('success');
          setMessage(res.data.message || 'Successfully unsubscribed from all job alerts.');
        } else {
          throw new Error(res.data.message || 'Unsubscription failed.');
        }
      } else {
        // subscribe or update
        const res = await axios.post(`${BACKEND_URL}/api/subscribe`, payload);
        if (res.data.success) {
          setStatus('success');
          setMessage(res.data.message || 'Preferences saved successfully!');
          if (res.data.previewUrl) {
            setPreviewUrl(res.data.previewUrl);
          }
        } else {
          throw new Error(res.data.message || 'Subscription failed.');
        }
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Title / Subtitle */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-4">
            <span className="text-xs font-bold text-[#2563EB] tracking-wide uppercase">⚡ Real-Time Notifications</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight sm:text-4xl">
            InternPulse Job Alerts
          </h1>
          <p className="mt-3 text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
            Get notified instantly whenever new internships matching your interests are discovered.
          </p>
        </div>

        {/* Card Panel */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Action status messages */}
            {status === 'success' && (
              <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-xs text-[#16A34A] font-medium leading-relaxed">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">✅</span>
                  <span className="font-bold text-[#15803D]">Success!</span>
                </div>
                <p>{message}</p>
                {previewUrl && (
                  <div className="mt-3 pt-3 border-t border-[#BBF7D0]">
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] text-white rounded-lg font-bold hover:bg-[#15803D] transition-colors"
                    >
                      ✉ View Test Email Preview
                    </a>
                  </div>
                )}
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#DC2626] font-medium leading-relaxed">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">❌</span>
                  <span className="font-bold text-[#991B1B]">Error</span>
                </div>
                <p>{message}</p>
              </div>
            )}

            {/* Email Address Section */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-[#0F172A]">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
                  disabled={status === 'loading'}
                />
              </div>
            </div>

            {/* Preferences Checkboxes */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#0F172A]">
                Subscription Preferences
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PREF_LABELS.map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer select-none transition-all ${
                      prefs[item.key]
                        ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB] font-semibold'
                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={prefs[item.key]}
                      onChange={() => handleCheckboxChange(item.key)}
                      disabled={status === 'loading'}
                      className="w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]/25"
                    />
                    <span className="text-xs">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notification Frequency */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#0F172A]">
                Notification Frequency
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FREQUENCIES.map((freq) => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setFrequency(freq.value)}
                    disabled={status === 'loading'}
                    className={`px-4 py-3 text-xs font-bold border rounded-xl transition-all ${
                      frequency === freq.value
                        ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Locations */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#0F172A]">
                Preferred Locations
              </label>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map((loc) => {
                  const isActive = selectedLocations.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleLocationChange(loc)}
                      disabled={status === 'loading'}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
                        isActive
                          ? 'bg-[#22C55E] text-white border-[#22C55E]'
                          : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB]'
                      }`}
                    >
                      {isActive ? `✓ ${loc}` : `+ ${loc}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => executeAction('subscribe')}
                disabled={status === 'loading'}
                className="flex-1 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#94A3B8] text-white text-xs font-bold rounded-xl shadow-sm transition-all text-center"
              >
                {status === 'loading' ? 'Processing...' : 'Subscribe'}
              </button>
              
              <button
                type="button"
                onClick={() => executeAction('update')}
                disabled={status === 'loading'}
                className="flex-1 py-3 bg-white border border-[#CBD5E1] hover:border-[#94A3B8] disabled:opacity-55 text-[#334155] text-xs font-bold rounded-xl transition-all text-center"
              >
                Update Preferences
              </button>

              <button
                type="button"
                onClick={() => executeAction('unsubscribe')}
                disabled={status === 'loading'}
                className="flex-1 py-3 bg-white border border-[#FCA5A5] text-[#EF4444] hover:bg-[#FEF2F2] disabled:opacity-55 text-xs font-bold rounded-xl transition-all text-center"
              >
                Unsubscribe
              </button>
            </div>

          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <p className="text-xs text-[#94A3B8]">
            Need help? Contact our support or manage your subscription anytime.
          </p>
        </div>

      </div>
    </div>
  );
}
