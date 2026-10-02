'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../admin.css';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Email ou mot de passe incorrect');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">Nails Sugar</div>
        <p className="login-subtitle">Espace administrateur</p>
        <form onSubmit={handleSubmit}>
          <div className="form__group">
            <label className="form__label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="form__input"
              type="email"
              placeholder="admin@nailssugar.ma"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="login-password">Mot de passe</label>
            <input
              id="login-password"
              className="form__input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {error && <span className="form__error">{error}</span>}
          </div>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <Link href="/" className="login-back">← Retour au site</Link>
      </div>
    </div>
  );
}
