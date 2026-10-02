import { prisma } from './prisma';

export const DEFAULT_SERVICES = [
  {
    name: 'Manucure',
    description: 'Manucure classique avec soin des cuticules, limage et mise en forme des ongles.',
    fullDescription: 'La manucure classique chez Nails Sugar est un soin complet dédié à la santé et à l\'élégance naturelle de vos mains. Elle comprend un diagnostic personnalisé de l\'ongle, le retrait des peaux mortes, un limage précis selon la forme souhaitée, le soin des cuticules à l\'huile nourrissante et un massage relaxant.',
    category: 'Manucure & Soins',
    price: null,
    priceOnDemand: true,
    duration: 45,
    image: '/images/services/manucure.png',
    included: 'Diagnostic personnalisé, Limage et mise en forme, Soin et repoussage des cuticules, Polissage naturel brillant, Massage hydratant des mains',
    benefits: 'Mains douces et ongles parfaitement dessinés, Renforcement de la repousse naturelle, Soin hygiénique et minutieux, Idéal pour un look propre et professionnel',
    beforeAdvice: 'Arriver avec les ongles propres démaquillés si possible, Éviter les crèmes très grasses 1h avant le rendez-vous',
    aftercare: 'Appliquer de l\'huile cuticule tous les soirs, Hydrater quotidiennement les mains',
    idealFor: 'Un entretien régulier des ongles, Hommes et femmes recherchant un soin net, Première expérience en institut',
    expectedResult: 'Des ongles parfaitement dessinés, lisses et brillants avec des cuticules idéales et des mains douces.',
    sortOrder: 1,
  },
  {
    name: 'Pose de gel',
    description: 'Pose complète de gel pour des ongles résistants et un rendu naturel ou glamour.',
    fullDescription: 'La pose de gel est la prestation phare pour obtenir des ongles longs, résistants et parfaitement sculptés. Que vous souhaitiez un effet naturel Nude ou un style plus affirmé, le gel offre une tenue longue durée à toute épreuve avec une brillance miroir.',
    category: 'Onglerie & Gel',
    price: null,
    priceOnDemand: true,
    duration: 90,
    image: '/images/services/pose-de-gel.png',
    included: 'Préparation complète de l\'ongle, Pose de gel haute résistance, Limage et façonnage de la forme idéale, Application de la couleur ou finition Nude, Finition Glossy longue tenue',
    benefits: 'Tenue impeccable pendant 3 à 4 semaines, Protection contre la casse des ongles naturels, Brillance et bombé parfait, Résistance au quotidien',
    beforeAdvice: 'Signaler toute allergie ou sensibilité préalable, Ne pas couper ou limer excessivement vos ongles avant la séance',
    aftercare: 'Éviter d\'utiliser vos ongles comme outils, Ne jamais arracher le gel soi-même, Hydrater les cuticules',
    idealFor: 'Ongles fragiles ou cassants, Événements importants et mariages, Personnes souhaitant des ongles impeccables 1 mois',
    expectedResult: 'Une manucure bombée, ultra-résistante avec une brillance effet miroir sans aucun écaillement.',
    sortOrder: 2,
  },
  {
    name: 'Vernis semi-permanent',
    description: 'Application de vernis semi-permanent longue tenue avec un fini brillant impeccable.',
    fullDescription: 'Le vernis semi-permanent combine la simplicité d\'un vernis classique et la tenue prolongée du gel. Séché sous lampe LED, il sèche instantanément et garantit des ongles colorés et éclatants sans ternir.',
    category: 'Vernis & Gel',
    price: null,
    priceOnDemand: true,
    duration: 60,
    image: '/images/services/vernis-semi-permanent.png',
    included: 'Manucure express préparatoire, Dégraissage de l\'ongle naturel, Application de la Base Coat protector, 2 couches de couleur haute pigmentation, Top Coat Glossy et séchage LED',
    benefits: 'Séchage instantané sous lampe LED, Tenue parfaite sans écaille pendant 2 à 3 semaines, Couleur vibrante et couvrante, Respect du lit de l\'ongle',
    beforeAdvice: 'Venir les mains propres, Choisir votre teinte parmi notre nuancier élégant à l\'arrivée',
    aftercare: 'Porter des gants pour le ménage avec produits chimiques, Ne pas gratter le vernis',
    idealFor: 'Usage quotidien actif, Départs en vacances et week-ends, Celles qui aiment changer régulièrement de couleur',
    expectedResult: 'Une couleur intense, séchée immédiatement, sans bavure ni rayure pendant plusieurs semaines.',
    sortOrder: 3,
  },
  {
    name: 'Nail art',
    description: 'Designs personnalisés et créatifs pour des ongles uniques à votre image.',
    fullDescription: 'Exprimez votre style avec notre service de Nail Art personnalisé. Motifs géométriques, French moderne, paillettes, effets marbre, feuilles d\'or ou incrustations : chaque ongle devient une véritable œuvre d\'art.',
    category: 'Créations & Art',
    price: null,
    priceOnDemand: true,
    duration: 75,
    image: '/images/services/nail-art.png',
    included: 'Consultation créative et choix du design, Réalisation artisanale au pinceau fin, Incrustations ou effets spéciaux (Feuille d\'or, Strass, Paillettes), Vernis de scellage protecteur',
    benefits: 'Design sur-mesure et unique, Finition artistique haute précision, Adapté à toutes les longueurs d\'ongles, Effet Waooh garanti',
    beforeAdvice: 'Apporter vos photos d\'inspiration ou tableaux Pinterest, Définir le style souhaité à l\'avance',
    aftercare: 'Protéger les ongles des chocs directs, Hydrater régulièrement les mains',
    idealFor: 'Mariages, anniversaires et événements spéciaux, Amoureuses de tendances et de mode, Personnalisation unique',
    expectedResult: 'Un design créatif et minutieux correspondant exactement à vos inspirations avec des lignes nettes.',
    sortOrder: 4,
  },
  {
    name: 'Extensions',
    description: 'Extensions d\'ongles pour une longueur et une forme parfaites selon vos envies.',
    fullDescription: 'Sublimez vos mains avec des extensions d\'ongles sur chablon ou capsules pour ajouter de la longueur et modifier la forme selon vos envies (Amande, Coffin, Carré, Stiletto).',
    category: 'Onglerie & Gel',
    price: null,
    priceOnDemand: true,
    duration: 120,
    image: '/images/services/extensions.png',
    included: 'Diagnostic de la plaque de l\'ongle, Rallongement sur chablon ou capsule, Sculpture du gel de construction, Mise en forme sur mesure, Finition couleur ou Nude',
    benefits: 'Gagnez immédiatement la longueur souhaitée, Correction des ongles rongés ou déformés, Structure solide et élégante, Grand choix de formes',
    beforeAdvice: 'Prévoir une durée de rdv suffisante (2h), Venir sans produit sur les ongles',
    aftercare: 'Prendre rdv pour le remplissage au bout de 3 à 4 semaines, Ne pas forcer sur la longueur',
    idealFor: 'Personnes aux ongles courts ou rongés, Celles qui recherchent des mains sophistiquées et allongées',
    expectedResult: 'Des ongles longs, symétriques et naturellement intégrés à la forme de vos doigts.',
    sortOrder: 5,
  },
  {
    name: 'Dépose',
    description: 'Dépose soigneuse du gel, acrylique ou semi-permanent sans abîmer l\'ongle naturel.',
    fullDescription: 'Une dépose professionnelle en douceur du gel, résine ou semi-permanent afin de préserver l\'intégrité et la santé de l\'ongle naturel. Elle se termine par un soin fortifiant et nourrissant.',
    category: 'Soins & Entretien',
    price: null,
    priceOnDemand: true,
    duration: 30,
    image: '/images/services/depose.png',
    included: 'Limage doux et retrait sans douleur, Bain dissolvant doux pour semi-permanent, Polissage de la plaque naturelle, Application d\'un sérum fortifiant Kératine, Huile cuticule',
    benefits: 'Préserve la kératine de l\'ongle naturel, Zéro douleur ni ponçage agressif, Soin reconstituant immédiat, Ongles sains et préparés pour le repos',
    beforeAdvice: 'Ne tentez jamais de décoller le produit avec les dents ou un objet rigide',
    aftercare: 'Appliquer le sérum fortifiant pendant 7 jours après la dépose',
    idealFor: 'Pause entre deux poses de gel, Retour aux ongles naturels en toute sécurité',
    expectedResult: 'Des ongles naturels intacts, non affinés, lisses et réhydratés.',
    sortOrder: 6,
  },
  {
    name: 'Soin des mains',
    description: 'Soin hydratant et nourrissant pour des mains douces et des cuticules soignées.',
    fullDescription: 'Un véritable rituel spa pour réparer les mains desséchées et fatiguées. Ce soin combine gommage aux cristaux, masque réparateur chaud et massage relaxant pour retrouver douceur et réconfort.',
    category: 'Manucure & Soins',
    price: null,
    priceOnDemand: true,
    duration: 40,
    image: '/images/services/soin-des-mains.png',
    included: 'Bain apaisant tiède, Gommage exfoliant doux aux huiles précieuses, Masque hydratant intense sous serviette chaude, Massage relaxant des mains et avant-bras, Soin des cuticules',
    benefits: 'Hydratation profonde de la peau, Atténuation des tiraillements et de la sécheresse, Moment de relaxation ultime, Peau douce et veloutée',
    beforeAdvice: 'Mentionner si vous avez des coupures ou sensibilités cutanées',
    aftercare: 'Renouveler l\'application de crème hydratante avant le coucher',
    idealFor: 'Mains sèches ou abîmées par le froid, Idée cadeau bien-être, Complément après manucure',
    expectedResult: 'Une peau repulpée, infiniment douce avec une sensation de détente et de confort.',
    sortOrder: 7,
  },
  {
    name: 'Soin des pieds',
    description: 'Pédicure complète avec gommage, hydratation et soin des ongles de pieds.',
    fullDescription: 'Offrez à vos pieds une beauté complète et une relaxation totale. Notre pédicure spa élimine les callosités, sublime les ongles de pieds et détend les tensions grâce à un gommage et un massage sous eau hydro-massante.',
    category: 'Pédicure & Spa',
    price: null,
    priceOnDemand: true,
    duration: 50,
    image: '/images/services/soin-des-pieds.png',
    included: 'Bain de pieds relaxant aux sels de mer, Élimination douce des callosités, Limage et soin des ongles de pieds et cuticules, Exfoliation gommente, Massage enveloppant hydratant',
    benefits: 'Pieds doux et lisses sans rugosités, Sensation de légèreté immédiate, Ongles de pieds parfaitement nettoyés et façonnés, Relaxation profonde',
    beforeAdvice: 'Porter des chaussures confortables ou ouvertes pour repartir sereinement',
    aftercare: 'Hydrater les talons tous les soirs avec une crème pieds nourrissante',
    idealFor: 'Saison estivale et sandales, Personnes piétinant souvent, Moment de détente absolue',
    expectedResult: 'Des pieds doux, délassés, sans callosités et des ongles de pieds irréprochables.',
    sortOrder: 8,
  },
];

export async function ensureServicesSeeded() {
  const count = await prisma.service.count();
  if (count === 0) {
    for (const service of DEFAULT_SERVICES) {
      await prisma.service.create({ data: service });
    }
  }
}

export async function ensureAvailabilitySeeded() {
  const count = await prisma.availability.count();
  if (count === 0) {
    const days = [
      { dayOfWeek: 0, isOpen: false, openTime: null, closeTime: null },
      { dayOfWeek: 1, isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 6, isOpen: false, openTime: null, closeTime: null },
    ];

    for (const day of days) {
      const avail = await prisma.availability.create({ data: day });
      if (day.isOpen) {
        await prisma.break.create({
          data: {
            availabilityId: avail.id,
            startTime: '13:00',
            endTime: '14:00',
          },
        });
      }
    }
  }
}
