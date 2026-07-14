'use client';

import React from 'react';
import { apiRequest } from './apiClient';

export type TechnologyStackIconKey =
  | 'growth'
  | 'hardware'
  | 'orchestration'
  | 'frontend';

export interface TechnologyStackCard {
  id: string;
  title: string;
  category: string;
  description: string;
  iconKey: TechnologyStackIconKey;
  enabled: boolean;
}

export interface TechnologyStackSettings {
  sectionTitle: string;
  sectionSubtitle: string;
}

const STORE_EVENT = 'blacksoft_technology_stack_updated';
const CARDS_API_PATH = '/dashboard/technology-stack/cards';
const SETTINGS_API_PATH = '/dashboard/technology-stack/settings';

const EMPTY_CARDS: TechnologyStackCard[] = [];
const EMPTY_SETTINGS: TechnologyStackSettings = {
  sectionTitle: '',
  sectionSubtitle: '',
};

let cachedCardsValue: TechnologyStackCard[] = EMPTY_CARDS;
let cachedSettingsValue: TechnologyStackSettings = EMPTY_SETTINGS;
let cardsHydrationPromise: Promise<void> | null = null;
let settingsHydrationPromise: Promise<void> | null = null;
let cardsHydrated = false;
let settingsHydrated = false;
const listeners = new Set<() => void>();

function normalizeCard(card: Partial<TechnologyStackCard>, index = 0): TechnologyStackCard {
  const iconKey = card.iconKey ?? (card as { icon_key?: unknown }).icon_key;
  return {
    id: typeof card.id === 'string' && card.id.trim() ? card.id : `stack-card-${index + 1}`,
    title: typeof card.title === 'string' && card.title.trim() ? card.title.trim() : `Card ${index + 1}`,
    category: typeof card.category === 'string' && card.category.trim() ? card.category.trim() : 'CATEGORY',
    description: typeof card.description === 'string' && card.description.trim() ? card.description.trim() : 'No description provided.',
    iconKey: (iconKey === 'growth' || iconKey === 'hardware' || iconKey === 'orchestration' || iconKey === 'frontend')
      ? iconKey
      : 'growth',
    enabled: typeof card.enabled === 'boolean' ? card.enabled : true,
  };
}

function normalizeCards(cards: unknown): TechnologyStackCard[] {
  if (!Array.isArray(cards)) {
    return EMPTY_CARDS;
  }

  return cards
    .filter((item): item is Partial<TechnologyStackCard> => Boolean(item && typeof item === 'object'))
    .map((item, index) => normalizeCard(item, index));
}

function normalizeSettings(settings: Partial<TechnologyStackSettings> | null | undefined): TechnologyStackSettings {
  return {
    sectionTitle: (settings?.sectionTitle ?? (settings as { section_title?: string } | null | undefined)?.section_title)?.trim() || EMPTY_SETTINGS.sectionTitle,
    sectionSubtitle: (settings?.sectionSubtitle ?? (settings as { section_subtitle?: string } | null | undefined)?.section_subtitle)?.trim() || EMPTY_SETTINGS.sectionSubtitle,
  };
}

function persistCardsCache(cards: TechnologyStackCard[]) {
  cachedCardsValue = cards;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
  listeners.forEach((listener) => listener());
}

function persistSettingsCache(settings: TechnologyStackSettings) {
  cachedSettingsValue = settings;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
  listeners.forEach((listener) => listener());
}

async function hydrateCardsFromApi(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const items = await apiRequest<TechnologyStackCard[]>(CARDS_API_PATH);
    persistCardsCache(normalizeCards(items));
  } catch {
    persistCardsCache(EMPTY_CARDS);
  } finally {
    cardsHydrated = true;
  }
}

async function hydrateSettingsFromApi(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const settings = await apiRequest<TechnologyStackSettings>(SETTINGS_API_PATH);
    persistSettingsCache(normalizeSettings(settings));
  } catch {
    persistSettingsCache(EMPTY_SETTINGS);
  } finally {
    settingsHydrated = true;
  }
}

function ensureCardsHydrated() {
  if (typeof window === 'undefined' || cardsHydrated || cardsHydrationPromise) {
    return;
  }

  cardsHydrationPromise = hydrateCardsFromApi().finally(() => {
    cardsHydrationPromise = null;
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

function createId(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `stack-${Date.now()}`;
}

export function getTechnologyStackCards(): TechnologyStackCard[] {
  if (typeof window === 'undefined') {
    return EMPTY_CARDS;
  }

  ensureCardsHydrated();
  return cachedCardsValue;
}

export function getTechnologyStackSettings(): TechnologyStackSettings {
  if (typeof window === 'undefined') {
    return EMPTY_SETTINGS;
  }

  ensureSettingsHydrated();
  return cachedSettingsValue;
}

export function setTechnologyStackCards(cards: TechnologyStackCard[]) {
  const normalized = normalizeCards(cards);
  persistCardsCache(normalized);

  void apiRequest<TechnologyStackCard[]>(CARDS_API_PATH, {
    method: 'PUT',
    body: JSON.stringify(normalized),
  }).then((items) => {
    persistCardsCache(normalizeCards(items));
  }).catch(() => {
    // Keep optimistic state if the backend is temporarily unavailable.
  });
}

export function setTechnologyStackSettings(settings: TechnologyStackSettings) {
  const normalized = normalizeSettings(settings);
  persistSettingsCache(normalized);

  void apiRequest<TechnologyStackSettings>(SETTINGS_API_PATH, {
    method: 'PUT',
    body: JSON.stringify(normalized),
  }).then((items) => {
    persistSettingsCache(normalizeSettings(items));
  }).catch(() => {
    // Keep optimistic state if the backend is temporarily unavailable.
  });
}

export function addTechnologyStackCard(
  title: string,
  category: string,
  description: string,
  iconKey: TechnologyStackIconKey
) {
  const optimisticCard: TechnologyStackCard = {
    id: createId(title),
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    iconKey,
    enabled: true,
  };

  const next = [...getTechnologyStackCards(), optimisticCard];
  persistCardsCache(next);

  void apiRequest<TechnologyStackCard>(CARDS_API_PATH, {
    method: 'POST',
    body: JSON.stringify({
      title: optimisticCard.title,
      category: optimisticCard.category,
      description: optimisticCard.description,
      iconKey: optimisticCard.iconKey,
      enabled: optimisticCard.enabled,
    }),
  }).then((created) => {
    persistCardsCache(getTechnologyStackCards().map((card) => (card.id === optimisticCard.id ? normalizeCard(created) : card)));
  }).catch(() => {
    // Keep optimistic state if the backend request fails.
  });

  return next;
}

export function updateTechnologyStackCard(id: string, patch: Partial<Omit<TechnologyStackCard, 'id'>>) {
  const next = getTechnologyStackCards().map((card) =>
    card.id === id
      ? {
          ...card,
          ...patch,
        }
      : card
  );

  persistCardsCache(next);

  void apiRequest<TechnologyStackCard>(`${CARDS_API_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  }).then((updated) => {
    persistCardsCache(getTechnologyStackCards().map((card) => (card.id === id ? normalizeCard(updated) : card)));
  }).catch(() => {
    // Keep optimistic state if the backend request fails.
  });

  return next;
}

export function deleteTechnologyStackCard(id: string) {
  const next = getTechnologyStackCards().filter((card) => card.id !== id);
  persistCardsCache(next);

  void apiRequest<void>(`${CARDS_API_PATH}/${id}`, {
    method: 'DELETE',
  }).catch(() => {
    // Keep optimistic removal if the backend request fails.
  });

  return next;
}

export function useTechnologyStackCards() {
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    const handleUpdate = () => onStoreChange();
    listeners.add(handleUpdate);
    window.addEventListener(STORE_EVENT, handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
      window.removeEventListener(STORE_EVENT, handleUpdate);
    };
  }, []);

  React.useEffect(() => {
    ensureCardsHydrated();
  }, []);

  return React.useSyncExternalStore(
    subscribe,
    getTechnologyStackCards,
    () => EMPTY_CARDS
  );
}

export function useTechnologyStackSettings() {
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    const handleUpdate = () => onStoreChange();
    listeners.add(handleUpdate);
    window.addEventListener(STORE_EVENT, handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
      window.removeEventListener(STORE_EVENT, handleUpdate);
    };
  }, []);

  React.useEffect(() => {
    ensureSettingsHydrated();
  }, []);

  return React.useSyncExternalStore(
    subscribe,
    getTechnologyStackSettings,
    () => EMPTY_SETTINGS
  );
}
