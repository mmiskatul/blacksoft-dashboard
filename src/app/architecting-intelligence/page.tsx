'use client';

import React, { useMemo, useState } from 'react';
import { useSiteConfig } from '../../utils/configStore';
import {
  addCapabilityCard,
  deleteCapabilityCard,
  updateCapabilityCard,
  useCapabilityCards,
  type CapabilityCard,
} from '../../utils/capabilitiesStore';

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
  icon: '',
  link: '#services',
};

export default function ArchitectingIntelligencePage() {
  const brandName = useSiteConfig('navbar.brand');
  const [cards] = useCapabilityCards();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [editorOpen, setEditorOpen] = useState(false);

  const visibleCount = useMemo(() => cards.filter((card) => card.enabled).length, [cards]);
  const hiddenCount = cards.length - visibleCount;
  const selectedCard = cards.find((card) => card.id === selectedId) ?? null;

  const openCreate = () => {
    setSelectedId(null);
    setDraft(emptyDraft);
    setEditorOpen(true);
  };

  const openEdit = (card: CapabilityCard) => {
    setSelectedId(card.id);
    setDraft({
      title: card.title,
      description: card.description,
      icon: card.icon,
      link: card.link,
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSelectedId(null);
    setDraft(emptyDraft);
  };

  const saveCurrent = () => {
    const nextTitle = draft.title.trim();
    const nextDescription = draft.description.trim();
    const nextIcon = draft.icon.trim();
    const nextLink = draft.link.trim();

    if (!nextTitle || !nextDescription) {
      return;
    }

    if (selectedCard) {
      updateCapabilityCard(selectedCard.id, {
        title: nextTitle,
        description: nextDescription,
        icon: nextIcon,
        link: nextLink,
      });
    } else {
      addCapabilityCard(nextTitle, nextDescription, nextIcon, nextLink);
    }

    closeEditor();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <section
        style={{
          padding: '28px',
          borderRadius: '22px',
          border: '1px solid var(--border-light)',
          background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.16), rgba(15, 23, 42, 0.92))',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--primary)' }}>
            {brandName.toUpperCase()} SECTION
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-white)' }}>
            Architecting Intelligence
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '70ch' }}>
            The preview matches the landing page. Add and edit actions open a popup editor, while the rest of the page stays visible.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px' }}>
          <div style={{ padding: '16px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Total cards</div>
            <strong style={{ fontSize: '1.6rem', color: 'var(--text-white)' }}>{cards.length}</strong>
          </div>
          <div style={{ padding: '16px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Visible</div>
            <strong style={{ fontSize: '1.6rem', color: 'var(--text-white)' }}>{visibleCount}</strong>
          </div>
          <div style={{ padding: '16px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Hidden</div>
            <strong style={{ fontSize: '1.6rem', color: 'var(--text-white)' }}>{hiddenCount}</strong>
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.45fr) minmax(280px, 0.55fr)',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            padding: '22px',
            borderRadius: '18px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-white)' }}>
                Card Preview
              </h3>
              <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Cards mirror the public landing page and the editor opens as a popup.
              </p>
            </div>
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              Add New
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {cards.map((card) => (
              <article
                key={card.id}
                style={{
                  background: 'var(--bg-card)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid var(--border-card)',
                  padding: '28px 24px',
                  borderRadius: '20px',
                  boxShadow: 'var(--card-shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '260px',
                  opacity: card.enabled ? 1 : 0.6,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'var(--accent-gradient)',
                  }}
                />

                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(79, 70, 229, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      fontWeight: 800,
                      marginBottom: '24px',
                    }}
                  >
                    {card.icon || 'AI'}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <IconButton
                      label={card.enabled ? 'Hide card' : 'Show card'}
                      onClick={() => updateCapabilityCard(card.id, { enabled: !card.enabled })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                        {card.enabled ? (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        ) : (
                          <>
                            <path d="M3 3l18 18" />
                            <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42" />
                            <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-4.23 5.65" />
                            <path d="M6.61 6.61C3.2 8.76 1 12 1 12s4 8 11 8c1.4 0 2.73-.27 3.98-.74" />
                          </>
                        )}
                      </svg>
                    </IconButton>
                    <IconButton
                      label="Edit card"
                      onClick={() => openEdit(card)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </IconButton>
                    <IconButton
                      label="Delete card"
                      onClick={() => deleteCapabilityCard(card.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </IconButton>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px', flexGrow: 1 }}>
                  {card.description}
                </p>
                <a
                  href={card.link || '#services'}
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: 'auto',
                  }}
                >
                  Learn more <span style={{ fontSize: '1rem' }}>↗</span>
                </a>
              </article>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: '22px',
            borderRadius: '18px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-white)' }}>
              Quick Actions
            </h3>
            <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Use the icons on each card or open the editor popup to add a new one.
            </p>
          </div>

          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Add New Card
          </button>
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              fontSize: '0.92rem',
            }}
          >
            The page underneath stays unchanged. Only the editor is shown as an overlay when you add or edit.
          </div>
        </div>
      </section>

      {editorOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 2000,
            padding: '20px',
          }}
          onClick={closeEditor}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(860px, 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(10, 15, 30, 0.98))',
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.45)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)' }}>
                  {selectedCard ? 'Edit Card' : 'Add New Card'}
                </h3>
                <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  {selectedCard ? `Editing ${selectedCard.title}` : 'Create a new capability card.'}
                </p>
              </div>
              <button className="btn btn-secondary" type="button" onClick={closeEditor}>
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                  Card title
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Example: GPU Orchestration"
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

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                  Icon
                </label>
                <input
                  type="text"
                  value={draft.icon}
                  onChange={(event) => setDraft((prev) => ({ ...prev, icon: event.target.value }))}
                  placeholder="AI"
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
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                Description
              </label>
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Example: Managed scaling for inference workloads."
                rows={5}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'var(--text-main)',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                Link
              </label>
              <input
                type="text"
                value={draft.link}
                onChange={(event) => setDraft((prev) => ({ ...prev, link: event.target.value }))}
                placeholder="#services"
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

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" type="button" onClick={saveCurrent}>
                {selectedCard ? 'Save Changes' : 'Add Card'}
              </button>
              {selectedCard && (
                <button className="btn btn-secondary" type="button" onClick={closeEditor}>
                  Cancel Edit
                </button>
              )}
              {selectedCard && (
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    updateCapabilityCard(selectedCard.id, { enabled: !selectedCard.enabled });
                  }}
                >
                  {selectedCard.enabled ? 'Hide Selected' : 'Show Selected'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
