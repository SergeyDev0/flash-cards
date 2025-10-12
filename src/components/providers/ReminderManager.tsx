'use client';

import { useEffect, useRef, useState } from 'react';
import { useFlashcards } from '@/context/FlashcardsContext';

const MAX_TIMEOUT = 2_147_483_647;

interface Flashcard {
  id: string;
  title: string;
  front: string;
  nextReviewAt: string | Date;
}

type TimerMap = Record<string, number>;

const ReminderManager = () => {
  const { cards, isHydrated } = useFlashcards();
  const timersRef = useRef<TimerMap>({});
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timerId) =>
        window.clearTimeout(timerId),
      );
      timersRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (
      !isClient ||
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      permission !== 'granted' ||
      !isHydrated
    )
      return;

    const timers = timersRef.current;
    Object.values(timers).forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = {};

    cards.forEach((card) => {
      const targetTime = new Date(card.nextReviewAt).getTime();
      if (Number.isNaN(targetTime)) return;
      const delay = targetTime - Date.now();
      if (delay <= 0) scheduleNotification(card, 1_000, timers);
      else if (delay <= MAX_TIMEOUT) scheduleNotification(card, delay, timers);
    });
  }, [cards, isHydrated, permission, isClient]);

  const scheduleNotification = (
    card: Flashcard,
    delay: number,
    timers: TimerMap,
  ) => {
    const timerId = window.setTimeout(() => {
      if (Notification.permission !== 'granted') return;
      new Notification(card.title, {
        body: card.front,
        tag: card.id,
      });
    }, delay);
    timers[card.id] = timerId;
  };

  if (!isClient || !('Notification' in window)) return null;

  if (permission === 'denied') {
    return (
      <div className="fixed bottom-6 right-6 z-40 rounded-xl bg-red-600 px-5 py-3 text-sm text-white shadow-lg">
        Уведомления отключены. Включите в настройках браузера
      </div>
    );
  }

  if (permission === 'granted') {
    return (
      <div className="fixed bottom-6 right-6 z-40 rounded-xl bg-green-600 px-5 py-3 text-sm text-white shadow-lg">
        Уведомления включены
      </div>
    );
  }

  return (
    <button
      type="button"
      className="fixed bottom-6 right-6 z-40 rounded-full bg-[#111] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#222]"
      onClick={async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
      }}
    >
      Включить уведомления
    </button>
  );
};

export default ReminderManager;
