import { BadgeDefinition } from './types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'starter',
    name: 'Starter',
    min_hours: 0,
    icon_name: 'Sparkles',
    color: '#94A3B8',
    order_index: 1,
  },
  {
    id: 'helper',
    name: 'Helper',
    min_hours: 10,
    icon_name: 'Heart',
    color: '#3B82F6',
    order_index: 2,
  },
  {
    id: 'contributor',
    name: 'Contributor',
    min_hours: 25,
    icon_name: 'Award',
    color: '#10B981',
    order_index: 3,
  },
  {
    id: 'champion',
    name: 'Champion',
    min_hours: 50,
    icon_name: 'Zap',
    color: '#8B5CF6',
    order_index: 4,
  },
  {
    id: 'leader',
    name: 'Leader',
    min_hours: 100,
    icon_name: 'Crown',
    color: '#F59E0B',
    order_index: 5,
  },
  {
    id: 'pillar',
    name: 'Pillar',
    min_hours: 250,
    icon_name: 'ShieldCheck',
    color: '#EC4899',
    order_index: 6,
  },
  {
    id: 'legacy',
    name: 'Legacy',
    min_hours: 500,
    icon_name: 'Flame',
    color: '#635BFF',
    order_index: 7,
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
