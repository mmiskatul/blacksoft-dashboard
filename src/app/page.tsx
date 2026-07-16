'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { apiRequest } from '../utils/apiClient';

type Summary = {
  capabilities: number;
  innovators: number;
  ecommerce_cards: number;
  app_websites: number;
  ai_solutions: number;
  technology_stack_cards: number;
  team_members: number;
};

const initialSummary: Summary = {
  capabilities: 0,
  innovators: 0,
  ecommerce_cards: 0,
  app_websites: 0,
  ai_solutions: 0,
  technology_stack_cards: 0,
  team_members: 0,
};

export default function DashboardOverviewPage() {
  const [summary, setSummary] = React.useState<Summary>(initialSummary);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    void apiRequest<Summary>('/dashboard/summary')
      .then((data) => {
        if (!cancelled) setSummary({ ...initialSummary, ...data });
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const metrics = [
    { label: 'Capabilities', value: summary.capabilities, detail: 'AI services on the homepage', icon: '⚡', color: '#c3c0ff' },
    { label: 'Innovators', value: summary.innovators, detail: 'Trusted partner names', icon: '💎', color: '#4cd7f6' },
    { label: 'Commerce cards', value: summary.ecommerce_cards, detail: 'Personalized shopping', icon: '🛒', color: '#ffb2b7' },
    { label: 'AI solutions', value: summary.ai_solutions, detail: 'Agents & automation systems', icon: '🧠', color: '#8083ff' },
    { label: 'Team members', value: summary.team_members, detail: 'People shown in the studio', icon: '👥', color: '#acedff' },
  ];

  return (
    <div className={`${styles.page} animate-fade-in-up delay-1`}>
      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>Blacksoft / control room</div>
          <h1 className={styles.title}>
            Build the <span className={styles.titleGradient}>intelligence layer</span>.
          </h1>
          <p className={styles.intro}>
            Shape the public site, product stories, and AI capabilities from one focused workspace.
            Every change here is reflected in the live experience.
          </p>
        </div>
        <Link href={process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3000'} target="_blank" className={`${styles.heroAction} glow-btn`}>
          View live site <span>↗</span>
        </Link>
      </section>

      <section className={`${styles.metrics} animate-fade-in-up delay-2`} aria-label="Content summary">
        {metrics.map((metric, index) => (
          <article className={`${styles.metric} float-hover`} key={metric.label}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>{metric.label}</span>
              <span className={styles.metricIcon} style={{ textShadow: `0 0 12px ${metric.color}` }}>{metric.icon}</span>
            </div>
            <div className={`${styles.metricValue} ${index === 0 ? styles.metricAccent : ''}`}>
              {isLoading ? (
                <span className={styles.spinner} />
              ) : (
                metric.value
              )}
            </div>
            <div className={styles.metricDetail}>{metric.detail}</div>
            <div className={styles.metricGlowBorder} style={{ background: `linear-gradient(90deg, transparent, ${metric.color} 50%, transparent)` }} />
          </article>
        ))}
      </section>

      <section className={styles.contentGrid}>
        <article className={`${styles.panel} ${styles.glassPanel} animate-fade-in-up delay-3`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Content surface</h2>
            <span className={styles.status}>Connected</span>
          </div>
          <div className={styles.scopeList}>
            <Link href="/solutions" className={`${styles.scopeItem} shine-hover`}>
              <span className={styles.scopeName}>Solutions Catalog <span className={styles.itemArrow}>→</span></span>
              <span className={styles.scopeCount}>{summary.app_websites + summary.ai_solutions}</span>
            </Link>
            <Link href="/trusted-by-global-innovators" className={`${styles.scopeItem} shine-hover`}>
              <span className={styles.scopeName}>Trusted by Global Innovators <span className={styles.itemArrow}>→</span></span>
              <span className={styles.scopeCount}>{summary.innovators}</span>
            </Link>
            <Link href="/technology-stack" className={`${styles.scopeItem} shine-hover`}>
              <span className={styles.scopeName}>Technology Stack <span className={styles.itemArrow}>→</span></span>
              <span className={styles.scopeCount}>{summary.technology_stack_cards}</span>
            </Link>
            <Link href="/team-members" className={`${styles.scopeItem} shine-hover`}>
              <span className={styles.scopeName}>Team Members <span className={styles.itemArrow}>→</span></span>
              <span className={styles.scopeCount}>{summary.team_members}</span>
            </Link>
          </div>
        </article>

        <article className={`${styles.panel} ${styles.glassPanel} animate-fade-in-up delay-4`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Operating checklist</h2>
            <span className={styles.panelKicker}>Today</span>
          </div>
          <div className={styles.taskList}>
            <div className={styles.task}>
              <span className={`${styles.taskDot} ${styles.taskDotReady} pulse-active`} />
              Confirm active content has an image or icon.
            </div>
            <div className={styles.task}>
              <span className={styles.taskDot} />
              Review the public site on mobile after publishing.
            </div>
            <div className={styles.task}>
              <span className={styles.taskDot} />
              Keep titles concise so cards scan quickly.
            </div>
          </div>
          <div className={styles.note}>
            <span className={styles.noteIcon}>💡</span>
            <span>Tip: use the eye controls inside each editor to preview the exact card before publishing.</span>
          </div>
        </article>
      </section>
    </div>
  );
}
