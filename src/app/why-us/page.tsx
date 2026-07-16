'use client';

import React, { useMemo, useState } from 'react';
import { useWhyUsCards, addWhyUsCard, updateWhyUsCard, deleteWhyUsCard, type WhyUsCard } from '../../utils/whyUsStore';

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        color: 'var(--text-white)',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

const emptyDraft = {
  title: '',
  description: '',
  icon: '⚡',
};

export default function WhyUsConfigPage() {
  const [cards, hydrated] = useWhyUsCards();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const visibleCount = useMemo(() => cards.filter((card) => card.enabled).length, [cards]);
  const hiddenCount = cards.length - visibleCount;

  const openCreate = () => {
    setSelectedId(null);
    setDraft(emptyDraft);
    setEditorOpen(true);
  };

  const openEdit = (card: WhyUsCard) => {
    setSelectedId(card.id);
    setDraft({
      title: card.title,
      description: card.description,
      icon: card.icon,
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSelectedId(null);
    setDraft(emptyDraft);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.description.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setSaving(true);
    try {
      if (selectedId) {
        await updateWhyUsCard(selectedId, draft);
      } else {
        await addWhyUsCard(draft);
      }
      closeEditor();
    } catch {
      alert('Failed to save card.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (card: WhyUsCard) => {
    try {
      await updateWhyUsCard(card.id, { enabled: !card.enabled });
    } catch {
      alert('Failed to toggle status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this benefit? This cannot be undone.')) {
      return;
    }

    try {
      await deleteWhyUsCard(id);
      if (selectedId === id) {
        closeEditor();
      }
    } catch {
      alert('Failed to delete card.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-white)' }}>
            💡 &quot;Why Us&quot; Core Benefits
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
            Configure and manage the structural advantages and value propositions displayed in the homepage section.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          style={{
            padding: '10px 20px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.25)',
          }}
        >
          + Add Benefit Card
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total benefits', val: cards.length, color: '#06b6d4' },
          { label: 'Visible on landing page', val: visibleCount, color: '#34d399' },
          { label: 'Hidden benefits', val: hiddenCount, color: '#f87171' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid var(--border-card)',
              background: 'var(--bg-card-high)',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color, marginTop: '6px' }}>
              {stat.val}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexDirection: 'column', width: '100%' }}>
        {/* Cards Grid */}
        <div style={{ flex: 1, width: '100%' }}>
          {!hydrated && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading cards…</div>}
          {hydrated && cards.length === 0 && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              background: 'var(--bg-card-high)',
              border: '1px dashed var(--border-card)',
              borderRadius: '16px',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💡</div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                No benefit cards created yet. Click &quot;Add Benefit Card&quot; to begin.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', width: '100%' }}>
            {cards.map((card) => {
              const isActive = card.id === selectedId;
              return (
                <div
                  key={card.id}
                  style={{
                    background: 'var(--bg-card-high)',
                    border: `1.5px solid ${isActive ? '#06b6d4' : 'var(--border-card)'}`,
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    position: 'relative',
                    transition: 'all 0.2s',
                    opacity: card.enabled ? 1 : 0.6,
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '28px' }}>{card.icon}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <IconButton label="Edit card" onClick={() => openEdit(card)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </IconButton>
                      <IconButton label={card.enabled ? 'Disable card' : 'Enable card'} onClick={() => handleToggle(card)}>
                        {card.enabled ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                          </svg>
                        )}
                      </IconButton>
                      <IconButton label="Delete card" onClick={() => handleDelete(card.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </IconButton>
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-white)' }}>
                      {card.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                      {card.description}
                    </p>
                  </div>

                  {/* Visible footer */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: card.enabled ? 'rgba(52, 211, 153, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                      color: card.enabled ? '#34d399' : '#f43f5e',
                      border: `1px solid ${card.enabled ? 'rgba(52, 211, 153, 0.15)' : 'rgba(244, 63, 94, 0.15)'}`,
                    }}>
                      {card.enabled ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor Form Modal */}
        {editorOpen && (
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
              if (e.target === e.currentTarget) closeEditor();
            }}
          >
            <div
              style={{
                width: 'min(100%, 460px)',
                background: 'rgba(12, 19, 33, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '30px',
                animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-white)' }}>
                  {selectedId ? 'Edit Benefit' : 'New Benefit'}
                </h2>
                <button
                  type="button"
                  onClick={closeEditor}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '18px',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Icon Emoji *
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={10}
                    value={draft.icon}
                    onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-card)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-white)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    placeholder="e.g. ⚡, 🔒, 🚀"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Benefit Title *
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={120}
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-card)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-white)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    placeholder="e.g. Enterprise Security"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Description *
                  </label>
                  <textarea
                    required
                    maxLength={1000}
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-card)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-white)',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      outline: 'none',
                      resize: 'none',
                    }}
                    placeholder="Describe this structural benefit or differentiator…"
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={closeEditor}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-card)',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '13px',
                      border: 'none',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving…' : 'Save Card'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
