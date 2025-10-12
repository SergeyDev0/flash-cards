'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Card, DraftCard, Group, RegularityLevel } from '@/types';
import { REGULARITY_INTERVAL_MS } from '@/types';

type FlashcardsState = {
  groups: Group[];
  cards: Card[];
};

type FlashcardsContextValue = {
  groups: Group[];
  cards: Card[];
  isHydrated: boolean;
  getCardsByGroup: (groupId: string) => Card[];
  getGroupById: (groupId: string) => Group | undefined;
  createGroup: (name: string) => void;
  updateGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
  createCard: (groupId: string, payload: DraftCard) => void;
  updateCard: (id: string, payload: DraftCard) => void;
  deleteCard: (id: string) => void;
  gradeCard: (id: string, isCorrect: boolean) => void;
};

const STORAGE_KEY = 'flashcards-state-v1';

const initialTimestamp = () => new Date().toISOString();

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const computeNextReview = (level: RegularityLevel, baseDate = new Date()) => {
  const interval = REGULARITY_INTERVAL_MS[level];
  const next = new Date(baseDate.getTime() + interval);
  return next.toISOString();
};

const createDefaultState = (): FlashcardsState => {
  const groupId = generateId();
  const createdAt = initialTimestamp();
  const cardId1 = generateId();
  const cardId2 = generateId();

  return {
    groups: [
      {
        id: groupId,
        name: 'Sample: Spanish verbs',
        createdAt,
        updatedAt: createdAt,
      },
    ],
    cards: [
      {
        id: cardId1,
        groupId,
        title: 'Verb "ser"',
        front: 'How do you translate the verb "ser"?',
        back: '"Ser" means "to be" when describing permanent traits.',
        regularity: 1,
        createdAt,
        updatedAt: createdAt,
        nextReviewAt: computeNextReview(1),
      },
      {
        id: cardId2,
        groupId,
        title: 'Phrase "Como estas?"',
        front: 'What does "Como estas?" mean?',
        back: 'It is a common greeting that translates to "How are you?".',
        regularity: 1,
        createdAt,
        updatedAt: createdAt,
        nextReviewAt: computeNextReview(1),
      },
    ],
  };
};

const validateState = (raw: unknown): FlashcardsState | null => {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Partial<FlashcardsState>;
  if (!Array.isArray(value.groups) || !Array.isArray(value.cards)) return null;
  return {
    groups: value.groups.filter((item: unknown): item is Group => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Group;
      return Boolean(candidate.id && candidate.name);
    }),
    cards: value.cards.filter((item: unknown): item is Card => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Card;
      return Boolean(candidate.id && candidate.groupId);
    }),
  };
};

const FlashcardsContext = createContext<FlashcardsContextValue | undefined>(
  undefined,
);

export const FlashcardsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<FlashcardsState>(createDefaultState);
  const [isHydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = validateState(JSON.parse(stored));
        if (parsed) {
          setState(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to restore flashcards from storage', error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist flashcards to storage', error);
    }
  }, [state, isHydrated]);

  const getCardsByGroup = useCallback(
    (groupId: string) => state.cards.filter((card) => card.groupId === groupId),
    [state.cards],
  );

  const getGroupById = useCallback(
    (groupId: string) => state.groups.find((group) => group.id === groupId),
    [state.groups],
  );

  const createGroup = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((prev) => {
      const now = initialTimestamp();
      const newGroup: Group = {
        id: generateId(),
        name: trimmed,
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...prev,
        groups: [...prev.groups, newGroup],
      };
    });
  }, []);

  const updateGroup = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((prev) => {
      const now = initialTimestamp();
      return {
        ...prev,
        groups: prev.groups.map((group) =>
          group.id === id ? { ...group, name: trimmed, updatedAt: now } : group,
        ),
      };
    });
  }, []);

  const deleteGroup = useCallback((id: string) => {
    setState((prev) => ({
      groups: prev.groups.filter((group) => group.id !== id),
      cards: prev.cards.filter((card) => card.groupId !== id),
    }));
  }, []);

  const createCard = useCallback(
    (groupId: string, payload: DraftCard) => {
      const title = payload.title.trim();
      const front = payload.front.trim();
      const back = payload.back.trim();
      if (!title || !front || !back) return;
      setState((prev) => {
        const now = initialTimestamp();
        const newCard: Card = {
          id: generateId(),
          groupId,
          title,
          front,
          back,
          regularity: 1,
          createdAt: now,
          updatedAt: now,
          nextReviewAt: computeNextReview(1),
        };
        return {
          ...prev,
          cards: [...prev.cards, newCard],
        };
      });
    },
    [],
  );

  const updateCard = useCallback((id: string, payload: DraftCard) => {
    const title = payload.title.trim();
    const front = payload.front.trim();
    const back = payload.back.trim();
    if (!title || !front || !back) return;
    setState((prev) => {
      const now = initialTimestamp();
      return {
        ...prev,
        cards: prev.cards.map((card) =>
          card.id === id
            ? { ...card, title, front, back, updatedAt: now }
            : card,
        ),
      };
    });
  }, []);

  const deleteCard = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      cards: prev.cards.filter((card) => card.id !== id),
    }));
  }, []);

  const gradeCard = useCallback((id: string, isCorrect: boolean) => {
    setState((prev) => {
      const now = new Date();
      const timestamp = now.toISOString();
      return {
        ...prev,
        cards: prev.cards.map((card) => {
          if (card.id !== id) return card;
          const currentLevel = card.regularity;
          const nextLevel: RegularityLevel = isCorrect
            ? (Math.min(currentLevel + 1, 3) as RegularityLevel)
            : currentLevel;
          const nextReview =
            currentLevel === 3 && nextLevel === 3 && isCorrect
              ? computeNextReview(3, now)
              : computeNextReview(nextLevel, now);
          return {
            ...card,
            regularity: nextLevel,
            lastReviewedAt: timestamp,
            nextReviewAt: nextReview,
            updatedAt: timestamp,
          };
        }),
      };
    });
  }, []);

  const value = useMemo<FlashcardsContextValue>(
    () => ({
      groups: state.groups,
      cards: state.cards,
      isHydrated,
      getCardsByGroup,
      getGroupById,
      createGroup,
      updateGroup,
      deleteGroup,
      createCard,
      updateCard,
      deleteCard,
      gradeCard,
    }),
    [
      state.groups,
      state.cards,
      isHydrated,
      getCardsByGroup,
      getGroupById,
      createGroup,
      updateGroup,
      deleteGroup,
      createCard,
      updateCard,
      deleteCard,
      gradeCard,
    ],
  );

  return (
    <FlashcardsContext.Provider value={value}>
      {children}
    </FlashcardsContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardsContext);
  if (!context) {
    throw new Error(
      'useFlashcards должен использоваться внутри FlashcardsProvider',
    );
  }
  return context;
};
