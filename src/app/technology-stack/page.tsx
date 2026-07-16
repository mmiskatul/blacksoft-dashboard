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

// ─── SVG Icon Renderer ────────────────────────────────────────────────────────

function renderIcon(iconKey: TechnologyStackIconKey, size = 18) {
  const iconProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { width: `${size}px`, height: `${size}px` },
  };
  switch (iconKey) {
    case 'frontend': return <svg {...iconProps}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
    case 'backend': return <svg {...iconProps}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /><path d="M7 8l2 2-2 2" /><line x1="11" y1="10" x2="15" y2="10" /></svg>;
    case 'mobile': return <svg {...iconProps}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;
    case 'database': return <svg {...iconProps}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" /></svg>;
    case 'cloud': return <svg {...iconProps}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>;
    case 'ai': return <svg {...iconProps}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-3-9.35A2.5 2.5 0 0 1 5.5 7h7" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l3-9.35A2.5 2.5 0 0 0 18.5 7h-7" /></svg>;
    case 'design': return <svg {...iconProps}><path d="M2 13.5V21h7.5" /><path d="M22 13.5V21h-7.5" /><path d="M12 2L2 13.5h20L12 2z" /></svg>;
    case 'devops': return <svg {...iconProps}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
    case 'testing': return <svg {...iconProps}><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
    case 'hardware': return <svg {...iconProps}><rect x="2" y="2" width="20" height="20" rx="4" /><path d="M6 10h12M10 6v12" /></svg>;
    case 'orchestration': return <svg {...iconProps}><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" /><line x1="12" y1="22" x2="12" y2="12" /><line x1="22" y1="8.5" x2="12" y2="12" /><line x1="2" y1="8.5" x2="12" y2="12" /></svg>;
    case 'growth':
    default: return <svg {...iconProps}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
  }
}

// ─── Icon Options ─────────────────────────────────────────────────────────────

const ICON_OPTIONS: Array<{ key: TechnologyStackIconKey; label: string; desc: string }> = [
  { key: 'frontend',     label: 'Frontend',     desc: 'Code / UI' },
  { key: 'backend',     label: 'Backend',      desc: 'Server / API' },
  { key: 'mobile',      label: 'Mobile',       desc: 'App / Device' },
  { key: 'database',    label: 'Database',     desc: 'Storage' },
  { key: 'cloud',       label: 'Cloud',        desc: 'Hosting' },
  { key: 'orchestration', label: 'Container',  desc: 'Docker / K8s' },
  { key: 'devops',      label: 'DevOps / CI',  desc: 'Pipeline' },
  { key: 'ai',          label: 'AI / ML',      desc: 'Intelligence' },
  { key: 'design',      label: 'Design',       desc: 'UI / UX' },
  { key: 'testing',     label: 'Testing',      desc: 'QA' },
  { key: 'hardware',    label: 'Hardware',     desc: 'GPU / Compute' },
  { key: 'growth',      label: 'Growth',       desc: 'General' },
];

// Suggested category names matching the frontend grouping
const CATEGORY_SUGGESTIONS = [
  'FIGMA',
  'FRONTEND',
  'APP',
  'BACKEND',
  'DEPLOYMENT',
];

// Default category ordering for grouping
const CATEGORY_ORDER = ['FIGMA', 'FRONTEND', 'APP', 'BACKEND', 'DEPLOYMENT'];

// ─── Shared Styles ────────────────────────────────────────────────────────────

const input: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.09)',
  background: 'rgba(255,255,255,0.03)',
  color: 'var(--text-main)',
  fontSize: '0.9rem',
  outline: 'none',
};

const label: React.CSSProperties = {
  display: 'block',
  marginBottom: '7px',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: 'var(--text-light)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const emptyDraft = {
  title: '',
  category: '',
  description: '',
  iconKey: 'frontend' as TechnologyStackIconKey,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TechnologyStackDashboardPage() {
  const brandName = useSiteConfig('navbar.brand');
  const cards = useTechnologyStackCards();
  const settings = useTechnologyStackSettings();

  const [draft, setDraft] = useState(emptyDraft);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [settingsEditorOpen, setSettingsEditorOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [showCatSuggestions, setShowCatSuggestions] = useState(false);
  const [catInput, setCatInput] = useState('');

  const visibleCount = useMemo(() => cards.filter((c) => c.enabled).length, [cards]);
  const hiddenCount = cards.length - visibleCount;
  const selectedCard = cards.find((c) => c.id === selectedId) ?? null;

  // Unique categories present in current cards
  const existingCategories = useMemo(() => {
    const cats = new Set<string>();
    cards.forEach((c) => cats.add(c.category));
    return Array.from(cats).sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [cards]);

  // Cards grouped by category for display
  const grouped = useMemo(() => {
    const filtered = filterCat === 'ALL' ? cards : cards.filter((c) => c.category === filterCat);
    const map: Record<string, TechnologyStackCard[]> = {};
    filtered.forEach((c) => {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    });
    const sorted = Object.keys(map).sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    return sorted.map((cat) => ({ category: cat, cards: map[cat] }));
  }, [cards, filterCat]);

  const openCreate = () => {
    setSelectedId(null);
    setDraft(emptyDraft);
    setEditorOpen(true);
  };

  const openEdit = (card: TechnologyStackCard) => {
    setSelectedId(card.id);
    setDraft({ title: card.title, category: card.category, description: card.description, iconKey: card.iconKey });
    setEditorOpen(true);
  };

  const closeEditor = () => { setEditorOpen(false); setSelectedId(null); setDraft(emptyDraft); };

  const saveCard = () => {
    const t = draft.title.trim();
    const cat = draft.category.trim();
    const d = draft.description.trim();
    if (!t || !cat || !d) return;
    if (selectedCard) {
      updateTechnologyStackCard(selectedCard.id, { title: t, category: cat, description: d, iconKey: draft.iconKey });
    } else {
      addTechnologyStackCard(t, cat, d, draft.iconKey);
    }
    closeEditor();
  };

  const executeDelete = () => {
    if (!deleteConfirmId) return;
    deleteTechnologyStackCard(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const saveSettings = () => { setTechnologyStackSettings(settingsDraft); setSettingsEditorOpen(false); };

  const catSuggestions = useMemo(() => {
    const all = Array.from(new Set([...CATEGORY_SUGGESTIONS, ...existingCategories]));
    return all.filter((c) => c.toLowerCase().includes(catInput.toLowerCase())).slice(0, 8);
  }, [catInput, existingCategories]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <section style={{
        padding: '28px 32px',
        borderRadius: '22px',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.12), rgba(15, 23, 42, 0.92))',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--primary)', textTransform: 'uppercase' }}>
              {brandName} / Technology Stack
            </span>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-white)', margin: '8px 0 6px' }}>
              Technology Stack Manager
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '60ch', fontSize: '0.92rem' }}>
              Add, edit, and organise the technology cards shown on the public landing page and Technology section.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button className="btn btn-secondary" type="button" onClick={() => { setSettingsDraft(settings); setSettingsEditorOpen(true); }}>
              ✏️ Edit Section Title
            </button>
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              + Add Card
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '14px', marginTop: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Cards', value: cards.length },
            { label: 'Visible', value: visibleCount, color: '#34d399' },
            { label: 'Hidden', value: hiddenCount, color: '#fbbf24' },
            { label: 'Categories', value: existingCategories.length },
          ].map(({ label: l, value, color }) => (
            <div key={l} style={{ padding: '12px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{l}</div>
              <strong style={{ fontSize: '1.5rem', color: color ?? 'var(--text-white)' }}>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Filter Tabs ─────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginRight: '4px' }}>FILTER:</span>
        {['ALL', ...existingCategories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCat(cat)}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              border: filterCat === cat ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
              background: filterCat === cat ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.03)',
              color: filterCat === cat ? '#a5b4fc' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}
          >
            {cat === 'ALL' ? `All (${cards.length})` : cat}
          </button>
        ))}
      </div>

      {/* ── Cards — Grouped by Category ─────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {grouped.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '18px' }}>
            No cards found. Click <strong style={{ color: 'var(--primary)' }}>+ Add Card</strong> to get started.
          </div>
        )}
        {grouped.map(({ category, cards: catCards }) => (
          <div key={category}>
            {/* Category header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--primary)', textTransform: 'uppercase' }}>
                {category}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{catCards.length} cards</span>
            </div>

            {/* Grid of cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {catCards.map((card) => (
                <article
                  key={card.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${card.enabled ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
                    borderRadius: '16px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    opacity: card.enabled ? 1 : 0.55,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {/* Top bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '11px',
                      display: 'grid', placeItems: 'center',
                      background: 'rgba(99,102,241,0.1)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(99,102,241,0.2)',
                    }}>
                      {renderIcon(card.iconKey, 17)}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {/* Visibility toggle */}
                      <button type="button" title={card.enabled ? 'Hide' : 'Show'} onClick={() => updateTechnologyStackCard(card.id, { enabled: !card.enabled })}
                        style={{ width: '32px', height: '32px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: card.enabled ? '#34d399' : '#fbbf24', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                          {card.enabled
                            ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                            : <><path d="M3 3l18 18" /><path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42" /><path d="M9.88 5.09A11 11 0 0 1 12 4c7 0 11 8 11 8a21 21 0 0 1-4.23 5.65" /><path d="M6.61 6.61C3.2 8.76 1 12 1 12s4 8 11 8c1.4 0 2.73-.27 3.98-.74" /></>
                          }
                        </svg>
                      </button>
                      {/* Edit */}
                      <button type="button" title="Edit" onClick={() => openEdit(card)}
                        style={{ width: '32px', height: '32px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-white)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button type="button" title="Delete" onClick={() => setDeleteConfirmId(card.id)}
                        style={{ width: '32px', height: '32px', borderRadius: '9px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                          <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Card content */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-white)', margin: '0 0 6px' }}>{card.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>{card.description}</p>
                  </div>

                  {/* Status badge */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
                      padding: '3px 9px', borderRadius: '20px',
                      background: card.enabled ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                      color: card.enabled ? '#34d399' : '#fbbf24',
                      border: `1px solid ${card.enabled ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
                    }}>
                      {card.enabled ? '● VISIBLE' : '○ HIDDEN'}
                    </span>
                  </div>
                </article>
              ))}

              {/* Add card shortcut inside category */}
              <button
                type="button"
                onClick={() => { setDraft({ ...emptyDraft, category }); setSelectedId(null); setEditorOpen(true); }}
                style={{
                  borderRadius: '16px', border: '1px dashed rgba(99,102,241,0.3)',
                  background: 'rgba(99,102,241,0.04)', color: 'var(--primary)',
                  padding: '18px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', minHeight: '140px', fontSize: '0.88rem', fontWeight: 700,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '24px' }}>+</span>
                Add to {category}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────── */}
      {editorOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.78)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center', zIndex: 2000, padding: '20px' }}
          onClick={closeEditor}
        >
          <div
            role="dialog" aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(860px, 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.09)', background: 'linear-gradient(180deg, rgba(14,22,40,0.99), rgba(8,13,24,0.99))', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-white)', margin: 0 }}>
                  {selectedCard ? '✏️ Edit Card' : '➕ Add New Tech Card'}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                  {selectedCard ? `Editing: ${selectedCard.title}` : 'This card will appear in the Technology Stack section on the landing page.'}
                </p>
              </div>
              <button className="btn btn-secondary" type="button" onClick={closeEditor} style={{ flexShrink: 0 }}>✕ Close</button>
            </div>

            {/* Title + Category row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={label}>Technology Name *</span>
                <input style={input} type="text" placeholder="e.g. React.js" value={draft.title}
                  onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div style={{ position: 'relative' }}>
                <span style={label}>Category *</span>
                <input style={input} type="text" placeholder="e.g. FRONTEND FRAMEWORK"
                  value={draft.category}
                  onChange={(e) => { setDraft((p) => ({ ...p, category: e.target.value })); setCatInput(e.target.value); setShowCatSuggestions(true); }}
                  onFocus={() => { setCatInput(draft.category); setShowCatSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowCatSuggestions(false), 150)}
                />
                {showCatSuggestions && catSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(12,19,33,0.98)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                    {catSuggestions.map((s) => (
                      <button key={s} type="button"
                        onMouseDown={() => { setDraft((p) => ({ ...p, category: s })); setShowCatSuggestions(false); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <span style={label}>Description *</span>
              <textarea style={{ ...input, resize: 'vertical' }} rows={4}
                placeholder="Describe what this technology does and why you use it..."
                value={draft.description}
                onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} />
            </div>

            {/* Icon Picker */}
            <div>
              <span style={label}>Icon / Category Type</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {ICON_OPTIONS.map((opt) => {
                  const active = draft.iconKey === opt.key;
                  return (
                    <button key={opt.key} type="button" onClick={() => setDraft((p) => ({ ...p, iconKey: opt.key }))}
                      style={{
                        padding: '12px 10px', borderRadius: '12px', cursor: 'pointer',
                        border: active ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                        background: active ? 'rgba(99,102,241,0.16)' : 'rgba(255,255,255,0.02)',
                        color: active ? '#a5b4fc' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        transition: 'all 0.2s',
                      }}>
                      <span style={{ color: active ? '#a5b4fc' : 'var(--text-muted)' }}>{renderIcon(opt.key, 16)}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{opt.label}</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '18px' }}>
              <button className="btn btn-primary" type="button" onClick={saveCard}
                style={{ opacity: (!draft.title.trim() || !draft.category.trim() || !draft.description.trim()) ? 0.5 : 1 }}>
                {selectedCard ? '✓ Save Changes' : '+ Add Card'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={closeEditor}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ───────────────────────────────────────── */}
      {settingsEditorOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.78)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center', zIndex: 2100, padding: '20px' }}
          onClick={() => setSettingsEditorOpen(false)}>
          <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(680px,100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.09)', background: 'linear-gradient(180deg, rgba(14,22,40,0.99), rgba(8,13,24,0.99))', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)', margin: 0 }}>✏️ Edit Section Title</h3>
              <button className="btn btn-secondary" type="button" onClick={() => setSettingsEditorOpen(false)}>✕ Close</button>
            </div>
            <div>
              <span style={label}>Section Title</span>
              <input style={input} type="text" value={settingsDraft.sectionTitle}
                onChange={(e) => setSettingsDraft((p) => ({ ...p, sectionTitle: e.target.value }))}
                placeholder="Our Technology Stack" />
            </div>
            <div>
              <span style={label}>Section Subtitle</span>
              <textarea style={{ ...input, resize: 'vertical' }} rows={3} value={settingsDraft.sectionSubtitle}
                onChange={(e) => setSettingsDraft((p) => ({ ...p, sectionSubtitle: e.target.value }))}
                placeholder="Built on battle-tested frameworks..." />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" type="button" onClick={saveSettings}>✓ Save</button>
              <button className="btn btn-secondary" type="button" onClick={() => setSettingsEditorOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────── */}
      {deleteConfirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,6,12,0.82)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'grid', placeItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ width: 'min(400px,100%)', background: 'rgba(12,19,33,0.97)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.8)', padding: '32px', textAlign: 'center', borderRadius: '20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '14px' }}>⚠️</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>Delete this card?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              This will permanently remove the card from both the dashboard and the public site. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setDeleteConfirmId(null)}
                style={{ padding: '10px 22px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={executeDelete}
                style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 18px rgba(239,68,68,0.4)' }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
