'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin, Clock, Phone, Mail, Instagram, ChevronDown, ChevronLeft, ChevronRight,
  X, Check, Calendar, ArrowRight, MessageCircle, Send, Sparkles, Heart,
  ChevronUp, ArrowUpRight
} from 'lucide-react';
import { formatPrice, formatDuration, formatDate, STATUS_LABELS } from '@/lib/utils';
import { DEFAULT_SERVICES, DEFAULT_SLOTS } from '@/lib/seed-utils';

/* ============================================================
   TYPES
   ============================================================ */
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
}

interface GalleryImage {
  id: string;
  filename: string;
  alt: string | null;
  featured: boolean;
  sortOrder: number;
}

interface Settings {
  businessName?: string;
  phone?: string;
  instagram?: string;
  instagramUrl?: string;
  tiktok?: string;
  location?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  aboutText?: string;
  aboutText2?: string;
}

/* ============================================================
   SCROLL REVEAL HOOK
   ============================================================ */
function useScrollReveal(loaded: boolean) {
  useEffect(() => {
    if (!loaded) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    const observeAll = () => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach(el => io.observe(el));
    };

    // Observe existing elements after a frame
    requestAnimationFrame(() => {
      observeAll();
    });

    // Watch for dynamically added .reveal elements
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [loaded]);
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loaded, setLoaded] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);

  useScrollReveal(loaded);

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.json()).catch(() => []),
      fetch('/api/gallery').then(r => r.json()).catch(() => []),
      fetch('/api/settings').then(r => r.json()).catch(() => ({})),
    ]).then(([svc, gal, set]) => {
      if (Array.isArray(svc) && svc.length > 0) {
        setServices(svc);
      } else {
        setServices(DEFAULT_SERVICES as unknown as Service[]);
      }
      if (Array.isArray(gal)) setGallery(gal);
      if (set && typeof set === 'object') setSettings(set);
      setLoaded(true);
    }).catch(() => {
      setServices(DEFAULT_SERVICES as unknown as Service[]);
      setLoaded(true);
    });
  }, []);

  // Dismiss intro after animation
  useEffect(() => {
    const timer = setTimeout(() => setIntroVisible(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return (
      <>
        {introVisible && <IntroAnimation />}
        <div className="loading" style={{ minHeight: '100vh' }}>
          <div className="loading__spinner" />
        </div>
      </>
    );
  }

  return (
    <>
      {introVisible && <IntroAnimation />}
      <Header settings={settings} />
      <MobileBar />
      <HeroSection settings={settings} />
      <AboutSection settings={settings} />
      <ServicesSection services={services} />
      <GallerySection gallery={gallery} settings={settings} />
      <BookingSection services={services} />
      <ContactSection settings={settings} />
      <Footer settings={settings} />
      <BackToTop />
      <WhatsAppFloat phone={settings.phone || '0638230962'} />
    </>
  );
}

/* ============================================================
   INTRO ANIMATION
   ============================================================ */
function IntroAnimation() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Deterministic positions for particles to avoid hydration mismatch
  const particles = [
    { left: '15%', top: '20%', delay: '0.2s', dur: '2.5s' },
    { left: '75%', top: '15%', delay: '0.8s', dur: '3s' },
    { left: '40%', top: '60%', delay: '1.2s', dur: '2.8s' },
    { left: '85%', top: '45%', delay: '0.5s', dur: '3.2s' },
    { left: '25%', top: '75%', delay: '1.5s', dur: '2.6s' },
    { left: '55%', top: '30%', delay: '0.3s', dur: '3.5s' },
    { left: '65%', top: '70%', delay: '1s', dur: '2.4s' },
    { left: '35%', top: '85%', delay: '0.7s', dur: '3.1s' },
    { left: '90%', top: '25%', delay: '1.8s', dur: '2.7s' },
    { left: '10%', top: '50%', delay: '0.4s', dur: '3.3s' },
    { left: '50%', top: '10%', delay: '1.3s', dur: '2.9s' },
    { left: '70%', top: '90%', delay: '0.6s', dur: '3.4s' },
  ];

  return (
    <div className={`intro-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className="intro-particles">
        {particles.map((p, i) => (
          <div
            key={i}
            className="intro-particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}
      </div>
      <div className="intro-logo">
        Nails Sugar
      </div>
      <div className="intro-tagline">
        Nail Salon &amp; Beauty
      </div>
    </div>
  );
}

/* ============================================================
   HEADER
   ============================================================ */
function Header({ settings }: { settings: Settings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('accueil');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = ['accueil', 'apropos', 'prestations', 'galerie', 'reservation', 'contact'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && window.scrollY >= el.offsetTop - 200) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { href: '#accueil', label: 'Accueil' },
    { href: '#prestations', label: 'Prestations' },
    { href: '#galerie', label: 'Galerie' },
    { href: '#apropos', label: 'À propos' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <nav className="nav container" role="navigation" aria-label="Navigation principale">
        <a href="#accueil" className="nav__logo">
          {settings.businessName || 'Nails Sugar'}
        </a>

        <div className={`nav__menu ${menuOpen ? 'active' : ''}`}>
          <button className="nav__close" onClick={closeMenu} aria-label="Fermer le menu">
            <X size={20} />
          </button>
          <ul className="nav__list">
            {navLinks.map(link => (
              <li className="nav__item" key={link.href}>
                <a
                  href={link.href}
                  className={`nav__link ${activeSection === link.href.slice(1) ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#reservation" className="btn btn--primary nav__cta-mobile" onClick={closeMenu}>
            Réserver maintenant
          </a>
        </div>

        <div className="nav__actions">
          <a href="#reservation" className="btn btn--primary header__cta">
            Réserver maintenant
          </a>
          <button
            className="nav__toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
          >
            <span className="hamburger" />
            <span className="hamburger" />
            <span className="hamburger" />
          </button>
        </div>
      </nav>
      {menuOpen && <div className="nav__overlay active" onClick={closeMenu} />}
    </header>
  );
}

/* ============================================================
   MOBILE BAR
   ============================================================ */
function MobileBar() {
  return (
    <div className="mobile-bar">
      <a href="#reservation" className="mobile-bar__btn">
        <Calendar size={18} />
        <span>Réserver</span>
      </a>
    </div>
  );
}

/* ============================================================
   HERO
   ============================================================ */
function HeroSection({ settings }: { settings: Settings }) {
  return (
    <section className="hero" id="accueil">
      <div className="hero__bg">
        <img
          src="/images/hero.png"
          alt="Nail art élégant chez Nails Sugar, Rabat"
          className="hero__bg-img"
        />
        <div className="hero__overlay" />
      </div>
      <div className="hero__container container">
        <div className="hero__content">
          <div className="hero__location">
            <MapPin size={14} />
            CYM – Rabat
          </div>
          <h1 className="hero__title">
            {settings.heroTitle || 'Révélez la beauté de vos ongles.'}
          </h1>
          <p className="hero__subtitle">
            {settings.heroSubtitle || 'Manucure, nail art et soins des ongles dans un espace élégant à Rabat.'}
          </p>
          <div className="hero__buttons">
            <a href="#reservation" className="btn btn--primary-dark btn--lg">
              <Calendar size={18} />
              Réserver un rendez-vous
            </a>
            <a href="#prestations" className="btn btn--ghost-light btn--lg">
              Découvrir nos prestations
            </a>
          </div>
        </div>
      </div>
      <a href="#apropos" className="hero__scroll" aria-label="Défiler vers le bas" style={{
        position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        fontSize: '0.7rem', color: 'rgba(233, 208, 190, 0.5)', letterSpacing: '0.15em',
        textTransform: 'uppercase', textDecoration: 'none',
        animation: 'heroFadeUp 0.8s ease 1.5s forwards', opacity: 0
      }}>
        <span>Défiler</span>
        <ChevronDown size={16} />
      </a>
    </section>
  );
}

/* ============================================================
   ABOUT
   ============================================================ */
function AboutSection({ settings }: { settings: Settings }) {
  return (
    <section className="about section" id="apropos">
      <div className="container">
        <div className="about__grid">
          <div className="about__visual reveal">
            <div className="about__image-wrap">
              <img
                src="/images/about.png"
                alt="Espace élégant Nails Sugar - salon à Rabat"
                className="about__img"
                loading="lazy"
              />
            </div>
          </div>
          <div className="about__content">
            <span className="section__tag reveal">À propos</span>
            <h2 className="section__title about__title reveal reveal-delay-1">
              Votre beauté, jusque dans les moindres détails.
            </h2>
            <p className="about__text reveal reveal-delay-2">
              {settings.aboutText || 'Nails Sugar est un espace dédié à la beauté des mains et des ongles, où chaque rendez-vous est pensé pour vous offrir un moment de soin, de détente et de confiance.'}
            </p>
            <p className="about__text reveal reveal-delay-3">
              {settings.aboutText2 || "Make-up artist & esthéticienne expérimentée, je propose des services d'onglerie et nail art personnalisés, du lundi au vendredi de 10h à 20h à CYM, Rabat."}
            </p>
            <div className="about__advantages reveal reveal-delay-3">
              <div className="about__advantage">
                <span className="about__advantage-icon">
                  <Sparkles size={22} />
                </span>
                <div>
                  <strong>Travail soigné</strong>
                  <span>Chaque détail compte</span>
                </div>
              </div>
              <div className="about__advantage">
                <span className="about__advantage-icon">
                  <Heart size={22} />
                </span>
                <div>
                  <strong>Nail art personnalisé</strong>
                  <span>Designs à votre image</span>
                </div>
              </div>
              <div className="about__advantage">
                <span className="about__advantage-icon">
                  <Clock size={22} />
                </span>
                <div>
                  <strong>Moment de détente</strong>
                  <span>Un espace rien que pour vous</span>
                </div>
              </div>
            </div>
            <div className="about__hours reveal reveal-delay-4">
              <Clock size={16} />
              <span>Lundi – Vendredi &nbsp;·&nbsp; 10h00 – 20h00</span>
            </div>
            <div className="reveal reveal-delay-5">
              <a href="#reservation" className="btn btn--primary">
                Prendre rendez-vous
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SERVICES
   ============================================================ */
function ServicesSection({ services }: { services: Service[] }) {
  const [selectedDetail, setSelectedDetail] = useState<Service | null>(null);

  const getImageSrc = (img: string | null) => {
    if (!img) return '/images/services/manucure.png';
    return img.startsWith('/') ? img : `/${img}`;
  };

  return (
    <section className="section" id="prestations" style={{ background: 'var(--color-cream)' }}>
      <div className="container">
        <div className="section__header reveal">
          <span className="section__tag">Prestations</span>
          <h2 className="section__title">Nos services</h2>
          <p className="section__subtitle">
            Découvrez notre gamme de services pour sublimer vos ongles avec des visuels professionnels.
          </p>
        </div>
        {services.length === 0 ? (
          <div className="empty-state">
            <p>Les prestations seront bientôt disponibles.</p>
          </div>
        ) : (
          <div className="services__grid">
            {services.map((service, i) => (
              <div className={`service-card reveal reveal-delay-${Math.min(i + 1, 5)}`} key={service.id}>
                <div
                  className="service-card__image"
                  onClick={() => setSelectedDetail(service)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={getImageSrc(service.image)} alt={service.name} loading="lazy" />
                  <div className="service-card__overlay">
                    <span className="btn btn--ghost-light btn--sm">
                      Voir les détails
                    </span>
                  </div>
                </div>
                <div className="service-card__body">
                  <h3 className="service-card__name" onClick={() => setSelectedDetail(service)} style={{ cursor: 'pointer' }}>
                    {service.name}
                  </h3>
                  <p className="service-card__desc">{service.description}</p>
                  <div className="service-card__meta">
                    <span className="service-card__price">
                      {formatPrice(service.price, service.priceOnDemand)}
                    </span>
                    <span className="service-card__duration">
                      <Clock size={13} />
                      {formatDuration(service.duration)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn--outline btn--sm"
                      style={{ flex: 1 }}
                      onClick={() => setSelectedDetail(service)}
                    >
                      Détails
                    </button>
                    <a
                      href="#reservation"
                      className="btn btn--primary btn--sm"
                      style={{ flex: 1, textAlign: 'center' }}
                    >
                      Réserver
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Details Modal */}
      {selectedDetail && (
        <div className="modal-overlay" onClick={() => setSelectedDetail(null)} style={{ zIndex: 1100 }}>
          <div
            className="modal service-detail-modal"
            onClick={e => e.stopPropagation()}
            style={{
              overflowY: 'auto',
              maxHeight: '90vh',
              padding: 0,
              maxWidth: '680px',
              borderRadius: 'var(--radius-2xl)'
            }}
          >
            {/* Modal Image Header */}
            <div className="service-detail-modal__image">
              <img src={getImageSrc(selectedDetail.image)} alt={selectedDetail.name} />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(36, 19, 14, 0.75) 0%, transparent 60%)'
              }} />
              <button
                className="modal__close"
                onClick={() => setSelectedDetail(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '20px',
                right: '20px',
                color: 'white'
              }}>
                {selectedDetail.category && (
                  <span style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    background: 'rgba(185, 130, 104, 0.4)',
                    backdropFilter: 'blur(4px)',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontWeight: 600,
                    marginBottom: '6px',
                    display: 'inline-block'
                  }}>
                    {selectedDetail.category}
                  </span>
                )}
                <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', margin: 0, color: 'white', lineHeight: 1.2 }}>
                  {selectedDetail.name}
                </h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="modal__body" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
              
              {/* Meta Quick Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-md) var(--space-lg)',
                background: 'var(--color-cream)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(233, 208, 190, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} style={{ color: 'var(--color-rose-gold)' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', textTransform: 'uppercase' }}>Durée</span>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.9375rem' }}>{formatDuration(selectedDetail.duration)}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', textTransform: 'uppercase' }}>Tarif</span>
                  <strong style={{ color: 'var(--color-text-primary)', fontSize: '1.125rem' }}>
                    {formatPrice(selectedDetail.price, selectedDetail.priceOnDemand)}
                  </strong>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <h4 className="detail-section-title">Description de la prestation</h4>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9375rem' }}>
                  {selectedDetail.fullDescription || selectedDetail.description}
                </p>
              </div>

              {/* Ce qui est inclus */}
              {selectedDetail.included && (
                <div>
                  <h4 className="detail-section-title">Ce qui est inclus</h4>
                  <ul className="detail-check-list">
                    {selectedDetail.included.split(',').map((item, idx) => (
                      <li key={idx}>
                        <span className="check-icon"><Check size={14} /></span>
                        <span>{item.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pourquoi choisir ce service ? */}
              {selectedDetail.benefits && (
                <div>
                  <h4 className="detail-section-title">Pourquoi choisir ce service ?</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
                    {selectedDetail.benefits.split(',').map((benefit, idx) => (
                      <div key={idx} className="detail-benefit-card">
                        <span className="benefit-sparkle">✦</span>
                        <span>{benefit.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ce service est idéal pour */}
              {selectedDetail.idealFor && (
                <div>
                  <h4 className="detail-section-title">Ce service est idéal pour</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                    {selectedDetail.idealFor.split(',').map((tag, idx) => (
                      <span key={idx} className="ideal-tag">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Résultat attendu */}
              {selectedDetail.expectedResult && (
                <div className="expected-result-box">
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-rose-gold)', display: 'block', marginBottom: '4px' }}>
                    Résultat attendu
                  </span>
                  <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text-primary)', fontSize: '0.9375rem' }}>
                    &laquo; {selectedDetail.expectedResult} &raquo;
                  </p>
                </div>
              )}

              {/* Avant / Après Advice */}
              {(selectedDetail.beforeAdvice || selectedDetail.aftercare) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-lg)' }}>
                  {selectedDetail.beforeAdvice && (
                    <div className="advice-block">
                      <h5>Avant votre rendez-vous</h5>
                      <p>{selectedDetail.beforeAdvice}</p>
                    </div>
                  )}
                  {selectedDetail.aftercare && (
                    <div className="advice-block">
                      <h5>Conseils après le service</h5>
                      <p>{selectedDetail.aftercare}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Booking CTA Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 'var(--space-lg)',
                borderTop: '1px solid rgba(233, 208, 190, 0.2)',
                flexWrap: 'wrap',
                gap: 'var(--space-md)'
              }}>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'block' }}>Prêt(e) pour votre soin ?</span>
                  <strong style={{ color: 'var(--color-text-primary)', fontSize: '1.25rem' }}>
                    {formatPrice(selectedDetail.price, selectedDetail.priceOnDemand)}
                  </strong>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                  <button className="btn btn--ghost" onClick={() => setSelectedDetail(null)}>
                    Fermer
                  </button>
                  <a
                    href="#reservation"
                    className="btn btn--primary"
                    onClick={() => setSelectedDetail(null)}
                  >
                    <Calendar size={16} />
                    Réserver ce service
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   GALLERY
   ============================================================ */
function GallerySection({ gallery, settings }: { gallery: GalleryImage[]; settings: Settings }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const navigateLightbox = (dir: number) => {
    setLightboxIndex((prev) => (prev + dir + gallery.length) % gallery.length);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, gallery.length]);

  const getImageSrc = (filename: string) => {
    if (filename.startsWith('http')) return filename;
    if (filename.startsWith('/')) return filename;
    return `/images/${filename}`;
  };

  if (gallery.length === 0) return null;

  return (
    <section className="section" id="galerie">
      <div className="container">
        <div className="section__header reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <span className="section__tag">Notre univers</span>
            <h2 className="section__title" style={{ marginBottom: 0 }}>Gallery</h2>
          </div>
          <a
            href={settings.instagramUrl || 'https://www.instagram.com/nails_sugar_nd/'}
            target="_blank"
            rel="noopener noreferrer"
            className="gallery__link"
          >
            Voir plus sur Instagram <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="gallery__grid reveal">
          {gallery.map((img, index) => (
            <div
              className="gallery__item"
              key={img.id}
              onClick={() => openLightbox(index)}
              role="button"
              tabIndex={0}
              aria-label={img.alt || `Photo de galerie ${index + 1}`}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
            >
              <img
                src={getImageSrc(img.filename)}
                alt={img.alt || 'Nail art Nails Sugar'}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <div className={`lightbox ${lightboxOpen ? 'active' : ''}`} onClick={closeLightbox}>
        <button className="lightbox__close" onClick={closeLightbox} aria-label="Fermer">
          <X size={24} />
        </button>
        <button
          className="lightbox__prev"
          onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
          aria-label="Image précédente"
        >
          <ChevronLeft size={24} />
        </button>
        {gallery[lightboxIndex] && (
          <img
            className="lightbox__img"
            src={getImageSrc(gallery[lightboxIndex].filename)}
            alt={gallery[lightboxIndex].alt || ''}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <button
          className="lightbox__next"
          onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
          aria-label="Image suivante"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   BOOKING SECTION
   ============================================================ */
function BookingSection({ services }: { services: Service[] }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsClosed, setSlotsClosed] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', instagram: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState<Record<string, string> | null>(null);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const totalSteps = 5;

  const stepLabels = ['Service', 'Date', 'Heure', 'Informations', 'Confirmation'];

  // Load slots when date + service change
  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    setSlotsLoading(true);
    setSlots([]);
    setSlotsClosed(false);
    const svcId = selectedService.id || selectedService.name;
    fetch(`/api/availability?date=${selectedDate}&serviceId=${encodeURIComponent(svcId)}`)
      .then(r => r.json())
      .then(data => {
        if (data.slots && Array.isArray(data.slots) && data.slots.length > 0) {
          setSlots(data.slots);
        } else {
          setSlots(DEFAULT_SLOTS);
        }
        setSlotsClosed(false);
        setSlotsLoading(false);
      })
      .catch(() => {
        setSlots(DEFAULT_SLOTS);
        setSlotsClosed(false);
        setSlotsLoading(false);
      });
  }, [selectedDate, selectedService]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Le nom est requis';
    if (!formData.phone.trim()) errs.phone = 'Le téléphone est requis';
    else if (!/^[0-9+\s-]{8,}$/.test(formData.phone.trim())) errs.phone = 'Numéro invalide';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Email invalide';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService!.id,
          date: selectedDate,
          startTime: selectedTime,
          customerName: formData.name,
          customerPhone: formData.phone,
          customerEmail: formData.email || undefined,
          customerInstagram: formData.instagram || undefined,
          notes: formData.notes || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setSuccessData({
          service: selectedService!.name,
          date: formatDate(selectedDate),
          time: selectedTime,
          name: formData.name,
          phone: formData.phone,
        });
      } else {
        setErrors({ submit: data.error || 'Une erreur est survenue' });
      }
    } catch {
      setErrors({ submit: 'Erreur de connexion' });
    }
    setSubmitting(false);
  };

  const reset = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setFormData({ name: '', phone: '', email: '', instagram: '', notes: '' });
    setErrors({});
    setSuccess(false);
    setSuccessData(null);
  };

  if (success && successData) {
    const phone = '0638230962';
    const whatsappNumber = phone.replace(/^0/, '212');
    const whatsappMsg = encodeURIComponent(`Bonjour Nails Sugar, j'ai réservé un rendez-vous pour ${successData.service} le ${successData.date} à ${successData.time}. 💅`);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

    return (
      <section className="booking section" id="reservation">
        <div className="container">
          <div className="booking__container">
            <div className="booking__success">
              <div className="booking__success-icon">
                <Check size={32} />
              </div>
              <h3>Votre rendez-vous a été enregistré !</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)', fontSize: '0.9375rem' }}>
                Merci pour votre confiance. Nous avons hâte de vous accueillir chez Nails Sugar.
              </p>
              <div className="booking__summary">
                <div className="booking__summary-row">
                  <span className="booking__summary-label">Service</span>
                  <span className="booking__summary-value">{successData.service}</span>
                </div>
                <div className="booking__summary-row">
                  <span className="booking__summary-label">Date</span>
                  <span className="booking__summary-value">{successData.date}</span>
                </div>
                <div className="booking__summary-row">
                  <span className="booking__summary-label">Heure</span>
                  <span className="booking__summary-value">{successData.time}</span>
                </div>
                <div className="booking__summary-row">
                  <span className="booking__summary-label">Nom</span>
                  <span className="booking__summary-value">{successData.name}</span>
                </div>
                <div className="booking__summary-row">
                  <span className="booking__summary-label">Téléphone</span>
                  <span className="booking__summary-value">{successData.phone}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-xl)', flexWrap: 'wrap' }}>
                <button onClick={reset} className="btn btn--primary">
                  Voir mes rendez-vous
                </button>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-btn" style={{ marginTop: 0 }}>
                  <MessageCircle size={18} />
                  Contacter sur WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="booking section" id="reservation">
      {/* Dark intro panel */}
      <div className="booking__intro reveal">
        <div className="container" style={{ maxWidth: '600px' }}>
          <span className="section__tag" style={{ color: 'var(--color-rose-gold)' }}>Réservation</span>
          <h2 className="section__title" style={{ color: 'var(--color-white)' }}>
            Prenez rendez-vous<br />en quelques clics.
          </h2>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--space-2xl)' }}>
        <div className="booking__container">
          {/* Step indicators with labels */}
          <div className="booking__steps" style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: 'var(--space-2xl)', alignItems: 'center' }}>
            {stepLabels.map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <div
                    className={`booking__step-dot ${i + 1 === step ? 'active' : ''} ${i + 1 < step ? 'completed' : ''}`}
                  />
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: i + 1 === step ? 600 : 400,
                    color: i + 1 === step ? 'var(--color-rose-gold)' : 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div style={{
                    width: '30px',
                    height: '1px',
                    background: i + 1 < step ? 'var(--color-rose-gold)' : 'var(--color-champagne)',
                    opacity: i + 1 < step ? 0.8 : 0.3,
                    marginBottom: '16px',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Choose service */}
          <div className={`booking-step ${step === 1 ? 'active' : ''}`}>
            <h3 style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>Choisissez votre prestation</h3>
            <div className="booking__service-list">
              {services.map(service => {
                const isSelected = !!selectedService && (
                  (!!selectedService.id && !!service.id && selectedService.id === service.id) ||
                  (!selectedService.id && selectedService.name === service.name)
                );

                return (
                  <div
                    key={service.id || service.name}
                    className={`booking__service-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedService(service)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedService(service)}
                  >
                    <div className="booking__service-option-info">
                      <div className="booking__service-option-name">{service.name}</div>
                      <div className="booking__service-option-meta">
                        {formatDuration(service.duration)} · {formatPrice(service.price, service.priceOnDemand)}
                      </div>
                    </div>
                    <div className="booking__service-option-check">
                      {isSelected && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="booking__nav">
              <button
                className="btn btn--primary btn--block"
                disabled={!selectedService}
                onClick={() => setStep(2)}
              >
                Continuer
              </button>
            </div>
          </div>

          {/* Step 2: Choose date */}
          <div className={`booking-step ${step === 2 ? 'active' : ''}`}>
            <h3 style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>Choisissez une date</h3>
            <BookingCalendar
              selectedDate={selectedDate}
              onSelectDate={(d) => { setSelectedDate(d); setSelectedTime(''); }}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthChange={(m, y) => { setCurrentMonth(m); setCurrentYear(y); }}
            />
            <div className="booking__nav">
              <button className="btn btn--ghost" onClick={() => setStep(1)}>Retour</button>
              <button className="btn btn--primary" disabled={!selectedDate} onClick={() => setStep(3)}>
                Continuer
              </button>
            </div>
          </div>

          {/* Step 3: Choose time */}
          <div className={`booking-step ${step === 3 ? 'active' : ''}`}>
            <h3 style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>Choisissez une heure</h3>
            {slotsLoading ? (
              <div className="loading"><div className="loading__spinner" /></div>
            ) : slotsClosed ? (
              <div className="booking__no-slots">
                Le salon est fermé ce jour. Veuillez choisir une autre date.
              </div>
            ) : slots.length === 0 ? (
              <div className="booking__no-slots">
                Aucun créneau disponible pour cette date. Veuillez choisir une autre date.
              </div>
            ) : (
              <div className="booking__time-slots">
                {slots.map(slot => (
                  <button
                    key={slot}
                    className={`booking__time-slot ${selectedTime === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
            <div className="booking__nav">
              <button className="btn btn--ghost" onClick={() => setStep(2)}>Retour</button>
              <button className="btn btn--primary" disabled={!selectedTime} onClick={() => setStep(4)}>
                Continuer
              </button>
            </div>
          </div>

          {/* Step 4: Customer info */}
          <div className={`booking-step ${step === 4 ? 'active' : ''}`}>
            <h3 style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>Vos informations</h3>
            <div className="booking__form">
              <div className="form__group">
                <label className="form__label" htmlFor="booking-name">Nom complet *</label>
                <input
                  id="booking-name"
                  className="form__input"
                  type="text"
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                />
                {errors.name && <span className="form__error">{errors.name}</span>}
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="booking-phone">Téléphone *</label>
                <input
                  id="booking-phone"
                  className="form__input"
                  type="tel"
                  placeholder="06 XX XX XX XX"
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                />
                {errors.phone && <span className="form__error">{errors.phone}</span>}
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="booking-email">
                  Email <span className="form__label--optional">(optionnel)</span>
                </label>
                <input
                  id="booking-email"
                  className="form__input"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                />
                {errors.email && <span className="form__error">{errors.email}</span>}
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="booking-instagram">
                  Instagram <span className="form__label--optional">(optionnel)</span>
                </label>
                <input
                  id="booking-instagram"
                  className="form__input"
                  type="text"
                  placeholder="@votre_compte"
                  value={formData.instagram}
                  onChange={e => setFormData(p => ({ ...p, instagram: e.target.value }))}
                />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="booking-notes">
                  Notes <span className="form__label--optional">(optionnel)</span>
                </label>
                <textarea
                  id="booking-notes"
                  className="form__textarea"
                  placeholder="Précisions ou demandes spéciales..."
                  value={formData.notes}
                  onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="booking__nav">
              <button className="btn btn--ghost" onClick={() => setStep(3)}>Retour</button>
              <button className="btn btn--primary" onClick={() => { if (validateForm()) setStep(5); }}>
                Vérifier
              </button>
            </div>
          </div>

          {/* Step 5: Review & confirm */}
          <div className={`booking-step ${step === 5 ? 'active' : ''}`}>
            <h3 style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>Confirmez votre rendez-vous</h3>
            <div className="booking__summary">
              <div className="booking__summary-row">
                <span className="booking__summary-label">Prestation</span>
                <span className="booking__summary-value">{selectedService?.name}</span>
              </div>
              <div className="booking__summary-row">
                <span className="booking__summary-label">Date</span>
                <span className="booking__summary-value">{selectedDate && formatDate(selectedDate)}</span>
              </div>
              <div className="booking__summary-row">
                <span className="booking__summary-label">Heure</span>
                <span className="booking__summary-value">{selectedTime}</span>
              </div>
              <div className="booking__summary-row">
                <span className="booking__summary-label">Durée</span>
                <span className="booking__summary-value">{selectedService && formatDuration(selectedService.duration)}</span>
              </div>
              <div className="booking__summary-row">
                <span className="booking__summary-label">Prix</span>
                <span className="booking__summary-value">{selectedService && formatPrice(selectedService.price, selectedService.priceOnDemand)}</span>
              </div>
              <div className="booking__summary-row">
                <span className="booking__summary-label">Nom</span>
                <span className="booking__summary-value">{formData.name}</span>
              </div>
              <div className="booking__summary-row">
                <span className="booking__summary-label">Téléphone</span>
                <span className="booking__summary-value">{formData.phone}</span>
              </div>
              {formData.notes && (
                <div className="booking__summary-row">
                  <span className="booking__summary-label">Notes</span>
                  <span className="booking__summary-value">{formData.notes}</span>
                </div>
              )}
            </div>
            {errors.submit && (
              <div style={{ color: 'var(--color-error)', textAlign: 'center', marginTop: 'var(--space-md)', fontSize: '0.875rem' }}>
                {errors.submit}
              </div>
            )}
            <div className="booking__nav">
              <button className="btn btn--ghost" onClick={() => setStep(4)}>Retour</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Confirmation...' : 'Confirmer le rendez-vous'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BOOKING CALENDAR
   ============================================================ */
function BookingCalendar({
  selectedDate, onSelectDate, currentMonth, currentYear, onMonthChange,
}: {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  currentMonth: number;
  currentYear: number;
  onMonthChange: (m: number, y: number) => void;
}) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday start

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    if (currentMonth === 0) onMonthChange(11, currentYear - 1);
    else onMonthChange(currentMonth - 1, currentYear);
  };

  const nextMonth = () => {
    if (currentMonth === 11) onMonthChange(0, currentYear + 1);
    else onMonthChange(currentMonth + 1, currentYear);
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="booking__calendar">
      <div className="calendar__header">
        <button className="calendar__nav-btn" onClick={prevMonth} aria-label="Mois précédent">
          <ChevronLeft size={18} />
        </button>
        <span className="calendar__title">{monthName}</span>
        <button className="calendar__nav-btn" onClick={nextMonth} aria-label="Mois suivant">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="calendar__weekdays">
        {weekdays.map(d => <div className="calendar__weekday" key={d}>{d}</div>)}
      </div>
      <div className="calendar__days">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="calendar__day other-month" />;

          const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const isPast = dateStr < todayStr;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              className={`calendar__day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isPast ? 'disabled' : ''}`}
              disabled={isPast}
              onClick={() => onSelectDate(dateStr)}
              aria-label={`${day} ${monthName}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   CONTACT
   ============================================================ */
function ContactSection({ settings }: { settings: Settings }) {
  const phone = settings.phone || '0638230962';
  const whatsappNumber = phone.replace(/^0/, '212');
  const whatsappMsg = encodeURIComponent('Bonjour Nails Sugar, je souhaite prendre un rendez-vous. 💅');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="section__header reveal">
          <span className="section__tag">Contact</span>
          <h2 className="section__title">Restons connectés</h2>
          <p className="section__subtitle">
            N&apos;hésitez pas à nous contacter pour toute question ou réservation.
          </p>
        </div>
        <div className="contact__grid">
          <div className="reveal">
            <div className="contact__item">
              <div className="contact__icon"><Phone size={20} /></div>
              <div>
                <div className="contact__item-title">Téléphone</div>
                <div className="contact__item-text">
                  <a href={`tel:${phone}`}>{phone}</a>
                </div>
              </div>
            </div>
            <div className="contact__item">
              <div className="contact__icon"><Instagram size={20} /></div>
              <div>
                <div className="contact__item-title">Instagram</div>
                <div className="contact__item-text">
                  <a href={settings.instagramUrl || 'https://www.instagram.com/nails_sugar_nd/'} target="_blank" rel="noopener noreferrer">
                    {settings.instagram || '@nails_sugar_nd'}
                  </a>
                </div>
              </div>
            </div>
            <div className="contact__item">
              <div className="contact__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </div>
              <div>
                <div className="contact__item-title">TikTok</div>
                <div className="contact__item-text">Nails Sugar</div>
              </div>
            </div>
            <div className="contact__item">
              <div className="contact__icon"><MapPin size={20} /></div>
              <div>
                <div className="contact__item-title">Adresse</div>
                <div className="contact__item-text">{settings.location || 'CYM, Rabat, Morocco'}</div>
              </div>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
              <MessageCircle size={20} />
              Contacter sur WhatsApp
            </a>
          </div>
          <div className="contact__map reveal reveal-delay-2">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13279.0!2d-6.83!3d33.97!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda76c8a0a3b91f3%3A0x0!2sCYM%20Rabat!5e0!3m2!1sfr!2sma!4v1"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation Nails Sugar"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__logo">{settings.businessName || 'Nails Sugar'}</div>
            <p className="footer__desc">
              Votre espace beauté dédié aux ongles à CYM, Rabat. Manucure, nail art et soins personnalisés.
            </p>
          </div>
          <div>
            <div className="footer__title">Navigation</div>
            <div className="footer__links">
              <a href="#accueil" className="footer__link">Accueil</a>
              <a href="#prestations" className="footer__link">Prestations</a>
              <a href="#galerie" className="footer__link">Galerie</a>
              <a href="#reservation" className="footer__link">Réserver</a>
              <a href="#contact" className="footer__link">Contact</a>
            </div>
          </div>
          <div>
            <div className="footer__title">Horaires</div>
            <div className="footer__links">
              <span className="footer__link">Lun – Ven : 10h – 20h</span>
              <span className="footer__link">Sam – Dim : Fermé</span>
            </div>
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <a href="#reservation" className="btn btn--primary-dark btn--sm">
                Réserver maintenant
              </a>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Nails Sugar. Tous droits réservés.</span>
          <div className="footer__social">
            <a href={settings.instagramUrl || 'https://www.instagram.com/nails_sugar_nd/'} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href="https://www.tiktok.com/@nailssugar" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   BACK TO TOP
   ============================================================ */
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      className={`back-to-top ${visible ? 'visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Retour en haut"
    >
      <ChevronUp size={20} />
    </button>
  );
}

/* ============================================================
   WHATSAPP FLOATING BUTTON
   ============================================================ */
function WhatsAppFloat({ phone }: { phone: string }) {
  const whatsappNumber = phone.replace(/^0/, '212');
  const msg = encodeURIComponent('Bonjour Nails Sugar, je souhaite prendre un rendez-vous. 💅');

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp"
      style={{
        position: 'fixed',
        bottom: '5rem',
        right: '1.5rem',
        zIndex: 80,
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: '0 4px 20px rgba(37, 211, 102, 0.35)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.08)';
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(37, 211, 102, 0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.35)';
      }}
    >
      <MessageCircle size={26} />
    </a>
  );
}
