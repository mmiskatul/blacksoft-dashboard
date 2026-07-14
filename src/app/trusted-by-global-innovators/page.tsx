'use client';

import React, { useMemo, useState } from 'react';
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
  const [newName, setNewName] = useState('');

  const activeCount = useMemo(() => items.filter((item) => item.enabled).length, [items]);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      return;
    }

    addTrustedInnovator(trimmed);
    setNewName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <section
        style={{
          padding: '28px',
          borderRadius: '20px',
          border: '1px solid var(--border-light)',
          background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.16), rgba(15, 23, 42, 0.92))',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--primary)' }}>
            {brandName.toUpperCase()} SECTION
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-white)' }}>
            Trusted By Global Innovators
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '70ch' }}>
            Add the company names shown on the homepage section and enable or disable each one without touching code.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px' }}>
          <div style={{ padding: '16px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Total entries</div>
            <strong style={{ fontSize: '1.6rem', color: 'var(--text-white)' }}>{items.length}</strong>
          </div>
          <div style={{ padding: '16px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Enabled</div>
            <strong style={{ fontSize: '1.6rem', color: 'var(--text-white)' }}>{activeCount}</strong>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '24px',
          borderRadius: '18px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: '12px',
          alignItems: 'end',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>
            Add a new innovator name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Example: AURORA SYSTEMS"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--text-main)',
            }}
          />
        </div>
        <button className="btn btn-primary" type="button" onClick={handleAdd}>
          Add Name
        </button>
      </section>

      <section
        style={{
          padding: '24px',
          borderRadius: '18px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
        }}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '16px' }}>
          Manage Entries
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto auto',
                gap: '12px',
                alignItems: 'center',
                padding: '14px 16px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-white)' }}>{item.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{item.id}</div>
              </div>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => updateTrustedInnovator(item.id, { enabled: !item.enabled })}
              >
                {item.enabled ? 'Disable' : 'Enable'}
              </button>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => deleteTrustedInnovator(item.id)}
                style={{ color: '#ef4444' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
