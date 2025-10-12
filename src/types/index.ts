export type RegularityLevel = 1 | 2 | 3;

export const REGULARITY_LABELS: Record<RegularityLevel, string> = {
  1: 'Ежедневно',
  2: 'Через день',
  3: 'Еженедельно',
};

export const REGULARITY_INTERVAL_MS: Record<RegularityLevel, number> = {
  1: 24 * 60 * 60 * 1000,
  2: 2 * 24 * 60 * 60 * 1000,
  3: 7 * 24 * 60 * 60 * 1000,
};

export type Group = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Card = {
  id: string;
  groupId: string;
  title: string;
  front: string;
  back: string;
  regularity: RegularityLevel;
  createdAt: string;
  updatedAt: string;
  lastReviewedAt?: string;
  nextReviewAt: string;
};

export type DraftCard = Pick<Card, "title" | "front" | "back">;
