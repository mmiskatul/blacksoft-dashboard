'use client';

import React from 'react';
import { apiRequest } from './apiClient';

export type WhyUsCard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
};

const STORE_EVENT = 'blacksoft_why_us_cards_updated';
const API_PATH = '/why-us';

const EMPTY_WHY_US_CARDS: WhyUsCard[] = [];

let cachedCardsValue: WhyUsCard[] = EMPTY_WHY_US_CARDS;
let hydrationPromise: Promise<void> | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function createId(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `whyus-${Date.now()}`;
}

function normalizeCards(cards: unknown): WhyUsCard[] {
  if (!Array.isArray(cards)) {
    return EMPTY_WHY_US_CARDS;
  }

  return cards
    .filter((item): item is Partial<WhyUsCard> => Boolean(item && typeof item === 'object'))
    .map((item, index) => ({
      id: typeof item.id === 'string' && item.id.trim() ? item.id : createId(item.title || `whyus-${index + 1}`),
      title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Benefit ${index + 1}`,
      description: typeof item.description === 'string' && item.description.trim()
        ? item.description.trim()
        : 'No description provided.',
      icon: typeof item.icon === 'string' && item.icon.trim() ? item.icon.trim() : '⚡',
      enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
    }));
}

function persistCache(cards: WhyUsCard[]) {
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
    const items = await apiRequest<WhyUsCard[]>(API_PATH);
    persistCache(normalizeCards(items));
  } catch {
    persistCache(EMPTY_WHY_US_CARDS);
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

export function useWhyUsCards(): [WhyUsCard[], boolean] {
  const [cards, setCards] = React.useState<WhyUsCard[]>(cachedCardsValue);

  React.useEffect(() => {
    ensureHydrated();

    const handleUpdate = () => {
      setCards(cachedCardsValue);
    };

    listeners.add(handleUpdate);
    window.addEventListener(STORE_EVENT, handleUpdate);

    return () => {
      listeners.delete(handleUpdate);
      window.removeEventListener(STORE_EVENT, handleUpdate);
    };
  }, []);

  return [cards, hydrated];
}

export async function addWhyUsCard(card: Omit<WhyUsCard, 'id' | 'enabled'>): Promise<WhyUsCard> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('blacksoft_auth_token') : null;
  const newCard = await apiRequest<WhyUsCard>(API_PATH, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({
      ...card,
      enabled: true,
    }),
  });

  const updatedList = [...cachedCardsValue, newCard];
  persistCache(updatedList);
  return newCard;
}

export async function updateWhyUsCard(id: string, card: Partial<Omit<WhyUsCard, 'id'>>): Promise<WhyUsCard> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('blacksoft_auth_token') : null;
  const updated = await apiRequest<WhyUsCard>(`${API_PATH}/${id}`, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(card),
  });

  const updatedList = cachedCardsValue.map((item) => (item.id === id ? updated : item));
  persistCache(updatedList);
  return updated;
}

export async function deleteWhyUsCard(id: string): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('blacksoft_auth_token') : null;
  await apiRequest<void>(`${API_PATH}/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const updatedList = cachedCardsValue.filter((item) => item.id !== id);
  persistCache(updatedList);
}
