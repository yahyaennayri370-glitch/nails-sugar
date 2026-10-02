'use client';

import { useEffect, useState } from 'react';
import { Phone, MessageCircle, Instagram } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  instagram: string | null;
  createdAt: string;
  _count: { appointments: number };
  appointments: Array<{ date: string; startTime: string }>;
}

interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  instagram: string | null;
  createdAt: string;
  appointments: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    service: { name: string };
  }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CustomerDetail | null>(null);

  const load = (q?: string) => {
    setLoading(true);
    const url = q ? `/api/customers?search=${encodeURIComponent(q)}` : '/api/customers';
    fetch(url)
      .then(r => r.json())
      .then(d => { setCustomers(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const loadDetail = async (id: string) => {
    const res = await fetch(`/api/customers?id=${id}`);
    const data = await res.json();
    setSelected(data);
  };

  const handleSearch = (v: string) => {
    setSearch(v);
    if (v.length >= 2) load(v);
    else if (v.length === 0) load();
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
  };

  return (
    <div>
      <div className="admin__header">
        <div>
          <h1>Clients</h1>
          <p>Consultez la liste de vos clients et leur historique.</p>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <input
          className="search-input"
          placeholder="Rechercher par nom, téléphone ou Instagram..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      <div className="data-card">
        {loading ? (
          <div className="loading"><div className="loading__spinner" /></div>
        ) : customers.length === 0 ? (
          <div className="empty-state"><p>Aucun client enregistré.</p></div>
        ) : (
          <div className="data-table__responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th>Instagram</th>
                  <th>RDV</th>
                  <th>Dernier RDV</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500, color: 'var(--color-brown)' }}>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.instagram || '—'}</td>
                    <td>{c._count.appointments}</td>
                    <td>
                      {c.appointments[0] ? formatDateShort(c.appointments[0].date) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn--sm btn--ghost" onClick={() => loadDetail(c.id)}>
                          Profil
                        </button>
                        <a href={`tel:${c.phone}`} className="btn btn--sm btn--ghost" title="Appeler">
                          <Phone size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal__header">
              <span className="modal__title">{selected.name}</span>
              <button className="modal__close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal__body">
              <div className="detail-grid" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="detail-item">
                  <div className="detail-label">Téléphone</div>
                  <div className="detail-value">{selected.phone}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{selected.email || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Instagram</div>
                  <div className="detail-value">{selected.instagram || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Client depuis</div>
                  <div className="detail-value">{formatDateShort(selected.createdAt.split('T')[0])}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
                <a href={`tel:${selected.phone}`} className="btn btn--sm btn--secondary"><Phone size={14} /> Appeler</a>
                <a
                  href={`https://wa.me/${selected.phone.replace(/^0/, '212')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn--sm btn--secondary"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
                {selected.instagram && (
                  <a href={`https://instagram.com/${selected.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="btn btn--sm btn--secondary">
                    <Instagram size={14} /> Instagram
                  </a>
                )}
              </div>

              <h4 style={{ marginBottom: 'var(--space-md)' }}>Historique des rendez-vous</h4>
              {selected.appointments.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-charcoal-light)' }}>Aucun rendez-vous.</p>
              ) : (
                <div className="data-table__responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Heure</th>
                        <th>Prestation</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.appointments.map(a => (
                        <tr key={a.id}>
                          <td>{formatDateShort(a.date)}</td>
                          <td>{a.startTime} – {a.endTime}</td>
                          <td>{a.service.name}</td>
                          <td>
                            <span className={`status-badge status-badge--${a.status}`}>
                              {STATUS_LABELS[a.status] || a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
