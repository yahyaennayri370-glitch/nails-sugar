'use client';

import { useEffect, useState } from 'react';
import { X, Phone, MessageCircle } from 'lucide-react';
import { STATUS_LABELS, formatDateShort, formatDuration } from '@/lib/utils';

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  createdAt: string;
  customer: { id: string; name: string; phone: string; email: string | null; instagram: string | null };
  service: { name: string; duration: number; price: number | null; priceOnDemand: boolean };
}

const FILTERS = [
  { key: 'upcoming', label: 'À venir' },
  { key: 'today', label: "Aujourd'hui" },
  { key: 'tomorrow', label: 'Demain' },
  { key: 'week', label: 'Cette semaine' },
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmés' },
  { key: 'completed', label: 'Terminés' },
  { key: 'cancelled', label: 'Annulés' },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const loadAppointments = (f: string) => {
    setLoading(true);
    fetch(`/api/appointments?filter=${f}`)
      .then(r => r.json())
      .then(data => { setAppointments(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadAppointments(filter); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/appointments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    loadAppointments(filter);
    setSelectedAppt(null);
  };

  const deleteAppt = async (id: string) => {
    if (!confirm('Supprimer ce rendez-vous ?')) return;
    await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
    loadAppointments(filter);
    setSelectedAppt(null);
  };

  const filtered = search
    ? appointments.filter(a =>
      a.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      a.customer.phone.includes(search) ||
      a.service.name.toLowerCase().includes(search.toLowerCase())
    )
    : appointments;

  return (
    <div>
      <div className="admin__header">
        <div>
          <h1>Rendez-vous</h1>
          <p>Gérez tous les rendez-vous de vos clients.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher par nom, téléphone ou service..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="data-card">
        {loading ? (
          <div className="loading"><div className="loading__spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>Aucun rendez-vous pour cette période.</p>
          </div>
        ) : (
          <div className="data-table__responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Client</th>
                  <th>Téléphone</th>
                  <th>Prestation</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(appt => (
                  <tr key={appt.id}>
                    <td>{formatDateShort(appt.date)}</td>
                    <td>{appt.startTime} – {appt.endTime}</td>
                    <td>{appt.customer.name}</td>
                    <td>{appt.customer.phone}</td>
                    <td>{appt.service.name}</td>
                    <td>
                      <span className={`status-badge status-badge--${appt.status}`}>
                        {STATUS_LABELS[appt.status] || appt.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn--sm btn--ghost" onClick={() => setSelectedAppt(appt)}>
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedAppt && (
        <div className="modal-overlay" onClick={() => setSelectedAppt(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <span className="modal__title">Détails du rendez-vous</span>
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
                  <div className="detail-value">
                    <a href={`tel:${selectedAppt.customer.phone}`}>{selectedAppt.customer.phone}</a>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Prestation</div>
                  <div className="detail-value">{selectedAppt.service.name}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Durée</div>
                  <div className="detail-value">{formatDuration(selectedAppt.service.duration)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Date</div>
                  <div className="detail-value">{formatDateShort(selectedAppt.date)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Heure</div>
                  <div className="detail-value">{selectedAppt.startTime} – {selectedAppt.endTime}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Statut</div>
                  <div className="detail-value">
                    <span className={`status-badge status-badge--${selectedAppt.status}`}>
                      {STATUS_LABELS[selectedAppt.status]}
                    </span>
                  </div>
                </div>
                {selectedAppt.customer.instagram && (
                  <div className="detail-item">
                    <div className="detail-label">Instagram</div>
                    <div className="detail-value">{selectedAppt.customer.instagram}</div>
                  </div>
                )}
              </div>
              {selectedAppt.notes && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                  <div className="detail-label">Notes</div>
                  <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>{selectedAppt.notes}</p>
                </div>
              )}

              {/* Quick contact */}
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                <a href={`tel:${selectedAppt.customer.phone}`} className="btn btn--sm btn--secondary">
                  <Phone size={14} /> Appeler
                </a>
                <a
                  href={`https://wa.me/${selectedAppt.customer.phone.replace(/^0/, '212')}?text=${encodeURIComponent(`Bonjour ${selectedAppt.customer.name}, concernant votre rendez-vous chez Nails Sugar...`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn--sm btn--secondary"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>
            </div>
            <div className="modal__footer">
              {selectedAppt.status === 'pending' && (
                <button className="btn btn--sm btn--primary" onClick={() => updateStatus(selectedAppt.id, 'confirmed')}>
                  Confirmer
                </button>
              )}
              {(selectedAppt.status === 'pending' || selectedAppt.status === 'confirmed') && (
                <button className="btn btn--sm btn--secondary" onClick={() => updateStatus(selectedAppt.id, 'completed')}>
                  Terminé
                </button>
              )}
              {selectedAppt.status !== 'cancelled' && (
                <button
                  className="btn btn--sm btn--ghost"
                  style={{ color: 'var(--color-warning)' }}
                  onClick={() => updateStatus(selectedAppt.id, 'cancelled')}
                >
                  Annuler
                </button>
              )}
              <button
                className="btn btn--sm btn--ghost"
                style={{ color: 'var(--color-error)' }}
                onClick={() => deleteAppt(selectedAppt.id)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
