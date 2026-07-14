'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useSiteConfig } from '../../utils/configStore';
import {
  addEcommerceCard,
  deleteEcommerceCard,
  updateEcommerceCard,
  useEcommerceCards,
  type EcommerceCard,
} from '../../utils/ecommerceStore';
import { uploadImageToCloudinary } from '../../utils/apiClient';

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
  imageSrc: '',
  imageAlt: '',
  isPlaceholder: false,
};

export default function EcommerceDashboardPage() {
  const brandName = useSiteConfig('navbar.brand');
  const [cards] = useEcommerceCards();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [editorOpen, setEditorOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const visibleCount = useMemo(() => cards.filter((card) => card.enabled).length, [cards]);
  const hiddenCount = cards.length - visibleCount;
  const selectedCard = cards.find((card) => card.id === selectedId) ?? null;

  const openCreate = () => {
    setSelectedId(null);
    setDraft(emptyDraft);
    setEditorOpen(true);
  };

  const openEdit = (card: EcommerceCard) => {
    setSelectedId(card.id);
    setDraft({
      title: card.title,
      description: card.description,
      imageSrc: card.imageSrc,
      imageAlt: card.imageAlt,
      isPlaceholder: card.isPlaceholder,
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSelectedId(null);
    setDraft(emptyDraft);
    setUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);

    try {
      const result = await uploadImageToCloudinary(file);
      const imageUrl = result.secureUrl || result.url;
      setDraft((prev) => ({
        ...prev,
        imageSrc: imageUrl,
        imageAlt: prev.imageAlt.trim() || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        isPlaceholder: false,
      }));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const saveCurrent = () => {
    const nextTitle = draft.title.trim();
    const nextDescription = draft.description.trim();

    if (!nextTitle || !nextDescription) {
      return;
    }

    if (selectedCard) {
      updateEcommerceCard(selectedCard.id, {
        title: nextTitle,
        description: nextDescription,
        imageSrc: draft.imageSrc.trim(),
        imageAlt: draft.imageAlt.trim(),
        isPlaceholder: draft.isPlaceholder,
      });
    } else {
      addEcommerceCard(
        nextTitle,
        nextDescription,
        draft.imageSrc.trim(),
        draft.imageAlt.trim(),
        draft.isPlaceholder
      );
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
            E-commerce: Personalized Agentic Shopping
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '72ch' }}>
            Manage the E-commerce cards, add new ones, edit images and text, toggle visibility, and delete cards directly from the dashboard.
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
                These are the same cards shown on the solutions page.
              </p>
            </div>
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              Add New
            </button>
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: card.enabled ? '#34d399' : '#fbbf24' }}>
                    {card.enabled ? 'Visible' : 'Hidden'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <IconButton
                      label={card.enabled ? 'Hide card' : 'Show card'}
                      onClick={() => updateEcommerceCard(card.id, { enabled: !card.enabled })}
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
                    <IconButton label="Delete card" onClick={() => deleteEcommerceCard(card.id)}>
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

                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                  {card.isPlaceholder || !card.imageSrc ? (
                    <div style={{ aspectRatio: '340 / 240', display: 'grid', placeItems: 'center', color: 'var(--text-light)' }}>
                      Placeholder visual
                    </div>
                  ) : (
                    <Image
                      unoptimized
                      src={card.imageSrc}
                      alt={card.imageAlt}
                      width={340}
                      height={240}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {card.description}
                </p>
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
              Open the editor to add a new card or edit an existing one.
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
            Use the eye icon to toggle visibility. Edit opens a popup so the rest of the page stays the same.
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
                  {selectedCard ? 'Edit E-commerce Card' : 'Add New E-commerce Card'}
                </h3>
                <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  {selectedCard ? `Editing ${selectedCard.title}` : 'Create a new card for the E-commerce section.'}
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
                  placeholder="Example: Smart Reordering"
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
                  Image URL
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                  <input
                    type="text"
                    value={draft.imageSrc}
                    onChange={(event) => setDraft((prev) => ({ ...prev, imageSrc: event.target.value }))}
                    placeholder="https://res.cloudinary.com/..."
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-light)',
                      background: 'rgba(255,255,255,0.02)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleImageUpload(file);
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <p style={{ marginTop: '8px', color: 'var(--text-light)', fontSize: '0.78rem', lineHeight: 1.5 }}>
                  Upload a file to Cloudinary or paste a direct image URL.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                  Image Alt
                </label>
                <input
                  type="text"
                  value={draft.imageAlt}
                  onChange={(event) => setDraft((prev) => ({ ...prev, imageAlt: event.target.value }))}
                  placeholder="Descriptive alt text"
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
                  Placeholder Visual
                </label>
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, isPlaceholder: !prev.isPlaceholder }))}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    background: draft.isPlaceholder ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                    color: draft.isPlaceholder ? '#34d399' : 'var(--text-main)',
                    textAlign: 'left',
                  }}
                >
                  {draft.isPlaceholder ? 'Using placeholder illustration' : 'Using image URL'}
                </button>
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
    </div>
  );
}
