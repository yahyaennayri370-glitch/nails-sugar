'use client';

import { useEffect, useState } from 'react';
import { Plus, X, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { formatPrice, formatDuration } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description: string;
  fullDescription?: string | null;
  category?: string | null;
  price: number | null;
  priceOnDemand: boolean;
  duration: number;
  image: string | null;
  included?: string | null;
  benefits?: string | null;
  beforeAdvice?: string | null;
  aftercare?: string | null;
  idealFor?: string | null;
  expectedResult?: string | null;
  active: boolean;
  sortOrder: number;
}

const emptyService = {
  name: '',
  description: '',
  fullDescription: '',
  category: 'Manucure & Soins',
  price: '',
  priceOnDemand: true,
  duration: '60',
  image: '/images/services/manucure.png',
  included: '',
  benefits: '',
  beforeAdvice: '',
  aftercare: '',
  idealFor: '',
  expectedResult: '',
  active: true,
  sortOrder: 0,
};

const serviceImageOptions = [
  { label: 'Manucure', path: '/images/services/manucure.png' },
  { label: 'Pose de gel', path: '/images/services/pose-de-gel.png' },
  { label: 'Vernis semi-permanent', path: '/images/services/vernis-semi-permanent.png' },
  { label: 'Nail art', path: '/images/services/nail-art.png' },
  { label: 'Extensions', path: '/images/services/extensions.png' },
  { label: 'Dépose', path: '/images/services/depose.png' },
  { label: 'Soin des mains', path: '/images/services/soin-des-mains.png' },
  { label: 'Soin des pieds', path: '/images/services/soin-des-pieds.png' },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyService);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/services')
      .then(r => r.json())
      .then(d => { setServices(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyService);
    setModalOpen(true);
  };

  const openEdit = (svc: Service) => {
    setEditing(svc);
    setForm({
      name: svc.name,
      description: svc.description,
      fullDescription: svc.fullDescription || '',
      category: svc.category || 'Manucure & Soins',
      price: svc.price?.toString() || '',
      priceOnDemand: svc.priceOnDemand,
      duration: svc.duration.toString(),
      image: svc.image || '/images/services/manucure.png',
      included: svc.included || '',
      benefits: svc.benefits || '',
      beforeAdvice: svc.beforeAdvice || '',
      aftercare: svc.aftercare || '',
      idealFor: svc.idealFor || '',
      expectedResult: svc.expectedResult || '',
      active: svc.active,
      sortOrder: svc.sortOrder,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.duration) return;
    setSaving(true);

    const body = {
      ...(editing && { id: editing.id }),
      name: form.name,
      description: form.description,
      fullDescription: form.fullDescription || null,
      category: form.category || null,
      price: form.priceOnDemand ? null : (parseFloat(form.price) || 0),
      priceOnDemand: form.priceOnDemand,
      duration: parseInt(form.duration, 10) || 30,
      image: form.image || null,
      included: form.included || null,
      benefits: form.benefits || null,
      beforeAdvice: form.beforeAdvice || null,
      aftercare: form.aftercare || null,
      idealFor: form.idealFor || null,
      expectedResult: form.expectedResult || null,
      active: form.active,
      sortOrder: form.sortOrder,
    };

    await fetch('/api/services', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setModalOpen(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette prestation ?')) return;
    await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
    load();
  };

  const toggleActive = async (svc: Service) => {
    await fetch('/api/services', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: svc.id, active: !svc.active }),
    });
    load();
  };

  const getImageSrc = (img: string | null) => {
    if (!img) return '/images/services/manucure.png';
    return img.startsWith('/') ? img : `/${img}`;
  };

  return (
    <div>
      <div className="admin__header">
        <div>
          <h1>Prestations</h1>
          <p>Gérez vos services, détails complets et visuels.</p>
        </div>
        <button className="btn btn--primary" onClick={openCreate}>
          <Plus size={16} /> Ajouter une prestation
        </button>
      </div>

      <div className="data-card">
        {loading ? (
          <div className="loading"><div className="loading__spinner" /></div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <p>Aucune prestation créée.</p>
            <button className="btn btn--primary btn--sm" onClick={openCreate} style={{ marginTop: 'var(--space-md)' }}>
              Créer une prestation
            </button>
          </div>
        ) : (
          <div className="data-table__responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Visuel</th>
                  <th>Prestation</th>
                  <th>Catégorie</th>
                  <th>Durée</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(svc => (
                  <tr key={svc.id} style={{ opacity: svc.active ? 1 : 0.5 }}>
                    <td style={{ width: '80px' }}>
                      <div className="admin-service-thumb">
                        <img src={getImageSrc(svc.image)} alt={svc.name} />
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-brown)', fontSize: '0.9375rem' }}>{svc.name}</strong>
                      <br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-charcoal-light)' }}>
                        {svc.description.length > 60 ? `${svc.description.substring(0, 60)}...` : svc.description}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--color-cream)', color: 'var(--color-brown)' }}>
                        {svc.category || 'Général'}
                      </span>
                    </td>
                    <td>{formatDuration(svc.duration)}</td>
                    <td>{formatPrice(svc.price, svc.priceOnDemand)}</td>
                    <td>
                      <label className="toggle">
                        <input type="checkbox" checked={svc.active} onChange={() => toggleActive(svc)} />
                        <span className="toggle__slider" />
                      </label>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn--sm btn--ghost" onClick={() => openEdit(svc)} aria-label="Modifier">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn--sm btn--ghost" onClick={() => handleDelete(svc.id)} aria-label="Supprimer" style={{ color: 'var(--color-error)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal__header">
              <span className="modal__title">{editing ? 'Modifier la prestation' : 'Nouvelle prestation'}</span>
              <button className="modal__close" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal__body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                {/* Image Preview & Selector */}
                <div className="form__group">
                  <label className="form__label">Image de la prestation</label>
                  <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                    <div className="admin-service-preview">
                      <img src={getImageSrc(form.image)} alt="Aperçu" />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                      <select
                        className="form__input"
                        value={form.image}
                        onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                      >
                        {serviceImageOptions.map(opt => (
                          <option key={opt.path} value={opt.path}>{opt.label} ({opt.path})</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        className="form__input"
                        placeholder="Ou saisissez l'URL d'une image..."
                        value={form.image}
                        onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form__group">
                    <label className="form__label">Nom de la prestation *</label>
                    <input className="form__input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Pose de gel" />
                  </div>
                  <div className="form__group">
                    <label className="form__label">Catégorie</label>
                    <input className="form__input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Ex: Onglerie & Gel" />
                  </div>
                </div>

                <div className="form__group">
                  <label className="form__label">Description courte *</label>
                  <input className="form__input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description résumée..." />
                </div>

                <div className="form__group">
                  <label className="form__label">Description complète</label>
                  <textarea className="form__textarea" rows={3} value={form.fullDescription} onChange={e => setForm(p => ({ ...p, fullDescription: e.target.value }))} placeholder="Description détaillée du rituel..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form__group">
                    <label className="form__label">Durée (minutes) *</label>
                    <input className="form__input" type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                  </div>
                  <div className="form__group">
                    <label className="form__label">Prix (MAD)</label>
                    <input
                      className="form__input"
                      type="number"
                      value={form.price}
                      onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                      disabled={form.priceOnDemand}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <label className="toggle">
                    <input type="checkbox" checked={form.priceOnDemand} onChange={e => setForm(p => ({ ...p, priceOnDemand: e.target.checked }))} />
                    <span className="toggle__slider" />
                  </label>
                  <span style={{ fontSize: '0.875rem' }}>Prix sur demande</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(212, 181, 160, 0.2)', margin: 'var(--space-xs) 0' }} />

                <div className="form__group">
                  <label className="form__label">Ce qui est inclus (séparés par des virgules)</label>
                  <textarea className="form__textarea" rows={2} value={form.included} onChange={e => setForm(p => ({ ...p, included: e.target.value }))} placeholder="Ex: Limage, Soin cuticules, Polissage brillant" />
                </div>

                <div className="form__group">
                  <label className="form__label">Pourquoi choisir ce service ? (bénéfices séparés par des virgules)</label>
                  <textarea className="form__textarea" rows={2} value={form.benefits} onChange={e => setForm(p => ({ ...p, benefits: e.target.value }))} placeholder="Ex: Mains douces, Tenue longue durée, Brillance miroir" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form__group">
                    <label className="form__label">Avant votre rdv</label>
                    <textarea className="form__textarea" rows={2} value={form.beforeAdvice} onChange={e => setForm(p => ({ ...p, beforeAdvice: e.target.value }))} placeholder="Conseils préalables..." />
                  </div>
                  <div className="form__group">
                    <label className="form__label">Conseils après le service</label>
                    <textarea className="form__textarea" rows={2} value={form.aftercare} onChange={e => setForm(p => ({ ...p, aftercare: e.target.value }))} placeholder="Soins post-prestation..." />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form__group">
                    <label className="form__label">Ce service est idéal pour (séparés par des virgules)</label>
                    <input className="form__input" value={form.idealFor} onChange={e => setForm(p => ({ ...p, idealFor: e.target.value }))} placeholder="Ex: Entretien régulier, Mariages" />
                  </div>
                  <div className="form__group">
                    <label className="form__label">Résultat attendu</label>
                    <input className="form__input" value={form.expectedResult} onChange={e => setForm(p => ({ ...p, expectedResult: e.target.value }))} placeholder="Ex: Un rendu propre et naturel" />
                  </div>
                </div>

              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={() => setModalOpen(false)}>Annuler</button>
              <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement...' : (editing ? 'Enregistrer' : 'Créer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
