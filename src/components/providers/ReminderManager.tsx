'use client';

import { useEffect, useRef, useState } from 'react';
import { useFlashcards } from '@/context/FlashcardsContext';

type ReminderCard = {
  id: string;
  groupId: string;
  title: string;
  front: string;
  nextReviewAt: string;
};

const base64ToUint8Array = (value: string) => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
};

const ReminderManager = () => {
  const { cards, isHydrated } = useFlashcards();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isReady, setIsReady] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const isClient = typeof window !== 'undefined';

  useEffect(() => {
    if (!isClient) {
      return;
    }
    if (!('Notification' in window)) {
      setPermission('denied');
      setIsReady(true);
      return;
    }
    setPermission(Notification.permission);
    setIsReady(true);
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !('serviceWorker' in navigator)) {
      return;
    }

    let cancelled = false;

    const ensureRegistration = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (cancelled) return;
        registrationRef.current = registration;

        if (Notification.permission === 'granted' && vapidKey) {
          const existing = await registration.pushManager.getSubscription();
          if (!existing) {
            try {
              await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: base64ToUint8Array(vapidKey),
              });
            } catch (error) {
              console.error('Push subscription failed', error);
            }
          }
        }
      } catch (error) {
        console.error('Service worker registration failed', error);
      }
    };

    ensureRegistration();
    return () => {
      cancelled = true;
    };
  }, [isClient, vapidKey]);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (!workerRef.current) {
      const worker = new Worker(
        new URL('../../workers/reminderWorker.ts', import.meta.url),
        { type: 'module' },
      );

      worker.onmessage = async (event: MessageEvent) => {
        const { type, payload } = event.data || {};
        if (type !== 'due' || !payload) return;
        if (!('Notification' in window) || Notification.permission !== 'granted') {
          return;
        }

        try {
          const registration =
            registrationRef.current || (await navigator.serviceWorker.ready);
          registrationRef.current = registration;

          const message = {
            type: 'notify',
            payload: {
              title: payload.title,
              body: payload.body,
              tag: payload.id,
              data: { url: `/cards/${payload.groupId}` },
            },
          };

          const target = registration.active || registration.waiting;
          if (target) {
            target.postMessage(message);
          } else {
            await registration.showNotification(payload.title, {
              body: payload.body,
              tag: payload.id,
            });
          }
        } catch (error) {
          console.error('Reminder notification failed', error);
        }
      };

      workerRef.current = worker;
    }
  }, [isClient]);

  useEffect(() => {
    if (!workerRef.current || !isHydrated) {
      return;
    }

    const payload = cards.map<ReminderCard>((card) => ({
      id: card.id,
      groupId: card.groupId,
      title: card.title,
      front: card.front,
      nextReviewAt: card.nextReviewAt,
    }));

    workerRef.current.postMessage({
      type: 'sync',
      payload: {
        cards: payload.map((card) => ({
          id: card.id,
          groupId: card.groupId,
          title: card.title,
          body: card.front,
          nextReviewAt: card.nextReviewAt,
        })),
      },
    });
  }, [cards, isHydrated]);

  if (!isClient || !isReady || !('Notification' in window)) {
    return null;
  }

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
        try {
          const result = await Notification.requestPermission();
          setPermission(result);

          if (result === 'granted' && vapidKey) {
            try {
              const registration =
                registrationRef.current || (await navigator.serviceWorker.ready);
              registrationRef.current = registration;
              await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: base64ToUint8Array(vapidKey),
              });
            } catch (error) {
              console.error('Push subscription failed', error);
            }
          }
        } catch (error) {
          console.error('Notification permission request failed', error);
        }
      }}
    >
      Включить уведомления
    </button>
  );
};

export default ReminderManager;
