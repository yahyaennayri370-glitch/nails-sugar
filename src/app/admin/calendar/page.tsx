'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, formatDateShort } from '@/lib/utils';

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  customer: { name: string; phone: string };
  service: { name: string };
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    setLoading(true);
    // Fetch all appointments for the visible range
    const startDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`;
    const endDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const endDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${endDay}`;

    fetch(`/api/appointments?filter=all`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAppointments(data.filter((a: Appointment) => a.date >= startDate && a.date <= endDate));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentMonth, currentYear]);

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const todayStr = new Date().toISOString().split('T')[0];

  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const getApptsByDate = (day: number) => {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return appointments.filter(a => a.date === dateStr);
  };

  return (
    <div>
      <div className="admin__header">
        <div>
          <h1>Calendrier</h1>
          <p>Vue d&apos;ensemble de vos rendez-vous.</p>
        </div>
      </div>

      <div className="admin-calendar">
        <div className="admin-calendar__header">
          <button className="calendar__nav-btn" onClick={prevMonth} aria-label="Mois précédent">
            <ChevronLeft size={18} />
          </button>
          <span className="calendar__title" style={{ textTransform: 'capitalize' }}>{monthName}</span>
          <button className="calendar__nav-btn" onClick={nextMonth} aria-label="Mois suivant">
            <ChevronRight size={18} />
          </button>
        </div>

        {loading ? (
          <div className="loading"><div className="loading__spinner" /></div>
        ) : (
          <>
            {/* Weekday headers */}
            <div className="admin-calendar__grid" style={{ borderBottom: '1px solid rgba(212,181,160,0.1)' }}>
              {weekdays.map(d => (
                <div key={d} style={{ padding: 'var(--space-sm)', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-charcoal-light)', textTransform: 'uppercase' }}>
                  {d}
                </div>
              ))}
            </div>
            {/* Days */}
            <div className="admin-calendar__grid">
              {Array.from({ length: offset }, (_, i) => (
                <div key={`e-${i}`} className="admin-calendar__cell" style={{ background: 'rgba(245,240,235,0.3)' }} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const dayAppts = getApptsByDate(day);
                const isToday = dateStr === todayStr;

                return (
                  <div key={day} className="admin-calendar__cell">
                    <div className={`admin-calendar__cell-date ${isToday ? 'today' : ''}`}>
                      {day}
                    </div>
                    {dayAppts.slice(0, 3).map(a => (
                      <div
                        key={a.id}
                        className="admin-calendar__event"
                        style={{ background: `${STATUS_COLORS[a.status]}20`, color: STATUS_COLORS[a.status] }}
                        onClick={() => setSelectedAppt(a)}
                        title={`${a.startTime} - ${a.customer.name} - ${a.service.name}`}
                      >
                        {a.startTime} {a.customer.name}
                      </div>
                    ))}
                    {dayAppts.length > 3 && (
                      <div style={{ fontSize: '0.625rem', color: 'var(--color-charcoal-light)', paddingLeft: '6px' }}>
                        +{dayAppts.length - 3} autres
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Appointment detail modal */}
      {selectedAppt && (
        <div className="modal-overlay" onClick={() => setSelectedAppt(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <span className="modal__title">Rendez-vous</span>
              <button className="modal__close" onClick={() => setSelectedAppt(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Client</div>
                  <div className="detail-value">{selectedAppt.customer.name}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Téléphone</div>
                  <div className="detail-value">{selectedAppt.customer.phone}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Prestation</div>
                  <div className="detail-value">{selectedAppt.service.name}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Heure</div>
                  <div className="detail-value">{selectedAppt.startTime} – {selectedAppt.endTime}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Date</div>
                  <div className="detail-value">{formatDateShort(selectedAppt.date)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Statut</div>
                  <div className="detail-value">
                    <span className={`status-badge status-badge--${selectedAppt.status}`}>
                      {STATUS_LABELS[selectedAppt.status]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <a href="/admin/appointments" className="btn btn--sm btn--primary">
                Gérer les rendez-vous
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
