'use client';

import React, { useState } from 'react';
import { useStatsSettings, saveStatsSettings } from '../../utils/statsStore';

export default function StatsConfigPage() {
  const settings = useStatsSettings();

  const [val1, setVal1] = useState('');
  const [lbl1, setLbl1] = useState('');
  const [desc1, setDesc1] = useState('');

  const [val2, setVal2] = useState('');
  const [lbl2, setLbl2] = useState('');
  const [desc2, setDesc2] = useState('');

  const [val3, setVal3] = useState('');
  const [lbl3, setLbl3] = useState('');
  const [desc3, setDesc3] = useState('');

  const [savedStatus, setSavedStatus] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setVal1(settings.stat1Value || '');
      setLbl1(settings.stat1Label || '');
      setDesc1(settings.stat1Description || '');

      setVal2(settings.stat2Value || '');
      setLbl2(settings.stat2Label || '');
      setDesc2(settings.stat2Description || '');

      setVal3(settings.stat3Value || '');
      setLbl3(settings.stat3Label || '');
      setDesc3(settings.stat3Description || '');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedStatus('');

    try {
      await saveStatsSettings({
        stat1Value: val1,
        stat1Label: lbl1,
        stat1Description: desc1,
        stat2Value: val2,
        stat2Label: lbl2,
        stat2Description: desc2,
        stat3Value: val3,
        stat3Label: lbl3,
        stat3Description: desc3,
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
          📈 Homepage Statistics Configuration (Database-Backed)
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
          Manage the key statistics counters, target values, and descriptions shown in the client site Stats section. Persisted on the database.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gap: '24px' }}>
        {/* Core details panel */}
        <div style={{ background: 'var(--bg-card-high)', border: '1px solid var(--border-card)', borderRadius: '20px', padding: '28px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-white)', margin: '0 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
            Statistic Items Settings
          </h2>
          
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Stat Item 1 */}
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-white)', marginBottom: '14px' }}>STATISTIC 01</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Value (e.g. 50+)</label>
                  <input required type="text" value={val1} onChange={e => setVal1(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Label (e.g. Products Shipped)</label>
                  <input required type="text" value={lbl1} onChange={e => setLbl1(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea required value={desc1} onChange={e => setDesc1(e.target.value)} rows={2} style={textStyle} />
              </div>
            </div>

            {/* Stat Item 2 */}
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-white)', marginBottom: '14px' }}>STATISTIC 02</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Value (e.g. $250M+)</label>
                  <input required type="text" value={val2} onChange={e => setVal2(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Label (e.g. Value Generated)</label>
                  <input required type="text" value={lbl2} onChange={e => setLbl2(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea required value={desc2} onChange={e => setDesc2(e.target.value)} rows={2} style={textStyle} />
              </div>
            </div>

            {/* Stat Item 3 */}
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-white)', marginBottom: '14px' }}>STATISTIC 03</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Value (e.g. 100%)</label>
                  <input required type="text" value={val3} onChange={e => setVal3(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Label (e.g. Success Rate)</label>
                  <input required type="text" value={lbl3} onChange={e => setLbl3(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea required value={desc3} onChange={e => setDesc3(e.target.value)} rows={2} style={textStyle} />
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
