'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Star } from 'lucide-react';

interface GImage {
  id: string;
  filename: string;
  alt: string | null;
  featured: boolean;
  sortOrder: number;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/gallery')
      .then(r => r.json())
      .then(d => { setImages(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const getImageSrc = (filename: string) => {
    if (filename.startsWith('http')) return filename;
    if (filename.startsWith('/')) return filename;
    if (filename.startsWith('uploads/')) return `/${filename}`;
    return `/images/${filename}`;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      formData.append('alt', files[i].name.replace(/\.[^/.]+$/, ''));

      await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette image ?')) return;
    await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
    load();
  };

  const toggleFeatured = async (id: string) => {
    await fetch('/api/gallery', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, featured: true }),
    });
    load();
  };

  return (
    <div>
      <div className="admin__header">
        <div>
          <h1>Galerie</h1>
          <p>Gérez les images de votre galerie.</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Plus size={16} /> {uploading ? 'Upload...' : 'Ajouter'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
      </div>

      {loading ? (
        <div className="loading"><div className="loading__spinner" /></div>
      ) : images.length === 0 ? (
        <div className="empty-state">
          <p>Aucune image dans la galerie.</p>
          <button className="btn btn--primary btn--sm" onClick={() => fileRef.current?.click()} style={{ marginTop: 'var(--space-md)' }}>
            Ajouter des images
          </button>
        </div>
      ) : (
        <div className="gallery-admin__grid">
          {images.map(img => (
            <div className="gallery-admin__item" key={img.id}>
              <img src={getImageSrc(img.filename)} alt={img.alt || ''} loading="lazy" />
              {img.featured && (
                <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--color-champagne)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-brown)' }}>
                  Mise en avant
                </div>
              )}
              <div className="gallery-admin__actions">
                <button
                  className="gallery-admin__action-btn"
                  onClick={() => toggleFeatured(img.id)}
                  title="Mettre en avant"
                >
                  <Star size={14} />
                </button>
                <button
                  className="gallery-admin__action-btn gallery-admin__action-btn--delete"
                  onClick={() => handleDelete(img.id)}
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Upload button */}
          <button className="gallery-admin__upload" onClick={() => fileRef.current?.click()}>
            <Plus size={24} />
            <span>Ajouter</span>
          </button>
        </div>
      )}
    </div>
  );
}
