'use client';

import React from 'react';
import { apiRequest } from './apiClient';

export type TrustedInnovator = {
  id: string;
  name: string;
  enabled: boolean;
};

const STORE_EVENT = 'Namisoft_trusted_innovators_updated';
const API_PATH = '/dashboard/innovators';

const EMPTY_TRUSTED_INNOVATORS: TrustedInnovator[] = [];

let cachedItemsValue: TrustedInnovator[] = EMPTY_TRUSTED_INNOVATORS;
let hydrationPromise: Promise<void> | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function createId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `innovator-${Date.now()}`;
}

function normalizeItems(items: unknown): TrustedInnovator[] {
  if (!Array.isArray(items)) {
    return EMPTY_TRUSTED_INNOVATORS;
  }

  const normalized = items
    .filter((item): item is Partial<TrustedInnovator> => Boolean(item && typeof item === 'object'))
    .map((item, index) => ({
      id: typeof item.id === 'string' && item.id.trim() ? item.id : createId(item.name || `innovator-${index + 1}`),
      name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : `Innovator ${index + 1}`,
      enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
    }))
    .filter((item) => item.name.trim().length > 0);

  return normalized;
}

function persistCache(items: TrustedInnovator[]) {
  cachedItemsValue = items;
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
    const items = await apiRequest<TrustedInnovator[]>(API_PATH);
    persistCache(normalizeItems(items));
  } catch {
    persistCache(EMPTY_TRUSTED_INNOVATORS);
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

export function getTrustedInnovators(): TrustedInnovator[] {
  if (typeof window === 'undefined') {
    return EMPTY_TRUSTED_INNOVATORS;
  }

  ensureHydrated();
  return cachedItemsValue;
}

export function setTrustedInnovators(items: TrustedInnovator[]): void {
  const normalized = normalizeItems(items);
  persistCache(normalized);

  void apiRequest<TrustedInnovator[]>(API_PATH, {
    method: 'PUT',
    body: JSON.stringify(normalized),
  }).then((result) => {
    persistCache(normalizeItems(result));
  }).catch(() => {
    // Keep optimistic state if the backend is temporarily unavailable.
  });
}

export function addTrustedInnovator(name: string): TrustedInnovator[] {
  const optimisticItem = { id: createId(name), name: name.trim(), enabled: true };
  const next = [...getTrustedInnovators(), optimisticItem];
  persistCache(next);

  void apiRequest<TrustedInnovator>(API_PATH, {
    method: 'POST',
    body: JSON.stringify({ name: optimisticItem.name, enabled: optimisticItem.enabled }),
  }).then((created) => {
    persistCache(getTrustedInnovators().map((item) => (item.id === optimisticItem.id ? normalizeItems([created])[0] : item)));
  }).catch(() => {
    // Keep optimistic item if the backend request fails.
  });

  return next;
}

export function updateTrustedInnovator(id: string, patch: Partial<Pick<TrustedInnovator, 'name' | 'enabled'>>): TrustedInnovator[] {
  const next = getTrustedInnovators().map((item) => (
    item.id === id
      ? {
          ...item,
          ...(typeof patch.name === 'string' ? { name: patch.name } : {}),
          ...(typeof patch.enabled === 'boolean' ? { enabled: patch.enabled } : {}),
        }
      : item
  ));

  persistCache(next);

  void apiRequest<TrustedInnovator>(`${API_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  }).then((updated) => {
    persistCache(getTrustedInnovators().map((item) => (item.id === id ? normalizeItems([updated])[0] : item)));
  }).catch(() => {
    // Keep optimistic state if the backend request fails.
  });

  return next;
}

export function deleteTrustedInnovator(id: string): TrustedInnovator[] {
  const next = getTrustedInnovators().filter((item) => item.id !== id);
  persistCache(next);

  void apiRequest<void>(`${API_PATH}/${id}`, {
    method: 'DELETE',
  }).catch(() => {
    // Keep optimistic removal if the backend request fails.
  });

  return next;
}

export function useTrustedInnovators(): [TrustedInnovator[], React.Dispatch<React.SetStateAction<TrustedInnovator[]>>] {
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

  const items = React.useSyncExternalStore(
    subscribe,
    getTrustedInnovators,
    () => EMPTY_TRUSTED_INNOVATORS
  );

  const setItems = React.useCallback<React.Dispatch<React.SetStateAction<TrustedInnovator[]>>>((value) => {
    const next = typeof value === 'function' ? value(getTrustedInnovators()) : value;
    setTrustedInnovators(next);
  }, []);

  return [items, setItems];
}
