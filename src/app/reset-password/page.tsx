'use client';

import React from 'react';
import Link from 'next/link';
import styles from '../auth.module.css';
import { apiRequest } from '../../utils/apiClient';

export default function ResetPasswordPage() {
  const [form, setForm] = React.useState({ email: '', code: '', new_password: '' });
  const [message, setMessage] = React.useState(''); const [error, setError] = React.useState(''); const [busy, setBusy] = React.useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { const result = await apiRequest<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(form) }); setMessage(result.message); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to reset password'); } finally { setBusy(false); } };
  return <main className={styles.page}><section className={styles.card}><div className={styles.eyebrow}>Account recovery</div><h1 className={styles.title}>Choose a new password</h1><p className={styles.description}>Use the six-digit code from your email.</p><form className={styles.form} onSubmit={submit}><label className={styles.label}>Email<input className={styles.input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label><label className={styles.label}>Reset code<input className={styles.input} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, '') })} required /></label><label className={styles.label}>New password<input className={styles.input} type="password" minLength={8} value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} required autoComplete="new-password" /></label>{message && <div className={styles.success}>{message}</div>}{error && <div className={styles.error}>{error}</div>}<button className={styles.button} disabled={busy}>{busy ? 'Saving…' : 'Reset password'}</button></form><div className={styles.links}><Link className={styles.link} href="/login">Back to sign in</Link></div></section></main>;
}
