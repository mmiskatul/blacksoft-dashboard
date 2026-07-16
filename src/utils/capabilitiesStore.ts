'use client';

import React from 'react';
import { apiRequest } from './apiClient';

export type CapabilityCard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  enabled: boolean;
};

const STORE_EVENT = 'blacksoft_capability_cards_updated';
const API_PATH = '/dashboard/capabilities';

const EMPTY_CAPABILITY_CARDS: CapabilityCard[] = [];

let cachedCardsValue: CapabilityCard[] = EMPTY_CAPABILITY_CARDS;
let hydrationPromise: Promise<void> | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function createId(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `capability-${Date.now()}`;
}

function normalizeCards(cards: unknown): CapabilityCard[] {
  if (!Array.isArray(cards)) {
    return EMPTY_CAPABILITY_CARDS;
  }

  const normalized = cards
    .filter((item): item is Partial<CapabilityCard> => Boolean(item && typeof item === 'object'))
    .map((item, index) => ({
      id: typeof item.id === 'string' && item.id.trim() ? item.id : createId(item.title || `card-${index + 1}`),
      title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Card ${index + 1}`,
      description: typeof item.description === 'string' && item.description.trim()
        ? item.description.trim()
        : 'No description provided.',
      icon: typeof item.icon === 'string' && item.icon.trim() ? item.icon.trim() : 'AI',
      link: typeof item.link === 'string' && item.link.trim() ? item.link.trim() : '#services',
      enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
    }));

  return normalized;
}

function persistCache(cards: CapabilityCard[]) {
  cachedCardsValue = cards;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
  listeners.forEach((listener) => listener());
}

async function hydrateFromApi(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const items = await apiRequest<CapabilityCard[]>(API_PATH);
    persistCache(normalizeCards(items));
  } catch {
    persistCache(EMPTY_CAPABILITY_CARDS);
  } finally {
    hydrated = true;
  }
}

function ensureHydrated(force = false) {
  if (typeof window === 'undefined' || hydrationPromise) {
    return;
  }
  if (hydrated && !force) {
    return;
  }

  hydrationPromise = hydrateFromApi().finally(() => {
    hydrationPromise = null;
  });
}

export function getCapabilityCards(): CapabilityCard[] {
  if (typeof window === 'undefined') {
    return EMPTY_CAPABILITY_CARDS;
  }

  ensureHydrated();
  return cachedCardsValue;
}

export function setCapabilityCards(cards: CapabilityCard[]): void {
  const normalized = normalizeCards(cards);
  persistCache(normalized);

  void apiRequest<CapabilityCard[]>(API_PATH, {
    method: 'PUT',
    body: JSON.stringify(normalized),
  }).then((items) => {
    persistCache(normalizeCards(items));
  }).catch(() => {
    // Keep optimistic state if the backend is temporarily unavailable.
  });
}

export function addCapabilityCard(title: string, description: string, icon: string, link: string): CapabilityCard[] {
  const optimisticCard: CapabilityCard = {
    id: createId(title),
    title: title.trim(),
    description: description.trim(),
    icon: icon.trim() || 'AI',
    link: link.trim() || '#services',
    enabled: true,
  };

  const next = [...getCapabilityCards(), optimisticCard];
  persistCache(next);

  void apiRequest<CapabilityCard>(API_PATH, {
    method: 'POST',
    body: JSON.stringify({
      title: optimisticCard.title,
      description: optimisticCard.description,
      icon: optimisticCard.icon,
      link: optimisticCard.link,
      enabled: optimisticCard.enabled,
    }),
  }).then((created) => {
    persistCache(getCapabilityCards().map((card) => (card.id === optimisticCard.id ? normalizeCards([created])[0] : card)));
  }).catch(() => {
    // Keep optimistic card if the request fails.
  });

  return next;
}

export function updateCapabilityCard(
  id: string,
  patch: Partial<Pick<CapabilityCard, 'title' | 'description' | 'icon' | 'link' | 'enabled'>>
): CapabilityCard[] {
  const next = getCapabilityCards().map((card) => (
    card.id === id
      ? {
          ...card,
          ...(typeof patch.title === 'string' ? { title: patch.title } : {}),
          ...(typeof patch.description === 'string' ? { description: patch.description } : {}),
          ...(typeof patch.icon === 'string' ? { icon: patch.icon } : {}),
          ...(typeof patch.link === 'string' ? { link: patch.link } : {}),
          ...(typeof patch.enabled === 'boolean' ? { enabled: patch.enabled } : {}),
        }
      : card
  ));

  persistCache(next);

  void apiRequest<CapabilityCard>(`${API_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  }).then((updated) => {
    persistCache(getCapabilityCards().map((card) => (card.id === id ? normalizeCards([updated])[0] : card)));
  }).catch(() => {
    // Keep optimistic state if the backend request fails.
  });

  return next;
}

export function deleteCapabilityCard(id: string): CapabilityCard[] {
  const next = getCapabilityCards().filter((card) => card.id !== id);
  persistCache(next);

  void apiRequest<void>(`${API_PATH}/${id}`, {
    method: 'DELETE',
  }).catch(() => {
    // Keep optimistic removal if the backend request fails.
  });

  return next;
}

export function useCapabilityCards(): [CapabilityCard[], React.Dispatch<React.SetStateAction<CapabilityCard[]>>] {
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
    ensureHydrated(true);
  }, []);

  const cards = React.useSyncExternalStore(
    subscribe,
    getCapabilityCards,
    () => EMPTY_CAPABILITY_CARDS
  );

  const setCards = React.useCallback<React.Dispatch<React.SetStateAction<CapabilityCard[]>>>((value) => {
    const next = typeof value === 'function' ? value(getCapabilityCards()) : value;
    setCapabilityCards(next);
  }, []);

  return [cards, setCards];
}
