import { BadgeDefinition } from './types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'newbie',
    name: 'Krow Rookie',
    min_hours: 0,
    icon_name: 'Sparkles',
    color: '#94A3B8',
    order_index: 1,
  },
  {
    id: 'bronze',
    name: 'Bronze Volunteer',
    min_hours: 10,
    icon_name: 'Award',
    color: '#D97706',
    order_index: 2,
  },
  {
    id: 'silver',
    name: 'Silver Volunteer',
    min_hours: 25,
    icon_name: 'Medal',
    color: '#64748B',
    order_index: 3,
  },
  {
    id: 'gold',
    name: 'Gold Community Pillar',
    min_hours: 50,
    icon_name: 'Crown',
    color: '#EAB308',
    order_index: 4,
  },
  {
    id: 'platinum',
    name: 'Platinum Champion',
    min_hours: 100,
    icon_name: 'Zap',
    color: '#8B5CF6',
    order_index: 5,
  },
  {
    id: 'diamond',
    name: 'Diamond Legend',
    min_hours: 250,
    icon_name: 'Flame',
    color: '#06B6D4',
    order_index: 6,
  },
];

export function getBadgeForHours(hours: number): BadgeDefinition {
  const sorted = [...BADGE_DEFINITIONS].sort((a, b) => b.min_hours - a.min_hours);
  const found = sorted.find((b) => hours >= b.min_hours);
  return found || BADGE_DEFINITIONS[0];
}

export function getNextBadgeInfo(hours: number): {
  currentBadge: BadgeDefinition;
  nextBadge: BadgeDefinition | null;
  progressPercent: number;
  hoursNeeded: number;
} {
  const currentBadge = getBadgeForHours(hours);
  const sorted = [...BADGE_DEFINITIONS].sort((a, b) => a.order_index - b.order_index);
  const nextBadgeIndex = sorted.findIndex((b) => b.id === currentBadge.id) + 1;

  if (nextBadgeIndex >= sorted.length) {
    return {
      currentBadge,
      nextBadge: null,
      progressPercent: 100,
      hoursNeeded: 0,
    };
  }

  const nextBadge = sorted[nextBadgeIndex];
  const floor = currentBadge.min_hours;
  const ceiling = nextBadge.min_hours;
  const range = ceiling - floor;
  const currentProgress = hours - floor;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)));
  const hoursNeeded = Math.max(0, ceiling - hours);

  return {
    currentBadge,
    nextBadge,
    progressPercent,
    hoursNeeded,
  };
}
