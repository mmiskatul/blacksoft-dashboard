'use client';

import React, { useState } from 'react';
import { useWhoWeAreSettings, saveWhoWeAreSettings } from '../../utils/whoWeAreStore';

export default function WhoWeAreConfigPage() {
  // Read current backend configurations
  const settings = useWhoWeAreSettings();

  // Input states
  const [tagInput, setTagInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');

  const [num1, setNum1] = useState('');
  const [lbl1, setLbl1] = useState('');

  const [num2, setNum2] = useState('');
  const [lbl2, setLbl2] = useState('');

  const [num3, setNum3] = useState('');
  const [lbl3, setLbl3] = useState('');

  const [savedStatus, setSavedStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync inputs when settings load from API
  React.useEffect(() => {
    if (settings) {
      setTagInput(settings.tag || '');
      setTitleInput(settings.title || '');
      setDescriptionInput(settings.description || '');
      setNum1(settings.highlight1Num || '');
      setLbl1(settings.highlight1Label || '');
      setNum2(settings.highlight2Num || '');
      setLbl2(settings.highlight2Label || '');
      setNum3(settings.highlight3Num || '');
      setLbl3(settings.highlight3Label || '');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedStatus('');

    try {
      await saveWhoWeAreSettings({
        tag: tagInput,
        title: titleInput,
        description: descriptionInput,
        highlight1Num: num1,
        highlight1Label: lbl1,
        highlight2Num: num2,
        highlight2Label: lbl2,
        highlight3Num: num3,
        highlight3Label: lbl3,
      });
      setSavedStatus('Changes saved successfully in database! ✨');
      setTimeout(() => setSavedStatus(''), 3000);
    } catch {
      alert('Failed to save settings to the backend.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border-card)',
    background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-white)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const textStyle: React.CSSProperties = {
    ...inputStyle,
    resize: 'vertical',
    lineHeight: 1.6,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-white)' }}>
          👥 &quot;Who We Are&quot; Configuration (Database-Backed)
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
          Manage the text descriptors, positioning statements, and key high-level stat indicators. Persisted directly on the server database.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gap: '24px' }}>
        {/* Core details panel */}
        <div style={{ background: 'var(--bg-card-high)', border: '1px solid var(--border-card)', borderRadius: '20px', padding: '28px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-white)', margin: '0 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
            Core Description
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Section Tag</label>
              <input required type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Headline / Section Title</label>
              <input required type="text" value={titleInput} onChange={e => setTitleInput(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Positioning / Descriptive Paragraph</label>
              <textarea required value={descriptionInput} onChange={e => setDescriptionInput(e.target.value)} rows={4} style={textStyle} />
            </div>
          </div>
        </div>

        {/* Highlights panel */}
        <div style={{ background: 'var(--bg-card-high)', border: '1px solid var(--border-card)', borderRadius: '20px', padding: '28px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-white)', margin: '0 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
            Side highlights & Stats
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {/* Highlight 1 */}
            <div style={{ display: 'grid', gap: '10px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-white)' }}>STAT 01</div>
              <div>
                <label style={labelStyle}>Number/Value</label>
                <input required type="text" value={num1} onChange={e => setNum1(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Label</label>
                <input required type="text" value={lbl1} onChange={e => setLbl1(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {/* Highlight 2 */}
            <div style={{ display: 'grid', gap: '10px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-white)' }}>STAT 02</div>
              <div>
                <label style={labelStyle}>Number/Value</label>
                <input required type="text" value={num2} onChange={e => setNum2(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Label</label>
                <input required type="text" value={lbl2} onChange={e => setLbl2(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {/* Highlight 3 */}
            <div style={{ display: 'grid', gap: '10px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-white)' }}>STAT 03</div>
              <div>
                <label style={labelStyle}>Number/Value</label>
                <input required type="text" value={num3} onChange={e => setNum3(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Label</label>
                <input required type="text" value={lbl3} onChange={e => setLbl3(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#34d399' }}>{savedStatus}</span>
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
            {saving ? 'Saving…' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
