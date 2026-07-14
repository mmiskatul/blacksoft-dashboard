'use client';

import React from 'react';

// Default mock values matching original components
export const DEFAULTS = {
  // Homepage Hero
  'home.hero.tag': 'NEXT-GEN AI DEVELOPMENT',
  'home.hero.title': 'Transforming Ideas Into Intelligent Digital Products.',
  'home.hero.description': 'Award-winning AI software development for startups and enterprise. We design, develop, and deploy intelligent systems that scale at speed.',
  'home.hero.cta': 'Book a Strategy Call',

  // About Page Hero
  'about.hero.tag': 'OUR MISSION',
  'about.hero.title': 'Architecting Intelligence for the Elite Enterprise.',
  'about.hero.description': "At Blacksoft, we don't just build software; we engineer the cognitive infrastructure that powers the world's most ambitious organizations. Our mission is to bridge the gap between raw data and autonomous wisdom.",
  'about.hero.cta': 'Explore Our Tech',

  // Technology Page Hero
  'tech.hero.tag': 'NEURAL INFRASTRUCTURE',
  'tech.hero.title': 'The Compute Power Behind Elite Intelligence.',
  'tech.hero.description': 'We build on state-of-the-art supercomputing networks, pairing custom neural kernels with dedicated GPU infrastructure to deliver unmatched model response times and throughput.',
  'tech.hero.cta': 'Explore Our Stack',

  // Enterprise Page Hero
  'enterprise.hero.tag': 'GLOBAL SCALING',
  'enterprise.hero.title': 'AI Scaled to the Demands of Global Leaders.',
  'enterprise.hero.description': 'We engineer AI architectures with rigorous safety boundaries, zero-trust data frameworks, and high-availability SLAs, enabling Fortune 500 enterprises to deploy cognitive models with absolute confidence.',
  'enterprise.hero.cta': 'Explore Enterprise Security',
  'enterprise.stats.sla': '99.99% system availability. Full SOC 2 Type II, HIPAA, and GDPR data boundary compliance.',

  // Solutions Page Hero
  'solutions.hero.tag': 'POWERING THE FUTURE',
  'solutions.hero.title': 'Industry Solutions',
  'solutions.hero.description': 'Blacksoft delivers high-precision, enterprise-grade artificial intelligence tailored for specialized domains. We bridge the gap between experimental tech and mission-critical deployment.',

  // Navbar
  'navbar.cta': 'Book a Call',
  'navbar.brand': 'Blacksoft',

  // Footer
  'footer.description': 'Architecting the next generation of intelligent software for world-class innovators and tech leaders.',
  'footer.email': 'hello@blacksoft.tech',
  'footer.location': 'Global HQ: San Francisco, CA',
  'footer.copyright': 'Blacksoft. All rights reserved.',

  // CTA Section
  'cta.title': 'Ready to build the future of industry?',
  'cta.description': "Join the ranks of global innovators who have transformed their operations with Blacksoft's AI-first intelligence platforms.",
  'cta.primary': 'Schedule a Consultation',
  'cta.secondary': 'View Case Studies'
};

export function getConfig(key: keyof typeof DEFAULTS): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`blacksoft_config_${key}`);
    if (saved !== null) {
      return saved;
    }
  }
  return DEFAULTS[key];
}

export function setConfig(key: keyof typeof DEFAULTS, value: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`blacksoft_config_${key}`, value);
    // Dispatch custom event to notify other components on the same page
    window.dispatchEvent(new Event('blacksoft_config_updated'));
  }
}

export function useSiteConfig(key: keyof typeof DEFAULTS): string {
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    const handleUpdate = () => {
      onStoreChange();
    };

    window.addEventListener('blacksoft_config_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('blacksoft_config_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return React.useSyncExternalStore(
    subscribe,
    () => getConfig(key),
    () => DEFAULTS[key]
  );
}
