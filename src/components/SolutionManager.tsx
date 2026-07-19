'use client';

import React from 'react';
import type { SolutionCard } from '../utils/solutionCardsStore';
import styles from './SolutionManager.module.css';

type Props = { title: string; eyebrow: string; description: string; cards: SolutionCard[]; onAdd: (title: string, description: string, category: string, icon: string, link: string) => void; onUpdate: (id: string, patch: Partial<SolutionCard>) => void; onDelete: (id: string) => void };
const blank = { title: '', description: '', category: 'App', icon: 'AI', link: '#solutions' };

export default function SolutionManager({ title, eyebrow, description, cards, onAdd, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = React.useState<string | null>(null);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(blank);
  const selected = cards.find((card) => card.id === editing);
  const openCreate = () => { setEditing(null); setDraft(blank); setEditorOpen(true); };
  const openEdit = (card: SolutionCard) => { setEditing(card.id); setDraft({ title: card.title, description: card.description, category: card.category || 'App', icon: card.icon, link: card.link }); setEditorOpen(true); };
  const save = () => {
    if (!draft.title.trim() || !draft.description.trim()) return;
    if (selected) onUpdate(selected.id, draft); else onAdd(draft.title, draft.description, draft.category, draft.icon, draft.link);
    setEditing(null); setDraft(blank); setEditorOpen(false);
  };
  return <div className={styles.page}>
    <section className={styles.hero}><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p><div className={styles.stats}><b>{cards.length}<small>Total cards</small></b><b>{cards.filter((card) => card.enabled).length}<small>Published</small></b><button className="btn btn-primary" onClick={openCreate}>+ Add new card</button></div></section>
    <section className={styles.workspace}>
      <div className={styles.listHeader}><div><h2>Live content</h2><p>Cards are rendered on the public Solutions page.</p></div></div>
      <div className={styles.grid}>{cards.map((card) => <article className={`${styles.card} ${!card.enabled ? styles.disabled : ''}`} key={card.id}><div className={styles.cardBar}><span>{card.icon}</span><strong>{card.enabled ? 'Published' : 'Hidden'}</strong></div><div style={{ marginTop: '10px', fontSize: '0.62rem', color: '#68dfba', fontWeight: 800 }}>CATEGORY: {card.category?.toUpperCase() || 'APP'}</div><h3>{card.title}</h3><p>{card.description}</p><div className={styles.actions}><button onClick={() => onUpdate(card.id, { enabled: !card.enabled })}>{card.enabled ? 'Hide' : 'Publish'}</button><button onClick={() => openEdit(card)}>Edit</button><button onClick={() => onDelete(card.id)}>Delete</button></div></article>)}</div>
    </section>
    {editorOpen && <div className={styles.editor}><div className={styles.editorPanel}><div className={styles.editorHeader}><div><span>{selected ? 'EDIT CARD' : 'NEW CARD'}</span><h2>{selected ? 'Refine this solution' : 'Add a solution card'}</h2></div><button onClick={() => setEditorOpen(false)} aria-label="Close editor">×</button></div><label>Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. AI workflow platform" /></label><label>Description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={4} placeholder="Explain the outcome this solution creates." /></label><div className={styles.twoCol}><label>Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '7px', padding: '11px 12px', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', outline: 'none', color: '#eaf1f8', background: '#0b1422', font: 'inherit', fontSize: '.78rem' }}><option value="App">App Development</option><option value="Website">Website Development</option><option value="AI Solution">AI Solutions</option><option value="Progressive Web App">Progressive Web App</option><option value="Other">Other Solutions</option></select></label><label>Icon<input value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value })} /></label></div><label>Link<input value={draft.link} onChange={(event) => setDraft({ ...draft, link: event.target.value })} /></label><div className={styles.editorActions}><button className="btn btn-primary" onClick={save}>{selected ? 'Save changes' : 'Add card'}</button><button className="btn btn-secondary" onClick={() => setEditorOpen(false)}>Cancel</button></div></div></div>}
  </div>;
}
