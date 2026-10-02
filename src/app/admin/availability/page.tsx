'use client';

import { useEffect, useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { DAY_NAMES } from '@/lib/utils';

interface BreakData {
  id?: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  id?: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  breaks: BreakData[];
}

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/availability')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSchedule(data.map((d: DaySchedule) => ({
            ...d,
            openTime: d.openTime || '09:00',
            closeTime: d.closeTime || '18:00',
            breaks: d.breaks || [],
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateDay = (dayOfWeek: number, updates: Partial<DaySchedule>) => {
    setSchedule(prev => prev.map(d =>
      d.dayOfWeek === dayOfWeek ? { ...d, ...updates } : d
    ));
    setSaved(false);
  };

  const addBreak = (dayOfWeek: number) => {
    setSchedule(prev => prev.map(d =>
      d.dayOfWeek === dayOfWeek
        ? { ...d, breaks: [...d.breaks, { startTime: '13:00', endTime: '14:00' }] }
        : d
    ));
    setSaved(false);
  };

  const removeBreak = (dayOfWeek: number, index: number) => {
    setSchedule(prev => prev.map(d =>
      d.dayOfWeek === dayOfWeek
        ? { ...d, breaks: d.breaks.filter((_, i) => i !== index) }
        : d
    ));
    setSaved(false);
  };

  const updateBreak = (dayOfWeek: number, index: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(prev => prev.map(d =>
      d.dayOfWeek === dayOfWeek
        ? { ...d, breaks: d.breaks.map((b, i) => i === index ? { ...b, [field]: value } : b) }
        : d
    ));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div className="loading"><div className="loading__spinner" /></div>;
  }

  return (
    <div>
      <div className="admin__header">
        <div>
          <h1>Horaires</h1>
          <p>Configurez les jours et heures d&apos;ouverture.</p>
        </div>
        <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? 'Enregistrement...' : saved ? 'Enregistré !' : 'Enregistrer'}
        </button>
      </div>

      <div className="schedule-grid">
        {schedule.map(day => (
          <div className="schedule-day" key={day.dayOfWeek}>
            <div className="schedule-day__header">
              <span className="schedule-day__name">{DAY_NAMES[day.dayOfWeek]}</span>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={e => updateDay(day.dayOfWeek, { isOpen: e.target.checked })}
                />
                <span className="toggle__slider" />
              </label>
            </div>
            {day.isOpen && (
              <>
                <div className="schedule-day__times">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-light)', width: '60px' }}>Ouverture</span>
                    <input
                      type="time"
                      className="schedule-day__time-input"
                      value={day.openTime || ''}
                      onChange={e => updateDay(day.dayOfWeek, { openTime: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-light)', width: '60px' }}>Fermeture</span>
                    <input
                      type="time"
                      className="schedule-day__time-input"
                      value={day.closeTime || ''}
                      onChange={e => updateDay(day.dayOfWeek, { closeTime: e.target.value })}
                    />
                  </div>
                </div>
                {/* Breaks */}
                <div style={{ marginTop: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-charcoal-light)' }}>Pauses</span>
                    <button className="btn btn--sm btn--ghost" onClick={() => addBreak(day.dayOfWeek)}>
                      <Plus size={14} /> Ajouter
                    </button>
                  </div>
                  {day.breaks.map((brk, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                      <input type="time" className="schedule-day__time-input" value={brk.startTime} onChange={e => updateBreak(day.dayOfWeek, i, 'startTime', e.target.value)} />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-light)' }}>→</span>
                      <input type="time" className="schedule-day__time-input" value={brk.endTime} onChange={e => updateBreak(day.dayOfWeek, i, 'endTime', e.target.value)} />
                      <button onClick={() => removeBreak(day.dayOfWeek, i)} style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
