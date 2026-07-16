'use client';

import React, { useState, useMemo } from 'react';
import styles from '../page.module.css';
import { 
  useAppWebsiteCards, 
  useAiSolutionCards, 
  appWebsiteStore, 
  aiSolutionStore,
  type SolutionCard 
} from '../../utils/solutionCardsStore';

export default function SolutionsManagerPage() {
  const [appCards] = useAppWebsiteCards();
  const [aiCards] = useAiSolutionCards();

  // Selected card for editing
  const [selectedCard, setSelectedCard] = useState<SolutionCard | null>(null);
  
  // Track original store to handle category switching/migration
  const [originalStore, setOriginalStore] = useState<'app' | 'ai' | null>(null);

  // Form states
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftCategory, setDraftCategory] = useState('App');
  const [draftIcon, setDraftIcon] = useState('🧠');
  const [draftLink, setDraftLink] = useState('#solutions');
  const [draftEnabled, setDraftEnabled] = useState(true);

  // Combine and normalize categories for sorting/display
  const allCards = useMemo(() => {
    return [
      ...appCards.map(c => ({ ...c, __store: 'app' as const })),
      ...aiCards.map(c => ({ ...c, __store: 'ai' as const }))
    ];
  }, [appCards, aiCards]);

  const categories = ['App', 'Website', 'Figma design', 'Backend development', 'AI solution'];

  // Start editing a card
  const handleEdit = (card: SolutionCard & { __store: 'app' | 'ai' }) => {
    setSelectedCard(card);
    setOriginalStore(card.__store);
    setDraftTitle(card.title);
    setDraftDescription(card.description);
    // Map internal key to dropdown
    let cat = card.category;
    const lower = cat.toLowerCase();
    if (lower === 'app') cat = 'App';
    else if (lower === 'website') cat = 'Website';
    else if (lower.includes('figma') || lower.includes('design')) cat = 'Figma design';
    else if (lower.includes('backend') || lower.includes('developement') || lower.includes('development')) cat = 'Backend development';
    else if (lower.includes('ai') || lower.includes('solution')) cat = 'AI solution';
    
    setDraftCategory(cat);
    setDraftIcon(card.icon);
    setDraftLink(card.link);
    setDraftEnabled(card.enabled);
  };

  // Reset form
  const handleReset = () => {
    setSelectedCard(null);
    setOriginalStore(null);
    setDraftTitle('');
    setDraftDescription('');
    setDraftCategory('App');
    setDraftIcon('🧠');
    setDraftLink('#solutions');
    setDraftEnabled(true);
  };

  // Save changes (Create or Update)
  const handleSave = () => {
    if (!draftTitle.trim() || !draftDescription.trim()) {
      alert('Title and Description are required.');
      return;
    }

    const targetStoreType = draftCategory === 'AI solution' ? 'ai' : 'app';
    const activeStore = targetStoreType === 'ai' ? aiSolutionStore : appWebsiteStore;

    if (selectedCard) {
      // Edit mode
      if (originalStore === targetStoreType) {
        // Simple update in same store
        activeStore.update(selectedCard.id, {
          title: draftTitle.trim(),
          description: draftDescription.trim(),
          category: draftCategory,
          icon: draftIcon.trim(),
          link: draftLink.trim(),
          enabled: draftEnabled
        });
      } else {
        // Migrating card from one store to another
        const oldStore = originalStore === 'ai' ? aiSolutionStore : appWebsiteStore;
        // 1. Delete from old store
        oldStore.remove(selectedCard.id);
        // 2. Add to new store
        activeStore.add(
          draftTitle.trim(),
          draftDescription.trim(),
          draftCategory,
          draftIcon.trim(),
          draftLink.trim()
        );
      }
    } else {
      // Create mode
      activeStore.add(
        draftTitle.trim(),
        draftDescription.trim(),
        draftCategory,
        draftIcon.trim(),
        draftLink.trim()
      );
    }

    handleReset();
  };

  // Delete a card
  const handleDelete = (id: string, storeType: 'app' | 'ai') => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    const store = storeType === 'ai' ? aiSolutionStore : appWebsiteStore;
    store.remove(id);
    if (selectedCard?.id === id) {
      handleReset();
    }
  };

  // Toggle enabled state directly
  const handleToggleEnabled = (card: SolutionCard & { __store: 'app' | 'ai' }) => {
    const store = card.__store === 'ai' ? aiSolutionStore : appWebsiteStore;
    store.update(card.id, { enabled: !card.enabled });
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Solutions Catalog</span>
          <h1 className={styles.title}>
            Manage <span className={styles.titleGradient}>Solutions & Showcase</span>
          </h1>
          <p className={styles.intro}>
            Configure App, Website, Figma design, Backend development, and AI solution cards displayed on the main portfolio catalog.
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)', gap: '24px', marginTop: '24px' }}>
        
        {/* Left Side: Cards Grid */}
        <section className={styles.scopeList} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {categories.map((category) => {
            const categoryCards = allCards.filter(c => {
              let cat = c.category;
              const lower = cat.toLowerCase();
              if (lower === 'app') cat = 'App';
              else if (lower === 'website') cat = 'Website';
              else if (lower.includes('figma') || lower.includes('design')) cat = 'Figma design';
              else if (lower.includes('backend') || lower.includes('developement') || lower.includes('development')) cat = 'Backend development';
              else if (lower.includes('ai') || lower.includes('solution')) cat = 'AI solution';
              return cat === category;
            });

            return (
              <article key={category} className={`${styles.panel} ${styles.glassPanel}`}>
                <div className={styles.panelHeader} style={{ marginBottom: '14px' }}>
                  <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>
                      {category === 'App' && '📱'}
                      {category === 'Website' && '🌐'}
                      {category === 'Figma design' && '🎨'}
                      {category === 'Backend development' && '⚙️'}
                      {category === 'AI solution' && '🧠'}
                    </span>
                    {category} Cards
                  </h3>
                  <span className={styles.panelKicker}>{categoryCards.length} published</span>
                </div>

                {categoryCards.length === 0 ? (
                  <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', padding: '10px 0' }}>No cards in this section.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {categoryCards.map((card) => (
                      <div 
                        key={card.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '14px 16px', 
                          borderRadius: '10px', 
                          background: 'rgba(255,255,255,0.02)', 
                          border: '1px solid rgba(255,255,255,0.04)' 
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.1rem' }}>{card.icon}</span>
                            <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{card.title}</strong>
                            <span 
                              onClick={() => handleToggleEnabled(card)}
                              style={{ 
                                fontSize: '0.68rem', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                background: card.enabled ? 'rgba(96,220,184,0.1)' : 'rgba(255,255,255,0.05)',
                                color: card.enabled ? '#63ddb9' : '#8190a6'
                              }}
                            >
                              {card.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <p style={{ color: 'var(--text-light)', fontSize: '0.78rem', marginTop: '6px', lineHeight: 1.4 }}>
                            {card.description}
                          </p>
                          {card.link && card.link !== '#solutions' && (
                            <small style={{ color: '#6366f1', fontSize: '0.7rem', display: 'block', marginTop: '4px' }}>
                              Link: {card.link}
                            </small>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            type="button" 
                            onClick={() => handleEdit(card)}
                            style={{ 
                              padding: '6px 10px', 
                              borderRadius: '6px', 
                              background: 'rgba(99, 102, 241, 0.1)', 
                              color: '#818cf8', 
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDelete(card.id, card.__store)}
                            style={{ 
                              padding: '6px 10px', 
                              borderRadius: '6px', 
                              background: 'rgba(239, 68, 68, 0.1)', 
                              color: '#fca5a5', 
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {/* Right Side: Form Block */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={`${styles.panel} ${styles.glassPanel}`} style={{ position: 'sticky', top: '24px' }}>
            <div className={styles.panelHeader} style={{ marginBottom: '18px' }}>
              <h3 className={styles.panelTitle}>
                {selectedCard ? '✏️ Edit Card' : '➕ Add Showcase Card'}
              </h3>
              {selectedCard && (
                <button 
                  type="button" 
                  onClick={handleReset}
                  style={{ color: '#fca5a5', fontSize: '0.75rem', fontWeight: 'bold' }}
                >
                  Cancel
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', color: '#8d9bb0', fontWeight: 'bold' }}>
                  SECTION CATEGORY
                </label>
                <select
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(10, 16, 28, 0.6)',
                    color: '#fff',
                    outline: 'none'
                  }}
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', color: '#8d9bb0', fontWeight: 'bold' }}>
                  CARD TITLE
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="e.g. Real-time Analytics Engine"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(10, 16, 28, 0.6)',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', color: '#8d9bb0', fontWeight: 'bold' }}>
                    ICON (EMOJI)
                  </label>
                  <input
                    type="text"
                    value={draftIcon}
                    onChange={(e) => setDraftIcon(e.target.value)}
                    placeholder="🧠, ⚙️, 💻, 🎨"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(10, 16, 28, 0.6)',
                      color: '#fff',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', color: '#8d9bb0', fontWeight: 'bold' }}>
                    LINK DESTINATION
                  </label>
                  <input
                    type="text"
                    value={draftLink}
                    onChange={(e) => setDraftLink(e.target.value)}
                    placeholder="e.g. #solutions"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(10, 16, 28, 0.6)',
                      color: '#fff',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', color: '#8d9bb0', fontWeight: 'bold' }}>
                  DESCRIPTION
                </label>
                <textarea
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  placeholder="Explain the technical highlight or system value..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(10, 16, 28, 0.6)',
                    color: '#fff',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <input
                  type="checkbox"
                  id="enabledCheckbox"
                  checked={draftEnabled}
                  onChange={(e) => setDraftEnabled(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="enabledCheckbox" style={{ fontSize: '0.8rem', color: '#bec9d9', cursor: 'pointer' }}>
                  Publish Card (Make Active)
                </label>
              </div>

              <button
                type="button"
                onClick={handleSave}
                style={{
                  marginTop: '10px',
                  padding: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #3f8cff 100%)',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.25)',
                  textAlign: 'center'
                }}
              >
                {selectedCard ? 'Save Changes' : 'Add Card to Catalog'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
