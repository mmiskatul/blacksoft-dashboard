'use client';

import React from 'react';
import { apiRequest } from './apiClient';

export interface StatsSettings {
  stat1Value: string;
  stat1Label: string;
  stat1Description: string;
  stat2Value: string;
  stat2Label: string;
  stat2Description: string;
  stat3Value: string;
  stat3Label: string;
  stat3Description: string;
}

const EVENT_NAME = 'blacksoft_stats_settings_updated';
const PUBLIC_SETTINGS_API_PATH = '/services/stats/settings';
const PROTECTED_SETTINGS_API_PATH = '/dashboard/stats/settings';

const DEFAULT_SETTINGS: StatsSettings = {
  stat1Value: '',
  stat1Label: '',
  stat1Description: '',
  stat2Value: '',
  stat2Label: '',
  stat2Description: '',
  stat3Value: '',
  stat3Label: '',
  stat3Description: '',
};

let cachedSettingsValue: StatsSettings = DEFAULT_SETTINGS;
let hydrationPromise: Promise<void> | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function normalizeSettings(settings: Partial<StatsSettings> | null | undefined): StatsSettings {
  if (!settings) return DEFAULT_SETTINGS;
  const raw = settings as any;

  return {
    stat1Value:       typeof (settings.stat1Value       ?? raw.stat1_value)       === 'string' ? (settings.stat1Value       ?? raw.stat1_value).trim()       : '',
    stat1Label:       typeof (settings.stat1Label       ?? raw.stat1_label)       === 'string' ? (settings.stat1Label       ?? raw.stat1_label).trim()       : '',
    stat1Description: typeof (settings.stat1Description ?? raw.stat1_description) === 'string' ? (settings.stat1Description ?? raw.stat1_description).trim() : '',

    stat2Value:       typeof (settings.stat2Value       ?? raw.stat2_value)       === 'string' ? (settings.stat2Value       ?? raw.stat2_value).trim()       : '',
    stat2Label:       typeof (settings.stat2Label       ?? raw.stat2_label)       === 'string' ? (settings.stat2Label       ?? raw.stat2_label).trim()       : '',
    stat2Description: typeof (settings.stat2Description ?? raw.stat2_description) === 'string' ? (settings.stat2Description ?? raw.stat2_description).trim() : '',

    stat3Value:       typeof (settings.stat3Value       ?? raw.stat3_value)       === 'string' ? (settings.stat3Value       ?? raw.stat3_value).trim()       : '',
    stat3Label:       typeof (settings.stat3Label       ?? raw.stat3_label)       === 'string' ? (settings.stat3Label       ?? raw.stat3_label).trim()       : '',
    stat3Description: typeof (settings.stat3Description ?? raw.stat3_description) === 'string' ? (settings.stat3Description ?? raw.stat3_description).trim() : '',
  };
}

function persistSettingsCache(settings: StatsSettings) {
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
    const settings = await apiRequest<StatsSettings>(PUBLIC_SETTINGS_API_PATH);
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

export function useStatsSettings(): StatsSettings {
  const [settings, setSettings] = React.useState<StatsSettings>(cachedSettingsValue);

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

export async function saveStatsSettings(settings: Omit<StatsSettings, 'id'>): Promise<StatsSettings> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('blacksoft_auth_token') : null;
  const updated = await apiRequest<StatsSettings>(PROTECTED_SETTINGS_API_PATH, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(settings),
  });

  const normalized = normalizeSettings(updated);
  persistSettingsCache(normalized);
  return normalized;
}
