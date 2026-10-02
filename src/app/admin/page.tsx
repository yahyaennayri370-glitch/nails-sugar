'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Users, Scissors, Clock, AlertCircle } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, formatDateShort } from '@/lib/utils';

interface DashboardData {
  todayAppointments: Array<{
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    customer: { name: string; phone: string };
    service: { name: string };
  }>;
  recentAppointments: Array<{
    id: string;
    date: string;
    startTime: string;
    status: string;
    customer: { name: string };
    service: { name: string };
  }>;
  todayCount: number;
  upcomingCount: number;
  pendingCount: number;
  totalCustomers: number;
  activeServices: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading"><div className="loading__spinner" /></div>;
  }

  if (!data) {
    return <div className="empty-state"><p>Erreur de chargement des données.</p></div>;
  }

  return (
    <div>
      <div className="admin__header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Bonjour ! Voici un résumé de vos activités.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats__grid">
        <div className="stat__card">
          <div className="stat__icon" style={{ background: 'rgba(212, 165, 116, 0.15)', color: '#b8860b' }}>
            <CalendarCheck size={22} />
          </div>
          <div>
            <span className="stat__number">{data.todayCount}</span>
            <span className="stat__label">Aujourd&apos;hui</span>
          </div>
        </div>
        <div className="stat__card">
          <div className="stat__icon" style={{ background: 'rgba(91, 140, 160, 0.15)', color: '#2e6b82' }}>
            <Clock size={22} />
          </div>
          <div>
            <span className="stat__number">{data.upcomingCount}</span>
            <span className="stat__label">À venir</span>
          </div>
        </div>
        <div className="stat__card">
          <div className="stat__icon" style={{ background: 'rgba(212, 165, 116, 0.15)', color: '#d4a574' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <span className="stat__number">{data.pendingCount}</span>
            <span className="stat__label">En attente</span>
          </div>
        </div>
        <div className="stat__card">
          <div className="stat__icon" style={{ background: 'rgba(123, 160, 91, 0.15)', color: '#4a7c28' }}>
            <Users size={22} />
          </div>
          <div>
            <span className="stat__number">{data.totalCustomers}</span>
            <span className="stat__label">Clients</span>
          </div>
        </div>
        <div className="stat__card">
          <div className="stat__icon" style={{ background: 'rgba(160, 91, 160, 0.15)', color: '#7c4a7c' }}>
            <Scissors size={22} />
          </div>
          <div>
            <span className="stat__number">{data.activeServices}</span>
            <span className="stat__label">Services actifs</span>
          </div>
        </div>
      </div>

      {/* Today's appointments */}
      <div className="data-card">
        <div className="data-card__header">
          <span className="data-card__title">Rendez-vous aujourd&apos;hui</span>
        </div>
        {data.todayAppointments.length === 0 ? (
          <div className="empty-state">
            <p>Aucun rendez-vous pour aujourd&apos;hui.</p>
          </div>
        ) : (
          <div className="data-table__responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>Client</th>
                  <th>Prestation</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.todayAppointments.map(appt => (
                  <tr key={appt.id}>
                    <td>{appt.startTime} – {appt.endTime}</td>
                    <td>{appt.customer.name}</td>
                    <td>{appt.service.name}</td>
                    <td>
                      <span className={`status-badge status-badge--${appt.status}`}>
                        {STATUS_LABELS[appt.status] || appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div className="data-card">
        <div className="data-card__header">
          <span className="data-card__title">Prochains rendez-vous</span>
          <a href="/admin/appointments" className="btn btn--sm btn--ghost">Voir tout</a>
        </div>
        {data.recentAppointments.length === 0 ? (
          <div className="empty-state">
            <p>Aucun rendez-vous à venir.</p>
          </div>
        ) : (
          <div className="data-table__responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Client</th>
                  <th>Prestation</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAppointments.map(appt => (
                  <tr key={appt.id}>
                    <td>{formatDateShort(appt.date)}</td>
                    <td>{appt.startTime}</td>
                    <td>{appt.customer.name}</td>
                    <td>{appt.service.name}</td>
                    <td>
                      <span className={`status-badge status-badge--${appt.status}`}>
                        {STATUS_LABELS[appt.status] || appt.status}
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
  );
}
