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
  
  // Modal visibility
  const [showModal, setShowModal] = useState(false);

  // Forms & Editing states
  const [nameInput, setNameInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
    setShowModal(false);
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setNameInput(name);
    setShowModal(true);
  };

  const startCreate = () => {
    setEditingId(null);
    setNameInput('');
    setShowModal(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNameInput('');
    setShowModal(false);
  };

  const executeDelete = () => {
    if (!deleteConfirmId) return;
    deleteTrustedInnovator(deleteConfirmId);
    setDeleteConfirmId(null);
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
        <button 
          onClick={startCreate}
          style={{
            flex: '0 0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 22px',
            border: 'none',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #3f8cff 100%)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
          }}
        >
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> Add Brand Logo
        </button>
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

      {/* Brand Listing */}
      <section className={`${styles.panel} ${styles.glassPanel}`} style={{ marginTop: '24px' }}>
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
                    onClick={() => setDeleteConfirmId(item.id)}
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

      {/* Modal Popup overlay */}
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(4, 6, 12, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '20px',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) cancelEdit();
          }}
        >
          <div 
            className={`${styles.panel} ${styles.glassPanel}`}
            style={{
              width: 'min(100%, 460px)',
              background: 'rgba(12, 19, 33, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255,255,255,0.05)',
              padding: '30px',
              animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div className={styles.panelHeader} style={{ marginBottom: '18px' }}>
              <h3 className={styles.panelTitle}>
                {editingId ? '✏️ Edit Brand Name' : '➕ Add Partner Brand'}
              </h3>
              <button
                type="button"
                onClick={cancelEdit}
                style={{ 
                  color: '#fca5a5', 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(4, 6, 12, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 3000,
            padding: '20px'
          }}
        >
          <div 
            className={`${styles.panel} ${styles.glassPanel}`}
            style={{
              width: 'min(100%, 400px)',
              background: 'rgba(12, 19, 33, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8)',
              padding: '30px',
              textAlign: 'center',
              borderRadius: '20px',
              animation: 'slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>Confirm Deletion</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-light)', lineHeight: 1.5, marginBottom: '24px' }}>
              Are you sure you want to permanently delete this partner brand? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-muted)',
                  fontWeight: 'bold',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
