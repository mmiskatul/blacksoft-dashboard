'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { apiRequest, setAuthToken } from '../../utils/apiClient';

type Challenge = { challenge_id: string; expires_in: number; code?: string };
type Token = { access_token: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [challenge, setChallenge] = React.useState<Challenge | null>(null);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      if (!challenge) {
        const res = await apiRequest<Challenge>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        if (res.code) {
          const result = await apiRequest<Token>('/auth/verify-login', { method: 'POST', body: JSON.stringify({ challenge_id: res.challenge_id, code: res.code }) });
          setAuthToken(result.access_token);
          router.replace('/');
        } else {
          setChallenge(res);
        }
      } else {
        const result = await apiRequest<Token>('/auth/verify-login', { method: 'POST', body: JSON.stringify({ challenge_id: challenge.challenge_id, code }) });
        setAuthToken(result.access_token);
        router.replace('/');
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in'); }
    finally { setBusy(false); }
  };

  return <main className={styles.page}><section className={styles.card}>
    <div className={styles.eyebrow}>Blacksoft Hub</div>
    <h1 className={styles.title}>{challenge ? 'Verify your sign-in' : 'Sign in to the dashboard'}</h1>
    <p className={styles.description}>{challenge ? 'Enter the six-digit code sent to your email address.' : 'Authorized administrators only.'}</p>
    <form className={styles.form} onSubmit={submit}>
      {!challenge ? <><label className={styles.label}>Email<input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label><label className={styles.label}>Password<input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="current-password" /></label></> : <label className={styles.label}>Verification code<input className={styles.input} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required autoComplete="one-time-code" /></label>}
      {error && <div className={styles.error}>{error}</div>}
      <button className={styles.button} disabled={busy}>{busy ? 'Please wait…' : challenge ? 'Verify and continue' : 'Continue'}</button>
    </form>
    <div className={styles.links}><Link className={styles.link} href="/forgot-password">Forgot password?</Link>{challenge && <button className={styles.link} type="button" onClick={() => setChallenge(null)}>Start over</button>}</div>
  </section></main>;
}
