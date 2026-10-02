import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found">
      <div>
        <h1>404</h1>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Cette page n&apos;existe pas</h2>
        <p>La page que vous cherchez a peut-être été déplacée ou n&apos;existe plus.</p>
        <Link href="/" className="btn btn--primary">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
