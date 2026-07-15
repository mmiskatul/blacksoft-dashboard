'use client';

import React from 'react';
import { apiRequest } from './apiClient';

export interface WhoWeAreSettings {
  tag: string;
  title: string;
  description: string;
  highlight1Num: string;
  highlight1Label: string;
  highlight2Num: string;
  highlight2Label: string;
  highlight3Num: string;
  highlight3Label: string;
}

const EVENT_NAME = 'blacksoft_who_we_are_updated';
const PUBLIC_SETTINGS_API_PATH = '/services/who-we-are/settings';
const PROTECTED_SETTINGS_API_PATH = '/dashboard/who-we-are/settings';

const DEFAULT_SETTINGS: WhoWeAreSettings = {
  tag: 'WHO WE ARE',
  title: 'We are a collective of digital engineers, designers, and systems architects.',
  description: 'At Blacksoft, we build high-fidelity software products, autonomous agent layers, and scalable cloud infrastructure for startups and modern companies.',
  highlight1Num: '50+',
  highlight1Label: 'Intelligent Systems Shipped',
  highlight2Num: '99.9%',
  highlight2Label: 'SLA System Availability',
  highlight3Num: '24/7',
  highlight3Label: 'Continuous Optimization',
};

let cachedSettingsValue: WhoWeAreSettings = DEFAULT_SETTINGS;
let hydrationPromise: Promise<void> | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function normalizeSettings(settings: Partial<WhoWeAreSettings> | null | undefined): WhoWeAreSettings {
  if (!settings) return DEFAULT_SETTINGS;
  return {
    tag: typeof settings.tag === 'string' ? settings.tag.trim() : DEFAULT_SETTINGS.tag,
    title: typeof settings.title === 'string' ? settings.title.trim() : DEFAULT_SETTINGS.title,
    description: typeof settings.description === 'string' ? settings.description.trim() : DEFAULT_SETTINGS.description,
    highlight1Num: typeof settings.highlight1Num === 'string' ? settings.highlight1Num.trim() : DEFAULT_SETTINGS.highlight1Num,
    highlight1Label: typeof settings.highlight1Label === 'string' ? settings.highlight1Label.trim() : DEFAULT_SETTINGS.highlight1Label,
    highlight2Num: typeof settings.highlight2Num === 'string' ? settings.highlight2Num.trim() : DEFAULT_SETTINGS.highlight2Num,
    highlight2Label: typeof settings.highlight2Label === 'string' ? settings.highlight2Label.trim() : DEFAULT_SETTINGS.highlight2Label,
    highlight3Num: typeof settings.highlight3Num === 'string' ? settings.highlight3Num.trim() : DEFAULT_SETTINGS.highlight3Num,
    highlight3Label: typeof settings.highlight3Label === 'string' ? settings.highlight3Label.trim() : DEFAULT_SETTINGS.highlight3Label,
  };
}

function persistSettingsCache(settings: WhoWeAreSettings) {
  cachedSettingsValue = settings;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
  listeners.forEach((listener) => listener());
}

async function hydrateSettingsFromApi(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const settings = await apiRequest<WhoWeAreSettings>(PUBLIC_SETTINGS_API_PATH);
    persistSettingsCache(normalizeSettings(settings));
  } catch {
    persistSettingsCache(DEFAULT_SETTINGS);
  } finally {
    hydrated = true;
  }
}

function ensureSettingsHydrated() {
  if (typeof window === 'undefined' || hydrated || hydrationPromise) {
    return;
  }

  hydrationPromise = hydrateSettingsFromApi().finally(() => {
    hydrationPromise = null;
  });
}

export function useWhoWeAreSettings(): WhoWeAreSettings {
  const [settings, setSettings] = React.useState<WhoWeAreSettings>(cachedSettingsValue);

  React.useEffect(() => {
    ensureSettingsHydrated();

    const handleUpdate = () => {
      setSettings(cachedSettingsValue);
    };

    listeners.add(handleUpdate);
    window.addEventListener(EVENT_NAME, handleUpdate);

    return () => {
      listeners.delete(handleUpdate);
      window.removeEventListener(EVENT_NAME, handleUpdate);
    };
  }, []);

  return settings;
}

export async function saveWhoWeAreSettings(settings: Omit<WhoWeAreSettings, 'id'>): Promise<WhoWeAreSettings> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('blacksoft_auth_token') : null;
  const updated = await apiRequest<WhoWeAreSettings>(PROTECTED_SETTINGS_API_PATH, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(settings),
  });

  const normalized = normalizeSettings(updated);
  persistSettingsCache(normalized);
  return normalized;
}
