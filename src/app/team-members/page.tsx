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
            Team Members
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '72ch' }}>
            Add, edit, hide, and remove team members that appear on the public architects section.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px' }}>
          <div style={{ padding: '16px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Total members</div>
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
                Member Preview
              </h3>
              <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                This matches the public team section.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" type="button" onClick={openSettings}>
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {cards.map((member) => (
              <article
                key={member.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  padding: '16px',
                  borderRadius: '20px',
                  boxShadow: 'var(--card-shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  opacity: member.enabled ? 1 : 0.62,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: member.enabled ? '#34d399' : '#fbbf24' }}>
                    {member.enabled ? 'Visible' : 'Hidden'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <IconButton label={member.enabled ? 'Hide member' : 'Show member'} onClick={() => updateTeamMember(member.id, { enabled: !member.enabled })}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                        {member.enabled ? (
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
                    <IconButton label="Edit member" onClick={() => openEdit(member)}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </IconButton>
                    <IconButton label="Delete member" onClick={() => deleteTeamMember(member.id)}>
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
                  {member.imageSrc ? (
                    <Image
                      src={member.imageSrc}
                      alt={member.imageAlt || member.name}
                      unoptimized
                      width={520}
                      height={420}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  ) : (
                    <div style={{ aspectRatio: '520 / 420', display: 'grid', placeItems: 'center', color: 'var(--text-light)', fontSize: '0.92rem' }}>
                      No image uploaded
                    </div>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: '1.12rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {member.name}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.04em' }}>
                    {member.role}
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
              Edit the section header or manage members from the popup editor.
            </p>
          </div>

          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Add New Member
          </button>
        </div>
      </section>

      {editorOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', zIndex: 2000, padding: '20px' }} onClick={closeEditor}>
          <div role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} style={{ width: 'min(860px, 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(10, 15, 30, 0.98))', boxShadow: '0 30px 90px rgba(0, 0, 0, 0.45)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)' }}>
                  {selectedCard ? 'Edit Team Member' : 'Add Team Member'}
                </h3>
                <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  {selectedCard ? `Editing ${selectedCard.name}` : 'Create a new team member for the public section.'}
                </p>
              </div>
              <button className="btn btn-secondary" type="button" onClick={closeEditor}>
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>Name</label>
                <input type="text" value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} placeholder="Example: Dr. Elena Vance" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>Role</label>
                <input type="text" value={draft.role} onChange={(event) => setDraft((prev) => ({ ...prev, role: event.target.value }))} placeholder="Example: HEAD OF ENGINEERING" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>Image URL</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                  <input
                    type="text"
                    value={draft.imageSrc}
                    onChange={(event) => setDraft((prev) => ({ ...prev, imageSrc: event.target.value }))}
                    placeholder="https://res.cloudinary.com/..."
                    style={{ flex: 1, padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)' }}
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
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>Image Alt</label>
                <input type="text" value={draft.imageAlt} onChange={(event) => setDraft((prev) => ({ ...prev, imageAlt: event.target.value }))} placeholder="Descriptive alt text" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>Logo / Tech Icon URL</label>
                <input type="text" value={draft.logo} onChange={(event) => setDraft((prev) => ({ ...prev, logo: event.target.value }))} placeholder="Example: /icons/python.svg" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>Profile / Social Link</label>
                <input type="text" value={draft.link} onChange={(event) => setDraft((prev) => ({ ...prev, link: event.target.value }))} placeholder="Example: https://github.com/username" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>Biography / Short Description</label>
              <textarea value={draft.bio} onChange={(event) => setDraft((prev) => ({ ...prev, bio: event.target.value }))} placeholder="A short bio or details about their specialization..." rows={3} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" type="button" onClick={saveCurrent}>
                {selectedCard ? 'Save Changes' : 'Add Member'}
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

      {settingsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', zIndex: 2100, padding: '20px' }} onClick={closeSettings}>
          <div role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} style={{ width: 'min(780px, 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(10, 15, 30, 0.98))', boxShadow: '0 30px 90px rgba(0, 0, 0, 0.45)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)' }}>
                  Edit Section Content
                </h3>
                <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  Update the heading, subtitle, and CTA for the public team section.
                </p>
              </div>
              <button className="btn btn-secondary" type="button" onClick={closeSettings}>
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>Section Title</label>
                <input type="text" value={settingsDraft.title} onChange={(event) => setSettingsDraft((prev) => ({ ...prev, title: event.target.value }))} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>Section Subtitle</label>
                <textarea value={settingsDraft.subtitle} onChange={(event) => setSettingsDraft((prev) => ({ ...prev, subtitle: event.target.value }))} rows={3} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>CTA Label</label>
                  <input type="text" value={settingsDraft.ctaLabel} onChange={(event) => setSettingsDraft((prev) => ({ ...prev, ctaLabel: event.target.value }))} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', color: 'var(--text-light)' }}>CTA Link</label>
                  <input type="text" value={settingsDraft.ctaLink} onChange={(event) => setSettingsDraft((prev) => ({ ...prev, ctaLink: event.target.value }))} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" type="button" onClick={saveSettings}>
                Save Section
              </button>
              <button className="btn btn-secondary" type="button" onClick={closeSettings}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
