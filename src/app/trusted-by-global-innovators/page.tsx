'use client';

import React, { useMemo, useState } from 'react';
import styles from '../page.module.css';
import { useSiteConfig } from '../../utils/configStore';
import {
  addTrustedInnovator,
  deleteTrustedInnovator,
  updateTrustedInnovator,
  useTrustedInnovators,
} from '../../utils/trustedInnovatorsStore';

export default function TrustedInnovatorsPage() {
  const brandName = useSiteConfig('navbar.brand');
  const [items] = useTrustedInnovators();
  
  // Forms & Editing states
  const [nameInput, setNameInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCount = useMemo(() => items.filter((item) => item.enabled).length, [items]);

  const handleSubmit = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    if (editingId) {
      // Update existing name
      updateTrustedInnovator(editingId, { name: trimmed });
      setEditingId(null);
    } else {
      // Add new
      addTrustedInnovator(trimmed);
    }
    setNameInput('');
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setNameInput(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNameInput('');
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>{brandName.toUpperCase()} CONTROL</span>
          <h1 className={styles.title}>
            Trusted by <span className={styles.titleGradient}>Global Innovators</span>
          </h1>
          <p className={styles.intro}>
            Manage client logo markings, partner names, and startup brands displayed on the homepage trusted banner.
          </p>
        </div>
      </header>

      {/* Metrics Row */}
      <section className={styles.metrics} style={{ marginTop: '24px' }}>
        <article className={`${styles.metric} float-hover`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Entries</span>
            <span className={styles.metricIcon} style={{ textShadow: '0 0 12px #c3c0ff' }}>📊</span>
          </div>
          <div className={styles.metricValue}>{items.length}</div>
          <div className={styles.metricDetail}>Brands configured</div>
          <div className={styles.metricGlowBorder} style={{ background: 'linear-gradient(90deg, transparent, #c3c0ff 50%, transparent)' }} />
        </article>

        <article className={`${styles.metric} float-hover`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Active Logos</span>
            <span className={styles.metricIcon} style={{ textShadow: '0 0 12px #60dcb8' }}>🟢</span>
          </div>
          <div className={styles.metricValue}>{activeCount}</div>
          <div className={styles.metricDetail}>Visible on landing page</div>
          <div className={styles.metricGlowBorder} style={{ background: 'linear-gradient(90deg, transparent, #60dcb8 50%, transparent)' }} />
        </article>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)', gap: '24px', marginTop: '24px' }}>
        
        {/* Left Side: Brand Listing */}
        <section className={`${styles.panel} ${styles.glassPanel}`}>
          <div className={styles.panelHeader} style={{ marginBottom: '18px' }}>
            <h3 className={styles.panelTitle}>Active Partners</h3>
            <span className={styles.panelKicker}>Manage Display Order</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: '0.82rem', padding: '15px 0' }}>No partner brands added yet.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    background: editingId === item.id ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-light)', marginTop: '2px' }}>{item.id}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => startEdit(item.id, item.name)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#818cf8',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      Edit Name
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTrustedInnovator(item.id, { enabled: !item.enabled })}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: item.enabled ? 'rgba(96, 220, 184, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: item.enabled ? '#63ddb9' : '#8190a6',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {item.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTrustedInnovator(item.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#fca5a5',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Side: Form Input Panel */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={`${styles.panel} ${styles.glassPanel}`} style={{ position: 'sticky', top: '24px' }}>
            <div className={styles.panelHeader} style={{ marginBottom: '18px' }}>
              <h3 className={styles.panelTitle}>
                {editingId ? '✏️ Edit Brand Name' : '➕ Add Partner Brand'}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{ color: '#fca5a5', fontSize: '0.75rem', fontWeight: 'bold' }}
                >
                  Cancel
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', color: '#8d9bb0', fontWeight: 'bold' }}>
                  BRAND NAME
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="e.g. METALOGIC SYSTEMS"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(10, 16, 28, 0.6)',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                style={{
                  marginTop: '6px',
                  padding: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #3f8cff 100%)',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.25)',
                  textAlign: 'center',
                }}
              >
                {editingId ? 'Save Changes' : 'Add Brand Name'}
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

