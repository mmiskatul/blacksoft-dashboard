'use client';

import React from 'react';
import { apiRequest } from './apiClient';

export type EcommerceCard = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  isPlaceholder: boolean;
  enabled: boolean;
};

const STORE_EVENT = 'blacksoft_ecommerce_cards_updated';
const API_PATH = '/dashboard/ecommerce/cards';
const EMPTY_CARDS: EcommerceCard[] = [];

let cachedCardsValue: EcommerceCard[] = EMPTY_CARDS;
let hydrationPromise: Promise<void> | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function createId(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `ecommerce-${Date.now()}`
  );
}

function normalizeCard(item: Partial<EcommerceCard>, index: number): EcommerceCard {
  const raw = item as Record<string, unknown>;
  const imageSrc = typeof raw.imageSrc === 'string'
    ? raw.imageSrc
    : typeof raw.image_src === 'string'
      ? raw.image_src
      : '';
  const imageAlt = typeof raw.imageAlt === 'string'
    ? raw.imageAlt
    : typeof raw.image_alt === 'string'
      ? raw.image_alt
      : 'Ecommerce card image';

  return {
    id: typeof item.id === 'string' && item.id.trim() ? item.id : createId(typeof item.title === 'string' ? item.title : `card-${index + 1}`),
    title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Card ${index + 1}`,
    description: typeof item.description === 'string' && item.description.trim() ? item.description.trim() : 'No description provided.',
    imageSrc: imageSrc.trim(),
    imageAlt: imageAlt.trim() || 'Ecommerce card image',
    isPlaceholder: typeof item.isPlaceholder === 'boolean' ? item.isPlaceholder : false,
    enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
  };
}

function normalizeCards(cards: unknown): EcommerceCard[] {
  if (!Array.isArray(cards)) {
    return EMPTY_CARDS;
  }

  return cards
    .filter((item): item is Partial<EcommerceCard> => Boolean(item && typeof item === 'object'))
    .map((item, index) => normalizeCard(item, index));
}

function persistCache(cards: EcommerceCard[]) {
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
    const items = await apiRequest<EcommerceCard[]>(API_PATH);
    persistCache(normalizeCards(items));
  } catch {
    persistCache(EMPTY_CARDS);
  } finally {
    hydrated = true;
  }
}

function ensureHydrated() {
  if (typeof window === 'undefined' || hydrated || hydrationPromise) {
    return;
  }

  hydrationPromise = hydrateFromApi().finally(() => {
    hydrationPromise = null;
  });
}

export function getEcommerceCards(): EcommerceCard[] {
  if (typeof window === 'undefined') {
    return EMPTY_CARDS;
  }

  ensureHydrated();
  return cachedCardsValue;
}

export function setEcommerceCards(cards: EcommerceCard[]): void {
  const normalized = normalizeCards(cards);
  persistCache(normalized);

  void apiRequest<EcommerceCard[]>(API_PATH, {
    method: 'PUT',
    body: JSON.stringify(normalized),
  }).then((items) => {
    persistCache(normalizeCards(items));
  }).catch(() => {
    // Keep optimistic state if the backend is temporarily unavailable.
  });
}

export function addEcommerceCard(
  title: string,
  description: string,
  imageSrc: string,
  imageAlt: string,
  isPlaceholder: boolean
): EcommerceCard[] {
  const optimisticCard: EcommerceCard = {
    id: createId(title),
    title: title.trim(),
    description: description.trim(),
    imageSrc: imageSrc.trim(),
    imageAlt: imageAlt.trim() || 'Ecommerce card image',
    isPlaceholder,
    enabled: true,
  };

  const next = [...getEcommerceCards(), optimisticCard];
  persistCache(next);

  void apiRequest<EcommerceCard>(API_PATH, {
    method: 'POST',
    body: JSON.stringify({
      title: optimisticCard.title,
      description: optimisticCard.description,
      imageSrc: optimisticCard.imageSrc,
      imageAlt: optimisticCard.imageAlt,
      isPlaceholder: optimisticCard.isPlaceholder,
      enabled: optimisticCard.enabled,
    }),
  }).then((created) => {
    persistCache(getEcommerceCards().map((card) => (card.id === optimisticCard.id ? normalizeCard(created, 0) : card)));
  }).catch(() => {
    // Keep optimistic state if the backend request fails.
  });

  return next;
}

export function updateEcommerceCard(
  id: string,
  patch: Partial<Pick<EcommerceCard, 'title' | 'description' | 'imageSrc' | 'imageAlt' | 'isPlaceholder' | 'enabled'>>
): EcommerceCard[] {
  const next = getEcommerceCards().map((card) => (
    card.id === id
      ? {
          ...card,
          ...(typeof patch.title === 'string' ? { title: patch.title } : {}),
          ...(typeof patch.description === 'string' ? { description: patch.description } : {}),
          ...(typeof patch.imageSrc === 'string' ? { imageSrc: patch.imageSrc } : {}),
          ...(typeof patch.imageAlt === 'string' ? { imageAlt: patch.imageAlt } : {}),
          ...(typeof patch.isPlaceholder === 'boolean' ? { isPlaceholder: patch.isPlaceholder } : {}),
          ...(typeof patch.enabled === 'boolean' ? { enabled: patch.enabled } : {}),
        }
      : card
  ));

  persistCache(next);

  void apiRequest<EcommerceCard>(`${API_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  }).then((updated) => {
    persistCache(getEcommerceCards().map((card) => (card.id === id ? normalizeCard(updated, 0) : card)));
  }).catch(() => {
    // Keep optimistic state if the backend request fails.
  });

  return next;
}

export function deleteEcommerceCard(id: string): EcommerceCard[] {
  const next = getEcommerceCards().filter((card) => card.id !== id);
  persistCache(next);

  void apiRequest<void>(`${API_PATH}/${id}`, {
    method: 'DELETE',
  }).catch(() => {
    // Keep optimistic removal if the backend request fails.
  });

  return next;
}

export function useEcommerceCards(): [EcommerceCard[], React.Dispatch<React.SetStateAction<EcommerceCard[]>>] {
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
    ensureHydrated();
  }, []);

  const cards = React.useSyncExternalStore(
    subscribe,
    getEcommerceCards,
    () => EMPTY_CARDS
  );

  const setCards = React.useCallback<React.Dispatch<React.SetStateAction<EcommerceCard[]>>>((value) => {
    const next = typeof value === 'function' ? value(getEcommerceCards()) : value;
    setEcommerceCards(next);
  }, []);

  return [cards, setCards];
}
