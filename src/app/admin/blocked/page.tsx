'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string | null;
}

export default function BlockedPage() {
  const [dates, setDates] = useState<BlockedDate[]>([]);
  const [slots, setSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'date' | 'slot' | null>(null);
  const [form, setForm] = useState({ date: '', startTime: '', endTime: '', reason: '' });

  const load = () => {
    setLoading(true);
    fetch('/api/blocked')
      .then(r => r.json())
      .then(d => {
        setDates(d.blockedDates || []);
        setSlots(d.blockedTimeSlots || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.date) return;
    await fetch('/api/blocked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: modalType,
        date: form.date,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        reason: form.reason || undefined,
      }),
    });
    setModalType(null);
    setForm({ date: '', startTime: '', endTime: '', reason: '' });
    load();
  };

  const handleDelete = async (id: string, type: 'date' | 'slot') => {
    if (!confirm('Supprimer cette entrée ?')) return;
    await fetch(`/api/blocked?id=${id}&type=${type}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="admin__header">
        <div>
          <h1>Dates bloquées</h1>
          <p>Bloquez des jours complets ou des créneaux horaires spécifiques.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button className="btn btn--primary" onClick={() => { setModalType('date'); setForm({ date: '', startTime: '', endTime: '', reason: '' }); }}>
            <Plus size={16} /> Bloquer un jour
          </button>
          <button className="btn btn--secondary" onClick={() => { setModalType('slot'); setForm({ date: '', startTime: '', endTime: '', reason: '' }); }}>
            <Plus size={16} /> Bloquer un créneau
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="loading__spinner" /></div>
      ) : (
        <>
          {/* Blocked dates */}
          <div className="data-card">
            <div className="data-card__header">
              <span className="data-card__title">Jours bloqués</span>
            </div>
            {dates.length === 0 ? (
              <div className="empty-state"><p>Aucun jour bloqué.</p></div>
            ) : (
              <div style={{ padding: 'var(--space-md)' }}>
                <div className="blocked-list">
                  {dates.map(d => (
                    <div className="blocked-item" key={d.id}>
                      <div className="blocked-item__info">
                        <span className="blocked-item__date">{formatDateShort(d.date)}</span>
                        {d.reason && <span className="blocked-item__reason">— {d.reason}</span>}
                      </div>
                      <button className="blocked-item__delete" onClick={() => handleDelete(d.id, 'date')} aria-label="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Blocked time slots */}
          <div className="data-card">
            <div className="data-card__header">
              <span className="data-card__title">Créneaux bloqués</span>
            </div>
            {slots.length === 0 ? (
              <div className="empty-state"><p>Aucun créneau bloqué.</p></div>
            ) : (
              <div style={{ padding: 'var(--space-md)' }}>
                <div className="blocked-list">
                  {slots.map(s => (
                    <div className="blocked-item" key={s.id}>
                      <div className="blocked-item__info">
                        <span className="blocked-item__date">{formatDateShort(s.date)}</span>
                        <span className="blocked-item__reason">{s.startTime} → {s.endTime}</span>
                        {s.reason && <span className="blocked-item__reason">— {s.reason}</span>}
                      </div>
                      <button className="blocked-item__delete" onClick={() => handleDelete(s.id, 'slot')} aria-label="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add modal */}
      {modalType && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <span className="modal__title">
                {modalType === 'date' ? 'Bloquer un jour' : 'Bloquer un créneau'}
              </span>
              <button className="modal__close" onClick={() => setModalType(null)}><X size={18} /></button>
            </div>
            <div className="modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div className="form__group">
                  <label className="form__label">Date *</label>
                  <input type="date" className="form__input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                {modalType === 'slot' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="form__group">
                      <label className="form__label">Début *</label>
                      <input type="time" className="form__input" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
                    </div>
                    <div className="form__group">
                      <label className="form__label">Fin *</label>
                      <input type="time" className="form__input" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
                    </div>
                  </div>
                )}
                <div className="form__group">
                  <label className="form__label">Raison <span className="form__label--optional">(optionnel)</span></label>
                  <input className="form__input" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Ex: Vacances, formation..." />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={() => setModalType(null)}>Annuler</button>
              <button className="btn btn--primary" onClick={handleAdd}>Bloquer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
