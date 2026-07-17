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
  const raw = settings as any;
  const h1Num = settings.highlight1Num ?? raw.highlight1_num;
  const h1Label = settings.highlight1Label ?? raw.highlight1_label;
  const h2Num = settings.highlight2Num ?? raw.highlight2_num;
  const h2Label = settings.highlight2Label ?? raw.highlight2_label;
  const h3Num = settings.highlight3Num ?? raw.highlight3_num;
  const h3Label = settings.highlight3Label ?? raw.highlight3_label;

  return {
    tag: typeof settings.tag === 'string' ? settings.tag.trim() : DEFAULT_SETTINGS.tag,
    title: typeof settings.title === 'string' ? settings.title.trim() : DEFAULT_SETTINGS.title,
    description: typeof settings.description === 'string' ? settings.description.trim() : DEFAULT_SETTINGS.description,
    highlight1Num: typeof h1Num === 'string' ? h1Num.trim() : DEFAULT_SETTINGS.highlight1Num,
    highlight1Label: typeof h1Label === 'string' ? h1Label.trim() : DEFAULT_SETTINGS.highlight1Label,
    highlight2Num: typeof h2Num === 'string' ? h2Num.trim() : DEFAULT_SETTINGS.highlight2Num,
    highlight2Label: typeof h2Label === 'string' ? h2Label.trim() : DEFAULT_SETTINGS.highlight2Label,
    highlight3Num: typeof h3Num === 'string' ? h3Num.trim() : DEFAULT_SETTINGS.highlight3Num,
    highlight3Label: typeof h3Label === 'string' ? h3Label.trim() : DEFAULT_SETTINGS.highlight3Label,
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

function ensureSettingsHydrated(force = false) {
  if (typeof window === 'undefined' || hydrationPromise) {
    return;
  }
  if (hydrated && !force) {
    return;
  }

  hydrationPromise = hydrateSettingsFromApi().finally(() => {
    hydrationPromise = null;
  });
}

export function useWhoWeAreSettings(): WhoWeAreSettings {
  const [settings, setSettings] = React.useState<WhoWeAreSettings>(cachedSettingsValue);

  React.useEffect(() => {
    ensureSettingsHydrated(true);

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
  const updated = await apiRequest<WhoWeAreSettings>(PROTECTED_SETTINGS_API_PATH, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });

  const normalized = normalizeSettings(updated);
  persistSettingsCache(normalized);
  return normalized;
}
