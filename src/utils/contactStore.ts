'use client';

import React from 'react';
import { apiRequest } from './apiClient';

export interface ContactInfoSettings {
  location: string;
  email: string;
  phone: string;
  privacyPolicy: string;
}

const API_GET  = '/dashboard/contact-info';
const API_PUT  = '/dashboard/contact-info';

let cached: ContactInfoSettings = { location: '', email: '', phone: '', privacyPolicy: '' };
let hydrated = false;
const EVENT = 'Namisoft_dashboard_contact_updated';
const listeners = new Set<() => void>();

function broadcast() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT));
  listeners.forEach(l => l());
}

async function fetchContactInfo(): Promise<ContactInfoSettings> {
  const data = await apiRequest<ContactInfoSettings>(API_GET);
  return {
    location:      data.location      ?? '',
    email:         data.email         ?? '',
    phone:         data.phone         ?? '',
    privacyPolicy: data.privacyPolicy ?? '',
  };
}

export async function saveContactInfo(payload: Partial<ContactInfoSettings>): Promise<void> {
  const result = await apiRequest<ContactInfoSettings>(API_PUT, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  cached = { location: result.location ?? '', email: result.email ?? '', phone: result.phone ?? '', privacyPolicy: result.privacyPolicy ?? '' };
  broadcast();
}

export function useContactInfoSettings(): ContactInfoSettings {
  const [info, setInfo] = React.useState<ContactInfoSettings>(cached);

  React.useEffect(() => {
    const handler = () => setInfo({ ...cached });
    listeners.add(handler);
    window.addEventListener(EVENT, handler);

    if (!hydrated) {
      fetchContactInfo().then(data => {
        cached = data;
        hydrated = true;
        broadcast();
      }).catch(() => { hydrated = true; });
    }

    return () => {
      listeners.delete(handler);
      window.removeEventListener(EVENT, handler);
    };
  }, []);

  return info;
}
