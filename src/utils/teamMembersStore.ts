'use client';

import React from 'react';
import { apiRequest } from './apiClient';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageSrc: string;
  imageAlt: string;
  enabled: boolean;
}

export interface TeamSectionSettings {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
}

const EVENT_NAME = 'blacksoft_team_updated';
const MEMBERS_API_PATH = '/dashboard/team-members/members';
const SETTINGS_API_PATH = '/dashboard/team-members/settings';

const EMPTY_SETTINGS: TeamSectionSettings = {
  title: '',
  subtitle: '',
  ctaLabel: '',
  ctaLink: '',
};

const EMPTY_MEMBERS: TeamMember[] = [];

let cachedMembersValue: TeamMember[] = EMPTY_MEMBERS;
let cachedSettingsValue: TeamSectionSettings = EMPTY_SETTINGS;
let membersHydrationPromise: Promise<void> | null = null;
let settingsHydrationPromise: Promise<void> | null = null;
let membersHydrated = false;
let settingsHydrated = false;
const listeners = new Set<() => void>();

function normalizeMember(member: Partial<TeamMember>, index = 0): TeamMember {
  const imageSrc = member.imageSrc ?? (member as { image_src?: unknown }).image_src;
  const imageAlt = member.imageAlt ?? (member as { image_alt?: unknown }).image_alt;
  return {
    id: typeof member.id === 'string' && member.id.trim() ? member.id : `team-member-${index + 1}`,
    name: typeof member.name === 'string' && member.name.trim() ? member.name.trim() : `Member ${index + 1}`,
    role: typeof member.role === 'string' && member.role.trim() ? member.role.trim() : 'TEAM MEMBER',
    imageSrc: typeof imageSrc === 'string' ? imageSrc.trim() : '',
    imageAlt: typeof imageAlt === 'string' && imageAlt.trim() ? imageAlt.trim() : 'Team member image',
    enabled: typeof member.enabled === 'boolean' ? member.enabled : true,
  };
}

function normalizeMembers(members: unknown): TeamMember[] {
  if (!Array.isArray(members)) {
    return EMPTY_MEMBERS;
  }

  return members
    .filter((item): item is Partial<TeamMember> => Boolean(item && typeof item === 'object'))
    .map((item, index) => normalizeMember(item, index));
}

function normalizeSettings(settings: Partial<TeamSectionSettings> | null | undefined): TeamSectionSettings {
  return {
    title: settings?.title?.trim() || EMPTY_SETTINGS.title,
    subtitle: settings?.subtitle?.trim() || EMPTY_SETTINGS.subtitle,
    ctaLabel: (settings?.ctaLabel ?? (settings as { cta_label?: string } | null | undefined)?.cta_label)?.trim() || EMPTY_SETTINGS.ctaLabel,
    ctaLink: (settings?.ctaLink ?? (settings as { cta_link?: string } | null | undefined)?.cta_link)?.trim() || EMPTY_SETTINGS.ctaLink,
  };
}

function persistMembersCache(members: TeamMember[]) {
  cachedMembersValue = members;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
  listeners.forEach((listener) => listener());
}

function persistSettingsCache(settings: TeamSectionSettings) {
  cachedSettingsValue = settings;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
  listeners.forEach((listener) => listener());
}

async function hydrateMembersFromApi(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const items = await apiRequest<TeamMember[]>(MEMBERS_API_PATH);
    persistMembersCache(normalizeMembers(items));
  } catch {
    persistMembersCache(EMPTY_MEMBERS);
  } finally {
    membersHydrated = true;
  }
}

async function hydrateSettingsFromApi(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const settings = await apiRequest<TeamSectionSettings>(SETTINGS_API_PATH);
    persistSettingsCache(normalizeSettings(settings));
  } catch {
    persistSettingsCache(EMPTY_SETTINGS);
  } finally {
    settingsHydrated = true;
  }
}

function ensureMembersHydrated() {
  if (typeof window === 'undefined' || membersHydrated || membersHydrationPromise) {
    return;
  }

  membersHydrationPromise = hydrateMembersFromApi().finally(() => {
    membersHydrationPromise = null;
  });
}

function ensureSettingsHydrated() {
  if (typeof window === 'undefined' || settingsHydrated || settingsHydrationPromise) {
    return;
  }

  settingsHydrationPromise = hydrateSettingsFromApi().finally(() => {
    settingsHydrationPromise = null;
  });
}

export function getTeamMembers() {
  if (typeof window === 'undefined') {
    return EMPTY_MEMBERS;
  }

  ensureMembersHydrated();
  return cachedMembersValue;
}

export function getTeamSettings() {
  if (typeof window === 'undefined') {
    return EMPTY_SETTINGS;
  }

  ensureSettingsHydrated();
  return cachedSettingsValue;
}

export function setTeamMembers(members: TeamMember[]) {
  const normalized = normalizeMembers(members);
  persistMembersCache(normalized);

  void apiRequest<TeamMember[]>(MEMBERS_API_PATH, {
    method: 'PUT',
    body: JSON.stringify(normalized),
  }).then((items) => {
    persistMembersCache(normalizeMembers(items));
  }).catch(() => {
    // Keep optimistic state if the backend is temporarily unavailable.
  });
}

export function setTeamSettings(settings: TeamSectionSettings) {
  const normalized = normalizeSettings(settings);
  persistSettingsCache(normalized);

  void apiRequest<TeamSectionSettings>(SETTINGS_API_PATH, {
    method: 'PUT',
    body: JSON.stringify(normalized),
  }).then((items) => {
    persistSettingsCache(normalizeSettings(items));
  }).catch(() => {
    // Keep optimistic state if the backend is temporarily unavailable.
  });
}

export function addTeamMember(name: string, role: string, imageSrc: string, imageAlt: string) {
  const optimisticMember: TeamMember = {
    id: `team-member-${Date.now()}`,
    name: name.trim(),
    role: role.trim(),
    imageSrc: imageSrc.trim(),
    imageAlt: imageAlt.trim(),
    enabled: true,
  };

  const next = [...getTeamMembers(), optimisticMember];
  persistMembersCache(next);

  void apiRequest<TeamMember>(MEMBERS_API_PATH, {
    method: 'POST',
    body: JSON.stringify({
      name: optimisticMember.name,
      role: optimisticMember.role,
      imageSrc: optimisticMember.imageSrc,
      imageAlt: optimisticMember.imageAlt,
      enabled: optimisticMember.enabled,
    }),
  }).then((created) => {
    persistMembersCache(getTeamMembers().map((member) => (member.id === optimisticMember.id ? normalizeMember(created) : member)));
  }).catch(() => {
    // Keep optimistic state if the backend request fails.
  });

  return next;
}

export function updateTeamMember(id: string, patch: Partial<Omit<TeamMember, 'id'>>) {
  const next = getTeamMembers().map((member) =>
    member.id === id
      ? {
          ...member,
          ...patch,
        }
      : member
  );

  persistMembersCache(next);

  void apiRequest<TeamMember>(`${MEMBERS_API_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  }).then((updated) => {
    persistMembersCache(getTeamMembers().map((member) => (member.id === id ? normalizeMember(updated) : member)));
  }).catch(() => {
    // Keep optimistic state if the backend request fails.
  });

  return next;
}

export function deleteTeamMember(id: string) {
  const next = getTeamMembers().filter((member) => member.id !== id);
  persistMembersCache(next);

  void apiRequest<void>(`${MEMBERS_API_PATH}/${id}`, {
    method: 'DELETE',
  }).catch(() => {
    // Keep optimistic removal if the backend request fails.
  });

  return next;
}

export function useTeamMembers() {
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    const handleUpdate = () => onStoreChange();
    listeners.add(handleUpdate);
    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
      window.removeEventListener(EVENT_NAME, handleUpdate);
    };
  }, []);

  React.useEffect(() => {
    ensureMembersHydrated();
  }, []);

  return React.useSyncExternalStore(
    subscribe,
    getTeamMembers,
    () => EMPTY_MEMBERS
  );
}

export function useTeamSettings() {
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    const handleUpdate = () => onStoreChange();
    listeners.add(handleUpdate);
    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
      window.removeEventListener(EVENT_NAME, handleUpdate);
    };
  }, []);

  React.useEffect(() => {
    ensureSettingsHydrated();
  }, []);

  return React.useSyncExternalStore(
    subscribe,
    getTeamSettings,
    () => EMPTY_SETTINGS
  );
}
