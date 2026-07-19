import { Coins, Layers3, MousePointerClick, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import basketImage from '../../../assets/basket.png'
import matchEmbedImage from '../../../assets/match embed.png'
import matchResultImage from '../../../assets/match result.png'
import myBetsImage from '../../../assets/mybets.png'

export type LandingFeature = {
  id: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  image: string
  alt: string
  icon: LucideIcon
  tone: 'blue' | 'coral' | 'gold' | 'green'
}

export const landingFeatures: LandingFeature[] = [
  {
    id: 'matches',
    eyebrow: 'Matchs en direct',
    title: 'Chaque match devient un rendez-vous collectif.',
    description:
      'Bet Bot publie un aperçu complet directement dans Discord : équipes et drapeaux, score, temps de jeu, événements et cotes. Les membres choisissent leur prédiction en un clic, sans quitter le salon.',
    bullets: ['Score et temps actualisés', 'Cotes claires', 'Boutons de prédiction rapides'],
    image: matchEmbedImage,
    alt: 'Aperçu Discord d’un match France Argentine avec score, événements et boutons de prédiction',
    icon: MousePointerClick,
    tone: 'blue',
  },
  {
    id: 'parlays',
    eyebrow: 'Combinés',
    title: 'Plusieurs intuitions. Un seul ticket.',
    description:
      'Les membres regroupent plusieurs sélections dans un combiné simple à relire. La cote totale se calcule automatiquement et le ticket reste clair jusqu’à la validation.',
    bullets: ['Sélections regroupées', 'Cote totale automatique', 'Parcours rapide et lisible'],
    image: basketImage,
    alt: 'Ticket combiné Discord regroupant trois prédictions sport et esport',
    icon: Layers3,
    tone: 'coral',
  },
  {
    id: 'results',
    eyebrow: 'Résultats et gains',
    title: 'Le coup de sifflet final lance les réactions.',
    description:
      'Dès la fin du match, le bot annonce le score, l’issue retenue, les gagnants et les perdants. Les gains et pertes en pièces fictives sont visibles immédiatement, tout comme le statut des combinés.',
    bullets: ['Résultat final annoncé', 'Gains en pièces détaillés', 'Suivi des combinés'],
    image: matchResultImage,
    alt: 'Annonce Discord du résultat France Argentine avec gagnants, perdants et gains en pièces',
    icon: Zap,
    tone: 'gold',
  },
  {
    id: 'active-bets',
    eyebrow: 'Prédictions actives',
    title: 'Tout ce qui est en jeu, toujours sous les yeux.',
    description:
      'Chacun retrouve ses prédictions et ses combinés en cours avec le choix effectué, la cote, la mise en pièces et le gain possible. Les boutons de navigation rendent le suivi fluide, même avec plusieurs tickets.',
    bullets: ['Simple ou combiné', 'Mise et gain possible', 'Navigation entre les tickets'],
    image: myBetsImage,
    alt: 'Vue Discord des prédictions actives et d’un combiné en cours',
    icon: Coins,
    tone: 'green',
  },
]
