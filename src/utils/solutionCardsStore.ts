'use client';

import React from 'react';
import { apiRequest } from './apiClient';

export type SolutionCard = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  link: string;
  imageSrc?: string;
  imageAlt?: string;
  enabled: boolean;
};

type Patch = Partial<Pick<SolutionCard, 'title' | 'description' | 'category' | 'icon' | 'link' | 'imageSrc' | 'imageAlt' | 'enabled'>>;

function createStore(apiPath: string, eventName: string) {
  const empty: SolutionCard[] = [];
  let cached = empty;
  let hydrated = false;
  let hydrationPromise: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  const normalize = (items: unknown): SolutionCard[] => (Array.isArray(items) ? items : [])
    .filter((item): item is Partial<SolutionCard> => Boolean(
      item &&
      typeof item === 'object' &&
      'title' in item && typeof item.title === 'string' && item.title.trim().length > 0 &&
      'description' in item && typeof item.description === 'string' && item.description.trim().length > 0
    ))
    .map((item, index) => ({
      id: typeof item.id === 'string' && item.id ? item.id : `solution-${index + 1}`,
      title: item.title!.trim(),
      description: item.description!.trim(),
      category: typeof item.category === 'string' && item.category.trim() ? item.category.trim() : 'App',
      icon: typeof item.icon === 'string' && item.icon.trim() ? item.icon.trim() : 'AI',
      link: typeof item.link === 'string' && item.link.trim() ? item.link.trim() : '#solutions',
      imageSrc: typeof item.imageSrc === 'string' ? item.imageSrc.trim() : '',
      imageAlt: typeof item.imageAlt === 'string' ? item.imageAlt.trim() : '',
      enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
    }));

  const notify = (next: SolutionCard[]) => {
    cached = next;
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(eventName));
    listeners.forEach((listener) => listener());
  };

  const hydrate = async () => {
    try { notify(normalize(await apiRequest<SolutionCard[]>(apiPath))); }
    catch { notify(empty); }
    finally { hydrated = true; }
  };

  const ensureHydrated = (force = false) => {
    if (typeof window === 'undefined' || hydrationPromise) return;
    if (hydrated && !force) return;
    hydrationPromise = hydrate().finally(() => { hydrationPromise = null; });
  };

  const get = () => { ensureHydrated(); return cached; };
  const add = (title: string, description: string, category: string, icon: string, link: string, imageSrc?: string, imageAlt?: string) => {
    const optimistic: SolutionCard = { 
      id: `draft-${Date.now()}`, 
      title: title.trim(), 
      description: description.trim(), 
      category: category.trim() || 'App', 
      icon: icon.trim() || 'AI', 
      link: link.trim() || '#solutions', 
      imageSrc: imageSrc?.trim() || '',
      imageAlt: imageAlt?.trim() || '',
      enabled: true 
    };
    notify([...get(), optimistic]);
    void apiRequest<SolutionCard>(apiPath, { method: 'POST', body: JSON.stringify(optimistic) })
      .then((created) => notify(get().map((card) => card.id === optimistic.id ? normalize([created])[0] : card)));
  };
  const update = (id: string, patch: Patch) => {
    notify(get().map((card) => card.id === id ? { ...card, ...patch } : card));
    void apiRequest<SolutionCard>(`${apiPath}/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
      .then((updated) => notify(get().map((card) => card.id === id ? normalize([updated])[0] : card)));
  };
  const remove = (id: string) => {
    notify(get().filter((card) => card.id !== id));
    void apiRequest<void>(`${apiPath}/${id}`, { method: 'DELETE' });
  };
  const useCards = (): [SolutionCard[], React.Dispatch<React.SetStateAction<SolutionCard[]>>] => {
    const subscribe = React.useCallback((onStoreChange: () => void) => {
      listeners.add(onStoreChange);
      window.addEventListener(eventName, onStoreChange);
      return () => { listeners.delete(onStoreChange); window.removeEventListener(eventName, onStoreChange); };
    }, []);
    React.useEffect(() => { ensureHydrated(true); }, []);
    const cards = React.useSyncExternalStore(subscribe, get, () => empty);
    const setCards = React.useCallback<React.Dispatch<React.SetStateAction<SolutionCard[]>>>((value) => notify(typeof value === 'function' ? value(get()) : value), []);
    return [cards, setCards];
  };
  return { get, add, update, remove, useCards };
}

export const appWebsiteStore = createStore('/dashboard/app-websites/cards', 'blacksoft_app_websites_updated');
export const aiSolutionStore = createStore('/dashboard/ai-solutions/cards', 'blacksoft_ai_solutions_updated');

export const useAppWebsiteCards = appWebsiteStore.useCards;
export const useAiSolutionCards = aiSolutionStore.useCards;
