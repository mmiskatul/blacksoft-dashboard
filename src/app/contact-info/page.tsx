'use client';

import React, { useState } from 'react';
import { useContactInfoSettings, saveContactInfo } from '../../utils/contactStore';

export default function ContactInfoPage() {
  const info = useContactInfoSettings();

  const [location, setLocation] = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [policy, setPolicy]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [status, setStatus]     = useState('');

  React.useEffect(() => {
    setLocation(info.location ?? '');
    setEmail(info.email ?? '');
    setPhone(info.phone ?? '');
    setPolicy(info.privacyPolicy ?? '');
  }, [info]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      await saveContactInfo({ location, email, phone, privacyPolicy: policy });
      setStatus('Saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch {
      alert('Failed to save contact info.');
    } finally {
      setSaving(false);
    }
  };

  const input: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border-card)',
    background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-white)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const label: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '6px',
    display: 'block',
  };

  const card: React.CSSProperties = {
    background: 'var(--bg-card-high)',
    border: '1px solid var(--border-card)',
    borderRadius: '20px',
    padding: '28px',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-white)' }}>
          📍 Contact Info & Privacy Policy
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
          Control the footer contact details and the Privacy Policy page content. Changes reflect immediately on the live site.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gap: '24px' }}>

        {/* Contact Fields Card */}
        <div style={card}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-white)', margin: '0 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
            Footer Contact Details
          </h2>

          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Location */}
            <div>
              <label style={label}>Location / HQ Address</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Global HQ: San Francisco, CA"
                style={input}
              />
            </div>

            {/* Email */}
            <div>
              <label style={label}>Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. hello@blacksoft.tech"
                style={input}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={label}>Phone Number (optional)</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 000-0000"
                style={input}
              />
            </div>
          </div>
        </div>

        {/* Privacy Policy Card */}
        <div style={card}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-white)', margin: '0 0 8px 0' }}>
            Privacy Policy Content
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
            This text is shown on the <strong style={{ color: 'var(--text-white)' }}>/privacy-policy</strong> page on the live site. Use plain text or line breaks to format sections.
          </p>
          <textarea
            value={policy}
            onChange={e => setPolicy(e.target.value)}
            rows={18}
            placeholder="Enter your full privacy policy text here..."
            style={{ ...input, resize: 'vertical', lineHeight: 1.7 }}
          />
        </div>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#34d399' }}>{status}</span>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 36px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(79, 70, 229, 0.3)',
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
