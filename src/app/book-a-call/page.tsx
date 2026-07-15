'use client';

import React from 'react';
import {
  Booking,
  BookingStatus,
  deleteBooking,
  fetchBookings,
  updateBookingStatus,
} from '../../utils/bookingsStore';

const STATUS_META: Record<BookingStatus, { bg: string; color: string; border: string; label: string }> = {
  new:       { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: '🔵 New' },
  contacted: { bg: '#fefce8', color: '#b45309', border: '#fde68a', label: '🟡 Contacted' },
  closed:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: '🟢 Closed' },
};

function DetailRow({ icon, label, value }: { icon: string; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{value}</div>
      </div>
    </div>
  );
}

function BookingCard({
  booking, onStatusChange, onDelete, acting,
}: {
  booking: Booking;
  onStatusChange: (id: string, s: BookingStatus) => void;
  onDelete: (id: string) => void;
  acting: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const sm = STATUS_META[booking.status];

  const formatDt = (v: string | null) =>
    v ? new Date(v).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : null;

  return (
    <div style={{
      background: 'var(--bg-card-high)', border: '1px solid var(--border-card)',
      borderRadius: 16, overflow: 'hidden', opacity: acting ? 0.5 : 1,
      transition: 'opacity 0.2s, box-shadow 0.2s',
      boxShadow: expanded ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
    }}>

      {/* ── Card header ──────────────────────────────────────────── */}
      <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>

        {/* Avatar */}
        <div style={{
          width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#4f46e5,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 19, fontWeight: 800, color: '#fff',
        }}>
          {booking.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-white)' }}>{booking.name}</span>
            {booking.company && (
              <span style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.08)' }}>
                🏢 {booking.company}
              </span>
            )}
            {booking.country && (
              <span style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.08)' }}>
                🌍 {booking.country}
              </span>
            )}
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
              background: sm.bg, color: sm.color, border: `1px solid ${sm.border}`,
            }}>{sm.label}</span>
          </div>

          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
            {booking.email}
            {booking.phone && <span style={{ marginLeft: 12, color: '#475569' }}>📞 {booking.phone}</span>}
          </div>

          {/* Badge pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {booking.project_type && (
              <span style={{ fontSize: 11, color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '3px 10px', borderRadius: 9999, fontWeight: 600, border: '1px solid rgba(99,102,241,0.2)' }}>
                🛠 {booking.project_type}
              </span>
            )}
            {booking.budget_range && (
              <span style={{ fontSize: 11, color: '#34d399', background: 'rgba(52,211,153,0.08)', padding: '3px 10px', borderRadius: 9999, fontWeight: 600, border: '1px solid rgba(52,211,153,0.15)' }}>
                💰 {booking.budget_range}
              </span>
            )}
            {booking.timeline && (
              <span style={{ fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.08)', padding: '3px 10px', borderRadius: 9999, fontWeight: 600, border: '1px solid rgba(245,158,11,0.15)' }}>
                ⏱ {booking.timeline}
              </span>
            )}
            {booking.team_size && (
              <span style={{ fontSize: 11, color: '#e879f9', background: 'rgba(232,121,249,0.08)', padding: '3px 10px', borderRadius: 9999, fontWeight: 600, border: '1px solid rgba(232,121,249,0.15)' }}>
                👥 {booking.team_size}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
          <select value={booking.status} disabled={acting}
            onChange={e => onStatusChange(booking.id, e.target.value as BookingStatus)}
            style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: sm.bg, color: sm.color, border: `1px solid ${sm.border}`, cursor: 'pointer', outline: 'none' }}>
            <option value="new">🔵 New</option>
            <option value="contacted">🟡 Contacted</option>
            <option value="closed">🟢 Closed</option>
          </select>
          <button onClick={() => setExpanded(v => !v)} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: expanded ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
            color: expanded ? '#c3c0ff' : 'var(--text-muted)',
            border: `1px solid ${expanded ? 'rgba(99,102,241,0.3)' : 'var(--border-card)'}`, cursor: 'pointer',
          }}>{expanded ? '▲ Hide' : '▼ Full Details'}</button>
          <button onClick={() => onDelete(booking.id)} disabled={acting} style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: 'rgba(220,38,38,0.08)', color: '#f87171',
            border: '1px solid rgba(220,38,38,0.2)', cursor: acting ? 'not-allowed' : 'pointer',
          }}>Delete</button>
        </div>
      </div>

      {/* ── Expandable detail panel ──────────────────────────────── */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>

          {/* Section: Contact */}
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Contact Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <DetailRow icon="👤" label="Full Name" value={booking.name} />
              <DetailRow icon="📧" label="Email" value={booking.email} />
              <DetailRow icon="📞" label="Phone" value={booking.phone} />
              <DetailRow icon="🏢" label="Company" value={booking.company} />
              <DetailRow icon="🌍" label="Country" value={booking.country} />
            </div>
          </div>

          {/* Section: Project */}
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Project Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <DetailRow icon="🛠" label="Project Type" value={booking.project_type} />
              <DetailRow icon="💰" label="Budget Range" value={booking.budget_range} />
              <DetailRow icon="⏱" label="Timeline" value={booking.timeline} />
              <DetailRow icon="👥" label="Team Size" value={booking.team_size} />
              <DetailRow icon="🎨" label="Existing Designs" value={booking.has_design} />
              <DetailRow icon="⚙️" label="Tech Stack" value={booking.tech_stack} />
            </div>
          </div>

          {/* Section: Request */}
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Request Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <DetailRow icon="📅" label="Preferred Call Time" value={formatDt(booking.preferred_datetime)} />
              <DetailRow icon="📣" label="How They Found Us" value={booking.how_heard} />
            </div>
            {booking.message && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>📝 Project Description & Goals</div>
                <div style={{
                  fontSize: 13, color: '#cbd5e1', lineHeight: 1.8, padding: '14px 16px',
                  background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: 10, whiteSpace: 'pre-wrap',
                }}>{booking.message}</div>
              </div>
            )}
          </div>

          {/* Section: Meta */}
          <div style={{ padding: '12px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#475569' }}>
              📬 Submitted: <strong style={{ color: '#64748b' }}>{formatDt(booking.created_at)}</strong>
            </span>
            <span style={{ fontSize: 12, color: '#475569' }}>ID: <code style={{ color: '#334155', fontSize: 11 }}>{booking.id}</code></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [actionId, setActionId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<BookingStatus | 'all'>('all');

  const load = React.useCallback(async () => {
    setLoading(true); setError('');
    try { setBookings(await fetchBookings()); }
    catch { setError('Failed to load bookings.'); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  async function handleStatusChange(id: string, status: BookingStatus) {
    setActionId(id);
    try {
      const updated = await updateBookingStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
    } catch { alert('Failed to update status.'); }
    finally { setActionId(null); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this booking request?')) return;
    setActionId(id);
    try {
      await deleteBooking(id);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch { alert('Failed to delete booking.'); }
    finally { setActionId(null); }
  }

  const counts = React.useMemo(() => ({
    all: bookings.length,
    new: bookings.filter(b => b.status === 'new').length,
    contacted: bookings.filter(b => b.status === 'contacted').length,
    closed: bookings.filter(b => b.status === 'closed').length,
  }), [bookings]);

  const displayed = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-white)' }}>📞 Consultation Requests</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 14 }}>
            All booking requests submitted via the website's <em>Book a Free Consultation</em> page.
          </p>
        </div>
        <button onClick={load} style={{
          padding: '9px 18px', borderRadius: 9999, fontSize: 13, fontWeight: 600,
          background: 'var(--primary-container)', color: '#fff', border: 'none', cursor: 'pointer',
        }}>↻ Refresh</button>
      </div>

      {/* Stats filter tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {([
          { key: 'all',       label: 'Total',     color: '#6366f1', emoji: '📋' },
          { key: 'new',       label: 'New',       color: '#2563eb', emoji: '🔵' },
          { key: 'contacted', label: 'Contacted', color: '#b45309', emoji: '🟡' },
          { key: 'closed',    label: 'Closed',    color: '#15803d', emoji: '🟢' },
        ] as const).map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)} style={{
            background: filter === s.key ? 'rgba(99,102,241,0.12)' : 'var(--bg-card-high)',
            border: filter === s.key ? '1.5px solid #6366f1' : '1px solid var(--border-card)',
            borderRadius: 12, padding: '16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {s.emoji} {s.label}
            </p>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: '4px 0 0' }}>{counts[s.key]}</p>
          </button>
        ))}
      </div>

      {/* States */}
      {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading bookings…</div>}
      {!loading && error && <div style={{ textAlign: 'center', padding: '40px 0', color: '#f87171' }}>{error}</div>}
      {!loading && !error && displayed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p>{filter === 'all' ? 'No consultation requests yet.' : `No "${filter}" requests.`}</p>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && displayed.length > 0 && (
        <div style={{ display: 'grid', gap: 16 }}>
          {displayed.map(b => (
            <BookingCard key={b.id} booking={b}
              onStatusChange={handleStatusChange} onDelete={handleDelete} acting={actionId === b.id} />
          ))}
        </div>
      )}
    </div>
  );
}
