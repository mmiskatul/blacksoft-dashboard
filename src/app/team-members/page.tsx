'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useSiteConfig } from '../../utils/configStore';
import {
  addTeamMember,
  deleteTeamMember,
  getTeamSettings,
  setTeamSettings,
  updateTeamMember,
  useTeamMembers,
  useTeamSettings,
  type TeamMember,
} from '../../utils/teamMembersStore';
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
  name: '',
  role: '',
  imageSrc: '',
  imageAlt: '',
  logo: '',
  bio: '',
  link: '',
};

export default function TeamMembersDashboardPage() {
  const brandName = useSiteConfig('navbar.brand');
  const cards = useTeamMembers();
  const settings = useTeamSettings();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [editorOpen, setEditorOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState(getTeamSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Delete confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const visibleCount = useMemo(() => cards.filter((member) => member.enabled).length, [cards]);
  const hiddenCount = cards.length - visibleCount;
  const selectedCard = cards.find((member) => member.id === selectedId) ?? null;

  const openCreate = () => {
    setSelectedId(null);
    setDraft(emptyDraft);
    setEditorOpen(true);
  };

  const openEdit = (member: TeamMember) => {
    setSelectedId(member.id);
    setDraft({
      name: member.name,
      role: member.role,
      imageSrc: member.imageSrc,
      imageAlt: member.imageAlt,
      logo: member.logo,
      bio: member.bio,
      link: member.link,
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
      }));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const saveCurrent = () => {
    const nextName = draft.name.trim();
    const nextRole = draft.role.trim();
    const nextImageSrc = draft.imageSrc.trim();
    const nextImageAlt = draft.imageAlt.trim();
    const nextLogo = draft.logo.trim();
    const nextBio = draft.bio.trim();
    const nextLink = draft.link.trim();

    if (!nextName || !nextRole) {
      return;
    }

    if (selectedCard) {
      updateTeamMember(selectedCard.id, {
        name: nextName,
        role: nextRole,
        imageSrc: nextImageSrc,
        imageAlt: nextImageAlt,
        logo: nextLogo,
        bio: nextBio,
        link: nextLink,
      });
    } else {
      addTeamMember(nextName, nextRole, nextImageSrc, nextImageAlt, nextLogo, nextBio, nextLink);
    }

    closeEditor();
  };

  const executeDelete = () => {
    if (!deleteConfirmId) return;
    deleteTeamMember(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const openSettings = () => {
    setSettingsDraft(settings);
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    setSettingsDraft(settings);
  };


  const saveSettings = () => {
    setTeamSettings(settingsDraft);
    closeSettings();
  };

  const label = { display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' };
  const input = { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Hero Header Banner */}
      <section
        style={{
          padding: '32px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(8, 13, 24, 0.95) 100%)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--primary)', textTransform: 'uppercase' }}>
            {brandName.toUpperCase()} ARCHITECTS MANAGEMENT
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-white)', letterSpacing: '-0.5px' }}>
            Team Members
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '640px', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Publish, edit, structure, and display your core creative directors and system architects dynamically on the public team catalog page.
          </p>
        </div>

        {/* Stats Section */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '24px', position: 'relative', zIndex: 2 }}>
          <div style={{ padding: '14px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', minWidth: '140px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total members</div>
            <strong style={{ fontSize: '1.75rem', color: 'var(--text-white)', fontWeight: 800 }}>{cards.length}</strong>
          </div>
          <div style={{ padding: '14px 20px', borderRadius: '16px', background: 'rgba(52,211,153,0.02)', border: '1px solid rgba(52,211,153,0.1)', minWidth: '140px' }}>
            <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visible</div>
            <strong style={{ fontSize: '1.75rem', color: '#34d399', fontWeight: 800 }}>{visibleCount}</strong>
          </div>
          <div style={{ padding: '14px 20px', borderRadius: '16px', background: 'rgba(251,191,36,0.02)', border: '1px solid rgba(251,191,36,0.1)', minWidth: '140px' }}>
            <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hidden</div>
            <strong style={{ fontSize: '1.75rem', color: '#fbbf24', fontWeight: 800 }}>{hiddenCount}</strong>
          </div>
        </div>
      </section>

      {/* Main split grid */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.45fr) minmax(280px, 0.55fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        
        {/* Left Column: Grid List */}
        <div
          style={{
            padding: '24px',
            borderRadius: '24px',
            background: 'rgba(15, 23, 42, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-white)' }}>
                Architects Grid
              </h3>
              <p style={{ marginTop: '3px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Preview how cards render. Empty avatars will resolve to their name initials.
              </p>
            </div>
            <button className="btn btn-primary" type="button" onClick={openCreate} style={{ padding: '10px 20px', borderRadius: '12px' }}>
              + Add Member
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            {cards.length > 0 ? (
              cards.map((member) => (
                <article
                  key={member.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.015)',
                    border: member.enabled ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid rgba(255, 255, 255, 0.03)',
                    padding: '20px',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    opacity: member.enabled ? 1 : 0.6,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                  }}
                >
                  
                  {/* Card Image Frame */}
                  <div style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.01)',
                    position: 'relative',
                  }}>
                    {member.imageSrc ? (
                      <Image
                        src={member.imageSrc}
                        alt={member.imageAlt || member.name}
                        unoptimized
                        width={280}
                        height={280}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      // Initials placeholder
                      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(59, 130, 246, 0.04) 100%)', color: 'var(--primary)', fontSize: '2.5rem', fontWeight: 800 }}>
                        {member.name.charAt(0)}
                      </div>
                    )}

                    {/* Logo/Tech overlay badge */}
                    {member.logo && (
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(10, 15, 30, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'grid',
                        placeItems: 'center',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)'
                      }}>
                        <img src={member.logo} alt="Overlay logo" style={{ maxWidth: '16px', maxHeight: '16px', objectFit: 'contain' }} />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      background: member.enabled ? 'rgba(52,211,153,0.85)' : 'rgba(251,191,36,0.85)',
                      color: member.enabled ? '#064e3b' : '#78350f',
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)'
                    }}>
                      {member.enabled ? '● ACTIVE' : '○ HIDDEN'}
                    </div>
                  </div>

                  {/* Info details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      background: 'rgba(99, 102, 241, 0.06)',
                      border: '1px solid rgba(99, 102, 241, 0.12)',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      alignSelf: 'flex-start'
                    }}>
                      {member.role}
                    </div>

                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)', margin: '4px 0 0' }}>{member.name}</h4>
                    {member.bio && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '4px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{member.bio}</p>}
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <button
                      type="button"
                      title={member.enabled ? 'Hide member' : 'Publish member'}
                      onClick={() => updateTeamMember(member.id, { enabled: !member.enabled })}
                      style={{
                        flex: 1, height: '36px', borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.02)',
                        color: member.enabled ? '#fbbf24' : '#34d399',
                        fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      {member.enabled ? 'Hide' : 'Publish'}
                    </button>
                    <IconButton label="Edit details" onClick={() => openEdit(member)}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}>
                        <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </IconButton>
                    <IconButton label="Delete member" onClick={() => setDeleteConfirmId(member.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px', color: '#f87171' }}>
                        <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" />
                      </svg>
                    </IconButton>
                  </div>

                </article>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', background: 'rgba(255,255,255,0.01)' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>👥</span>
                <h4 style={{ color: 'var(--text-white)', fontWeight: 700 }}>No members added yet</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Click "+ Add Member" to structure your first creatively enabled team member.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings Overview & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header configuration box */}
          <div
            style={{
              padding: '24px',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-white)' }}>
                Section Info
              </h3>
              <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.4 }}>
                This is the global header structure for your team page.
              </p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Section Title</span>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-white)', fontWeight: 700, marginTop: '2px' }}>{settings.title || 'The Architects of Blacksoft'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Section Subtitle</span>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>{settings.subtitle || 'A creative collective building systems...'}</div>
              </div>
              {settings.ctaLabel && (
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CTA link label</span>
                  <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>{settings.ctaLabel} ({settings.ctaLink})</div>
                </div>
              )}
            </div>

            <button className="btn btn-secondary" type="button" onClick={openSettings} style={{ width: '100%', height: '40px', borderRadius: '12px', marginTop: '6px' }}>
              ✏️ Configure Settings
            </button>
          </div>

          {/* Quick tips & guidelines */}
          <div
            style={{
              padding: '24px',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-white)', margin: 0 }}>💡 Tips & Best Practices</h4>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '18px', margin: 0 }}>
              <li>Use **1:1 square ratio images** for team profiles. A size of 400x400px or larger looks best.</li>
              <li>Pastes from Cloudinary are whitelisted automatically.</li>
              <li>Provide active LinkedIn or GitHub profile URLs for social links.</li>
              <li>Overlay logos should be transparent SVGs for high quality display.</li>
            </ul>
          </div>

        </div>

      </section>

      {/* ── Add / Edit Modal ─────────────────────────────────────── */}
      {editorOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.78)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center', zIndex: 2000, padding: '20px' }} onClick={closeEditor}>
          <div role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} style={{ width: 'min(780px, 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.09)', background: 'linear-gradient(180deg, rgba(14,22,40,0.99), rgba(8,13,24,0.99))', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-white)', margin: 0 }}>
                  {selectedCard ? '✏️ Edit Team Member' : '➕ Add Team Member'}
                </h3>
                <p style={{ marginTop: '5px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {selectedCard ? `Editing profile: ${selectedCard.name}` : 'Create a new creative architect profile.'}
                </p>
              </div>
              <button className="btn btn-secondary" type="button" onClick={closeEditor}>✕ Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
              <div>
                <label style={label}>Name *</label>
                <input type="text" value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} placeholder="Dr. Elena Vance" style={input} />
              </div>
              <div>
                <label style={label}>Role / Title *</label>
                <input type="text" value={draft.role} onChange={(event) => setDraft((prev) => ({ ...prev, role: event.target.value }))} placeholder="HEAD OF SYSTEMS ENGINEERING" style={input} />
              </div>
            </div>

            {/* Profile Image Box */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={label}>Profile Image (PNG / JPG / WebP)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)', display: 'grid', placeItems: 'center', overflow: 'hidden'
                }}>
                  {draft.imageSrc ? (
                    <img src={draft.imageSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: '1.25rem' }}>📷</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                      {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                    </button>
                    {draft.imageSrc && (
                      <button type="button" className="btn btn-secondary" onClick={() => setDraft(p => ({ ...p, imageSrc: '', imageAlt: '' }))} style={{ padding: '8px 16px', fontSize: '0.82rem', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                        Clear
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paste URL directly below or upload via Cloudinary.</span>
                </div>
              </div>
              <input type="text" value={draft.imageSrc} onChange={(event) => setDraft((prev) => ({ ...prev, imageSrc: event.target.value }))} placeholder="https://res.cloudinary.com/..." style={{ ...input, marginTop: '8px' }} />
              <input type="text" value={draft.imageAlt} onChange={(event) => setDraft((prev) => ({ ...prev, imageAlt: event.target.value }))} placeholder="Descriptive image alt text" style={{ ...input, marginTop: '4px', fontSize: '0.8rem' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
              <div>
                <label style={label}>Logo Overlay URL (e.g. specialized tech)</label>
                <input type="text" value={draft.logo} onChange={(event) => setDraft((prev) => ({ ...prev, logo: event.target.value }))} placeholder="e.g. /icons/react.svg" style={input} />
              </div>
              <div>
                <label style={label}>LinkedIn / GitHub Profile URL</label>
                <input type="text" value={draft.link} onChange={(event) => setDraft((prev) => ({ ...prev, link: event.target.value }))} placeholder="e.g. https://linkedin.com/in/username" style={input} />
              </div>
            </div>

            <div>
              <label style={label}>Short Biography / Specialization *</label>
              <textarea value={draft.bio} onChange={(event) => setDraft((prev) => ({ ...prev, bio: event.target.value }))} placeholder="Describe specialization, key achievements, or technical focus..." rows={3} style={{ ...input, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '18px' }}>
              <button className="btn btn-primary" type="button" onClick={saveCurrent} style={{ opacity: (!draft.name.trim() || !draft.role.trim() || !draft.bio.trim()) ? 0.5 : 1 }}>
                {selectedCard ? '✓ Save Changes' : '+ Add Member'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={closeEditor}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ───────────────────────────────────────── */}
      {settingsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.78)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center', zIndex: 2100, padding: '20px' }} onClick={closeSettings}>
          <div role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} style={{ width: 'min(680px, 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.09)', background: 'linear-gradient(180deg, rgba(14,22,40,0.99), rgba(8,13,24,0.99))', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)' }}>
                  ✏️ Edit Section Settings
                </h3>
              </div>
              <button className="btn btn-secondary" type="button" onClick={closeSettings}>✕ Close</button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={label}>Section Title</label>
                <input type="text" value={settingsDraft.title} onChange={(event) => setSettingsDraft((prev) => ({ ...prev, title: event.target.value }))} style={input} />
              </div>
              <div>
                <label style={label}>Section Subtitle</label>
                <textarea value={settingsDraft.subtitle} onChange={(event) => setSettingsDraft((prev) => ({ ...prev, subtitle: event.target.value }))} rows={3} style={{ ...input, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                <div>
                  <label style={label}>CTA Link Label</label>
                  <input type="text" value={settingsDraft.ctaLabel} onChange={(event) => setSettingsDraft((prev) => ({ ...prev, ctaLabel: event.target.value }))} style={input} />
                </div>
                <div>
                  <label style={label}>CTA Link Destination</label>
                  <input type="text" value={settingsDraft.ctaLink} onChange={(event) => setSettingsDraft((prev) => ({ ...prev, ctaLink: event.target.value }))} style={input} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" type="button" onClick={saveSettings}>✓ Save</button>
              <button className="btn btn-secondary" type="button" onClick={closeSettings}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      {deleteConfirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,6,12,0.82)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'grid', placeItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ width: 'min(400px,100%)', background: 'rgba(12,19,33,0.97)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.8)', padding: '32px', textAlign: 'center', borderRadius: '20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '14px' }}>⚠️</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>Delete this member?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              This will permanently remove this creative architect profile from both the dashboard and the public site. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setDeleteConfirmId(null)} style={{ padding: '10px 22px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={executeDelete} style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 18px rgba(239,68,68,0.4)' }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
