'use client';

import React, { useState, useMemo, useRef } from 'react';
import styles from '../page.module.css';
import { 
  useAppWebsiteCards, 
  useAiSolutionCards, 
  appWebsiteStore, 
  aiSolutionStore,
  type SolutionCard,
  type OtherLink
} from '../../utils/solutionCardsStore';
import { uploadImageToCloudinary } from '../../utils/apiClient';

export default function SolutionsManagerPage() {
  const [appCards] = useAppWebsiteCards();
  const [aiCards] = useAiSolutionCards();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal visibility state
  const [showModal, setShowModal] = useState(false);

  // Selected card for editing
  const [selectedCard, setSelectedCard] = useState<SolutionCard | null>(null);
  
  // Track original store to handle category switching/migration
  const [originalStore, setOriginalStore] = useState<'app' | 'ai' | null>(null);

  // Delete confirmation modal state
  const [deleteConfirmData, setDeleteConfirmData] = useState<{ id: string; storeType: 'app' | 'ai' } | null>(null);

  // Form states
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftCategory, setDraftCategory] = useState('App');
  const [draftIcon, setDraftIcon] = useState('🧠');
  const [draftLink, setDraftLink] = useState('#solutions');
  const [draftImageSrc, setDraftImageSrc] = useState('');
  const [draftImageAlt, setDraftImageAlt] = useState('');
  const [draftEnabled, setDraftEnabled] = useState(true);
  const [draftOtherLinks, setDraftOtherLinks] = useState<OtherLink[]>([]);
  
  const [uploadingImage, setUploadingImage] = useState(false);

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
    setDraftImageSrc(card.imageSrc || '');
    setDraftImageAlt(card.imageAlt || '');
    setDraftEnabled(card.enabled);
    setDraftOtherLinks(card.otherLinks || []);
    setShowModal(true);
  };

  // Reset form / Cancel editing
  const handleReset = () => {
    setSelectedCard(null);
    setOriginalStore(null);
    setDraftTitle('');
    setDraftDescription('');
    setDraftCategory('App');
    setDraftIcon('🧠');
    setDraftLink('#solutions');
    setDraftImageSrc('');
    setDraftImageAlt('');
    setDraftEnabled(true);
    setDraftOtherLinks([]);
    setShowModal(false);
  };

  // Handle image file upload
  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const res = await uploadImageToCloudinary(file);
      setDraftImageSrc(res.secureUrl);
      setDraftImageAlt(file.name.split('.')[0] || 'Solution showcase image');
    } catch (err: any) {
      alert(err.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Trigger modal for creating a new card
  const handleCreateNew = () => {
    handleReset();
    setShowModal(true);
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
          imageSrc: draftImageSrc.trim(),
          imageAlt: draftImageAlt.trim(),
          enabled: draftEnabled,
          otherLinks: draftOtherLinks
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
          draftLink.trim(),
          draftImageSrc.trim(),
          draftImageAlt.trim(),
          draftOtherLinks
        );
      }
    } else {
      // Create mode
      activeStore.add(
        draftTitle.trim(),
        draftDescription.trim(),
        draftCategory,
        draftIcon.trim(),
        draftLink.trim(),
        draftImageSrc.trim(),
        draftImageAlt.trim(),
        draftOtherLinks
      );
    }

    handleReset();
  };

  // Trigger delete confirmation modal
  const handleDeleteTrigger = (id: string, storeType: 'app' | 'ai') => {
    setDeleteConfirmData({ id, storeType });
  };

  // Execute actual deletion
  const executeDelete = () => {
    if (!deleteConfirmData) return;
    const { id, storeType } = deleteConfirmData;
    const store = storeType === 'ai' ? aiSolutionStore : appWebsiteStore;
    store.remove(id);
    if (selectedCard?.id === id) {
      handleReset();
    }
    setDeleteConfirmData(null);
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
        <button 
          onClick={handleCreateNew}
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
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> Add New Card
        </button>
      </header>

      {/* Main List */}
      <section className={styles.scopeList} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
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
                      <div style={{ flex: 1, paddingRight: '12px', display: 'flex', gap: '14px', alignItems: 'start' }}>
                        {card.imageSrc && (
                          <img 
                            src={card.imageSrc} 
                            alt={card.imageAlt || card.title} 
                            style={{ 
                              width: '64px', 
                              height: '64px', 
                              borderRadius: '8px', 
                              objectFit: 'cover',
                              border: '1px solid rgba(255,255,255,0.08)'
                            }} 
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                          onClick={() => handleDeleteTrigger(card.id, card.__store)}
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

      {/* Glassmorphic Modal Input Page */}
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
            if (e.target === e.currentTarget) handleReset();
          }}
        >
          <div 
            className={`${styles.panel} ${styles.glassPanel}`}
            style={{
              width: 'min(100%, 520px)',
              background: 'rgba(12, 19, 33, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255,255,255,0.05)',
              padding: '30px',
              animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div className={styles.panelHeader} style={{ marginBottom: '22px' }}>
              <h3 className={styles.panelTitle} style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {selectedCard ? '✏️ Edit Showcase Card' : '➕ Add Showcase Card'}
              </h3>
              <button 
                type="button" 
                onClick={handleReset}
                style={{ 
                  color: '#fca5a5', 
                  fontSize: '0.78rem', 
                  fontWeight: 'bold',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    background: 'rgba(8, 12, 22, 0.8)',
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
                    background: 'rgba(8, 12, 22, 0.8)',
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
                      background: 'rgba(8, 12, 22, 0.8)',
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
                      background: 'rgba(8, 12, 22, 0.8)',
                      color: '#fff',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Image Upload Block */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', color: '#8d9bb0', fontWeight: 'bold' }}>
                  SHOWCASE IMAGE
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                  <input
                    type="text"
                    value={draftImageSrc}
                    onChange={(e) => setDraftImageSrc(e.target.value)}
                    placeholder="Paste URL or click Upload"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(8, 12, 22, 0.8)',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '0.82rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    style={{
                      padding: '0 16px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    style={{ display: 'none' }}
                  />
                </div>

                {draftImageSrc && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img 
                      src={draftImageSrc} 
                      alt="Uploaded preview" 
                      style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={draftImageAlt}
                        onChange={(e) => setDraftImageAlt(e.target.value)}
                        placeholder="Image alt description"
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.05)',
                          background: 'rgba(255,255,255,0.02)',
                          color: '#fff',
                          outline: 'none',
                          fontSize: '0.78rem'
                        }}
                      />
                    </div>
                  </div>
                )}
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
                    background: 'rgba(8, 12, 22, 0.8)',
                    color: '#fff',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Multiple Roles / Other URLs Section */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#8d9bb0', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    ROLES & ADDITIONAL URLS ({draftOtherLinks.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setDraftOtherLinks([...draftOtherLinks, { title: '', description: '', url: '' }])}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8',
                      fontSize: '0.72rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'background 0.2s'
                    }}
                  >
                    + Add Role/URL
                  </button>
                </div>

                {draftOtherLinks.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontStyle: 'italic', margin: '4px 0 12px 0' }}>
                    No additional roles/URLs added. Add links for separate portals (e.g. Admin Panel, Frontend App).
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                    {draftOtherLinks.map((link, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'rgba(8, 12, 22, 0.5)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          position: 'relative'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setDraftOtherLinks(draftOtherLinks.filter((_, i) => i !== idx))}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '8px',
                            color: '#ef4444',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          title="Remove this role link"
                        >
                          ×
                        </button>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <input
                              type="text"
                              value={link.title}
                              onChange={(e) => {
                                const copy = [...draftOtherLinks];
                                copy[idx] = { ...copy[idx], title: e.target.value };
                                setDraftOtherLinks(copy);
                              }}
                              placeholder="Role (e.g. Frontend App)"
                              style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '6px',
                                border: '1px solid rgba(255,255,255,0.06)',
                                background: 'rgba(8, 12, 22, 0.9)',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '0.75rem'
                              }}
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => {
                                const copy = [...draftOtherLinks];
                                copy[idx] = { ...copy[idx], url: e.target.value };
                                setDraftOtherLinks(copy);
                              }}
                              placeholder="URL (e.g. https://...)"
                              style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '6px',
                                border: '1px solid rgba(255,255,255,0.06)',
                                background: 'rgba(8, 12, 22, 0.9)',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '0.75rem'
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={link.description}
                            onChange={(e) => {
                              const copy = [...draftOtherLinks];
                              copy[idx] = { ...copy[idx], description: e.target.value };
                              setDraftOtherLinks(copy);
                            }}
                            placeholder="Brief description of this portal/role (optional)"
                            style={{
                              width: '100%',
                              padding: '8px',
                              borderRadius: '6px',
                              border: '1px solid rgba(255,255,255,0.06)',
                              background: 'rgba(8, 12, 22, 0.9)',
                              color: '#fff',
                              outline: 'none',
                              fontSize: '0.75rem'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
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
                  marginTop: '6px',
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmData && (
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
              Are you sure you want to permanently delete this item? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmData(null)}
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
