'use client';

import React from 'react';
import Link from 'next/link';
import styles from '../auth.module.css';
import { apiRequest } from '../../utils/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { const result = await apiRequest<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }); setMessage(result.message); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to send reset code'); } finally { setBusy(false); } };
  return <main className={styles.page}><section className={styles.card}><div className={styles.eyebrow}>Account recovery</div><h1 className={styles.title}>Reset your password</h1><p className={styles.description}>We’ll send a one-time code to your administrator email.</p><form className={styles.form} onSubmit={submit}><label className={styles.label}>Email<input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>{message && <div className={styles.success}>{message}</div>}{error && <div className={styles.error}>{error}</div>}<button className={styles.button} disabled={busy}>{busy ? 'Sending…' : 'Send reset code'}</button></form><div className={styles.links}><Link className={styles.link} href="/login">Back to sign in</Link><Link className={styles.link} href="/reset-password">I have a code</Link></div></section></main>;
}
