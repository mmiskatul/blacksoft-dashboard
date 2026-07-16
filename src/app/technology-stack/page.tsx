'use client';

import React, { useMemo, useState } from 'react';
import {
  addTechnologyStackCard,
  deleteTechnologyStackCard,
  setTechnologyStackSettings,
  updateTechnologyStackCard,
  useTechnologyStackCards,
  useTechnologyStackSettings,
  type TechnologyStackCard,
  type TechnologyStackIconKey,
} from '../../utils/technologyStackStore';
import { useSiteConfig } from '../../utils/configStore';

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

function renderIcon(iconKey: TechnologyStackIconKey) {
  const iconProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { width: '18px', height: '18px' },
  };

  switch (iconKey) {
    case 'hardware':
      return (
        <svg {...iconProps}>
          <rect x="2" y="2" width="20" height="20" rx="4" />
          <path d="M6 10h12M10 6v12" />
        </svg>
      );
    case 'orchestration':
      return (
        <svg {...iconProps}>
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
          <line x1="12" y1="22" x2="12" y2="12" />
          <line x1="22" y1="8.5" x2="12" y2="12" />
          <line x1="2" y1="8.5" x2="12" y2="12" />
        </svg>
      );
    case 'frontend':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      );
    case 'growth':
    default:
      return (
        <svg {...iconProps}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
  }
}

const emptyDraft = {
  title: '',
  category: '',
  description: '',
  iconKey: 'growth' as TechnologyStackIconKey,
};

const iconOptions: Array<{ key: TechnologyStackIconKey; label: string }> = [
  { key: 'growth', label: 'Growth' },
  { key: 'hardware', label: 'Hardware' },
  { key: 'orchestration', label: 'Orchestration' },
  { key: 'frontend', label: 'Frontend' },
];

export default function TechnologyStackDashboardPage() {
  const brandName = useSiteConfig('navbar.brand');
  const cards = useTechnologyStackCards();
  const settings = useTechnologyStackSettings();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [editorOpen, setEditorOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [settingsEditorOpen, setSettingsEditorOpen] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const visibleCount = useMemo(() => cards.filter((card) => card.enabled).length, [cards]);
  const hiddenCount = cards.length - visibleCount;
  const selectedCard = cards.find((card) => card.id === selectedId) ?? null;

  const openCreate = () => {
    setSelectedId(null);
    setDraft(emptyDraft);
    setEditorOpen(true);
  };

  const openEdit = (card: TechnologyStackCard) => {
    setSelectedId(card.id);
    setDraft({
      title: card.title,
      category: card.category,
      description: card.description,
      iconKey: card.iconKey,
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSelectedId(null);
    setDraft(emptyDraft);
  };

  const executeDelete = () => {
    if (!deleteConfirmId) return;
    deleteTechnologyStackCard(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const saveCurrent = () => {
    const nextTitle = draft.title.trim();
    const nextCategory = draft.category.trim();
    const nextDescription = draft.description.trim();

    if (!nextTitle || !nextCategory || !nextDescription) {
      return;
    }

    if (selectedCard) {
      updateTechnologyStackCard(selectedCard.id, {
        title: nextTitle,
        category: nextCategory,
        description: nextDescription,
        iconKey: draft.iconKey,
      });
    } else {
      addTechnologyStackCard(nextTitle, nextCategory, nextDescription, draft.iconKey);
    }

    closeEditor();
  };

  const openSettingsEditor = () => {
    setSettingsDraft(settings);
    setSettingsEditorOpen(true);
  };

  const closeSettingsEditor = () => {
    setSettingsEditorOpen(false);
    setSettingsDraft(settings);
  };

  const saveSettings = () => {
    setTechnologyStackSettings(settingsDraft);
    closeSettingsEditor();
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
            Our Technology Stack
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '72ch' }}>
            Manage the section title and the technology cards shown on the public Technology page.
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
                These cards control the public technology section.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" type="button" onClick={openSettingsEditor}>
                Edit Section
              </button>
              <button className="btn btn-primary" type="button" onClick={openCreate}>
                Add New
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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
                  padding: '16px',
                  borderRadius: '20px',
                  boxShadow: 'var(--card-shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: card.enabled ? 1 : 0.62,
                  outline: selectedCard?.id === card.id ? '2px solid var(--primary)' : 'none',
                  outlineOffset: '2px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: card.enabled ? '#34d399' : '#fbbf24' }}>
                    {card.enabled ? 'Visible' : 'Hidden'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <IconButton
                      label={card.enabled ? 'Hide card' : 'Show card'}
                      onClick={() => updateTechnologyStackCard(card.id, { enabled: !card.enabled })}
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
                    <IconButton label="Edit card" onClick={() => openEdit(card)}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </IconButton>
                    <IconButton label="Delete card" onClick={() => setDeleteConfirmId(card.id)}>
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

                <div style={{ width: '54px', height: '54px', borderRadius: '16px', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-white)' }}>
                  {renderIcon(card.iconKey)}
                </div>

                <div>
                  <span style={{ display: 'inline-flex', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: '8px' }}>
                    {card.category}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {card.description}
                  </p>
                </div>
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
              Open the popup to add, edit, show, or remove cards.
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
            The public Technology page reads from this section. Update the cards here and the landing page changes automatically.
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
              width: 'min(900px, 100%)',
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
                  {selectedCard ? 'Edit Technology Card' : 'Add New Technology Card'}
                </h3>
                <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  {selectedCard ? `Editing ${selectedCard.title}` : 'Create a new card for the Technology Stack section.'}
                </p>
              </div>
              <button className="btn btn-secondary" type="button" onClick={closeEditor}>
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Example: Vector Databases"
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
                  Category
                </label>
                <input
                  type="text"
                  value={draft.category}
                  onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
                  placeholder="Example: DATA INFRASTRUCTURE"
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
                Icon
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
                {iconOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, iconKey: option.key }))}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: draft.iconKey === option.key ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                      background: draft.iconKey === option.key ? 'rgba(37, 99, 235, 0.14)' : 'rgba(255,255,255,0.02)',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    {renderIcon(option.key)}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
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
            </div>
          </div>
        </div>
      )}

      {settingsEditorOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 2100,
            padding: '20px',
          }}
          onClick={closeSettingsEditor}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(760px, 100%)',
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
                  Edit Section Content
                </h3>
                <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  Update the public heading and supporting line for the Technology page.
                </p>
              </div>
              <button className="btn btn-secondary" type="button" onClick={closeSettingsEditor}>
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                  Section Title
                </label>
                <input
                  type="text"
                  value={settingsDraft.sectionTitle}
                  onChange={(event) => setSettingsDraft((prev) => ({ ...prev, sectionTitle: event.target.value }))}
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
                  Section Subtitle
                </label>
                <textarea
                  value={settingsDraft.sectionSubtitle}
                  onChange={(event) => setSettingsDraft((prev) => ({ ...prev, sectionSubtitle: event.target.value }))}
                  rows={3}
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
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" type="button" onClick={saveSettings}>
                Save Section
              </button>
              <button className="btn btn-secondary" type="button" onClick={closeSettingsEditor}>
                Cancel
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
              Are you sure you want to permanently delete this technology stack card? This action cannot be undone.
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
