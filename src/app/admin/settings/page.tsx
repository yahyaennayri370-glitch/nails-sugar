'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { setSettings(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div className="loading"><div className="loading__spinner" /></div>;
  }

  const fields = [
    { key: 'businessName', label: 'Nom du salon', type: 'text' },
    { key: 'phone', label: 'Téléphone', type: 'tel' },
    { key: 'instagram', label: 'Instagram', type: 'text' },
    { key: 'instagramUrl', label: 'Lien Instagram', type: 'url' },
    { key: 'tiktok', label: 'TikTok', type: 'text' },
    { key: 'location', label: 'Adresse', type: 'text' },
    { key: 'heroTitle', label: 'Titre hero', type: 'text' },
    { key: 'heroSubtitle', label: 'Sous-titre hero', type: 'text' },
    { key: 'aboutText', label: 'Texte à propos (paragraphe 1)', type: 'textarea' },
    { key: 'aboutText2', label: 'Texte à propos (paragraphe 2)', type: 'textarea' },
  ];

  return (
    <div>
      <div className="admin__header">
        <div>
          <h1>Paramètres</h1>
          <p>Configurez les informations de votre site web.</p>
        </div>
        <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? 'Enregistrement...' : saved ? 'Enregistré !' : 'Enregistrer'}
        </button>
      </div>

      <div className="data-card" style={{ padding: 'var(--space-xl)' }}>
        <div className="settings-form">
          {fields.map(field => (
            <div className="form__group" key={field.key}>
              <label className="form__label">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  className="form__textarea"
                  value={settings[field.key] || ''}
                  onChange={e => update(field.key, e.target.value)}
                />
              ) : (
                <input
                  className="form__input"
                  type={field.type}
                  value={settings[field.key] || ''}
                  onChange={e => update(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
