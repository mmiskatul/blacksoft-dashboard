'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { apiRequest, setAuthToken } from '../../utils/apiClient';

type Token = { access_token: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const result = await apiRequest<Token>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setAuthToken(result.access_token);
      router.replace('/');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in'); }
    finally { setBusy(false); }
  };

  return <main className={styles.page}><section className={styles.card}>
    <div className={styles.eyebrow}>Blacksoft Hub</div>
    <h1 className={styles.title}>Sign in to the dashboard</h1>
    <p className={styles.description}>Authorized administrators only.</p>
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.label}>Email<input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
      <label className={styles.label}>Password<input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="current-password" /></label>
      {error && <div className={styles.error}>{error}</div>}
      <button className={styles.button} disabled={busy}>{busy ? 'Please wait…' : 'Sign in'}</button>
    </form>
    <div className={styles.links}><Link className={styles.link} href="/forgot-password">Forgot password?</Link></div>
  </section></main>;
}
