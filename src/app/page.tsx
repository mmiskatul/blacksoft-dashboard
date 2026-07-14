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
    void apiRequest<Summary>('/summary')
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
    { label: 'Capabilities', value: summary.capabilities, detail: 'AI services on the homepage' },
    { label: 'Innovators', value: summary.innovators, detail: 'Trusted partner names' },
    { label: 'Commerce cards', value: summary.ecommerce_cards, detail: 'Personalized agentic shopping' },
    { label: 'AI solutions', value: summary.ai_solutions, detail: 'Agents and automation systems' },
    { label: 'Team members', value: summary.team_members, detail: 'People shown in the studio' },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>Blacksoft / control room</div>
          <h1 className={styles.title}>Build the intelligence layer.</h1>
          <p className={styles.intro}>
            Shape the public site, product stories, and AI capabilities from one focused workspace.
            Every change here is reflected in the live experience.
          </p>
        </div>
        <Link href="/" target="_blank" className={styles.heroAction}>
          View live site <span>↗</span>
        </Link>
      </section>

      <section className={styles.metrics} aria-label="Content summary">
        {metrics.map((metric, index) => (
          <article className={styles.metric} key={metric.label}>
            <div className={styles.metricLabel}>{metric.label}</div>
            <div className={`${styles.metricValue} ${index === 0 ? styles.metricAccent : ''}`}>
              {isLoading ? '—' : metric.value}
            </div>
            <div className={styles.metricDetail}>{metric.detail}</div>
          </article>
        ))}
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Content surface</h2>
            <span className={styles.status}>Connected</span>
          </div>
          <div className={styles.scopeList}>
            <Link href="/architecting-intelligence" className={styles.scopeItem}>
              <span>Architecting Intelligence</span><span className={styles.scopeCount}>{summary.capabilities}</span>
            </Link>
            <Link href="/trusted-by-global-innovators" className={styles.scopeItem}>
              <span>Trusted by Global Innovators</span><span className={styles.scopeCount}>{summary.innovators}</span>
            </Link>
            <Link href="/ecommerce" className={styles.scopeItem}>
              <span>Personalized Agentic Shopping</span><span className={styles.scopeCount}>{summary.ecommerce_cards}</span>
            </Link>
            <Link href="/app-websites" className={styles.scopeItem}>
              <span>App & Website</span><span className={styles.scopeCount}>{summary.app_websites}</span>
            </Link>
            <Link href="/ai-solutions" className={styles.scopeItem}>
              <span>AI Solutions</span><span className={styles.scopeCount}>{summary.ai_solutions}</span>
            </Link>
            <Link href="/technology-stack" className={styles.scopeItem}>
              <span>Technology Stack</span><span className={styles.scopeCount}>{summary.technology_stack_cards}</span>
            </Link>
            <Link href="/team-members" className={styles.scopeItem}>
              <span>Team Members</span><span className={styles.scopeCount}>{summary.team_members}</span>
            </Link>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Operating checklist</h2>
            <span className={styles.panelKicker}>Today</span>
          </div>
          <div className={styles.taskList}>
            <div className={styles.task}><span className={`${styles.taskDot} ${styles.taskDotReady}`} />Confirm active content has an image or icon.</div>
            <div className={styles.task}><span className={styles.taskDot} />Review the public site on mobile after publishing.</div>
            <div className={styles.task}><span className={styles.taskDot} />Keep titles concise so cards scan quickly.</div>
          </div>
          <div className={styles.note}>Tip: use the eye controls inside each editor to preview the exact card before publishing.</div>
        </article>
      </section>
    </div>
  );
}
