/// <reference lib="webworker" />

type ReminderPayload = {
  id: string;
  groupId: string;
  title: string;
  body: string;
  nextReviewAt: string;
};

type ScheduledTask = {
  timerId: number;
  targetTime: number;
  payload: ReminderPayload;
};

const MAX_TIMEOUT = 2_147_483_647;
const tasks = new Map<string, ScheduledTask>();

const clearTask = (id: string) => {
  const existing = tasks.get(id);
  if (existing) {
    clearTimeout(existing.timerId);
    tasks.delete(id);
  }
};

const scheduleChunkedTimeout = (
  payload: ReminderPayload,
  targetTime: number,
  timeLeft: number,
) => {
  const delay = Math.min(timeLeft, MAX_TIMEOUT);
  const timerId = setTimeout(() => {
    const remaining = targetTime - Date.now();
    if (remaining > MAX_TIMEOUT) {
      scheduleChunkedTimeout(payload, targetTime, remaining);
      return;
    }
    if (remaining > 0) {
      scheduleChunkedTimeout(payload, targetTime, remaining);
      return;
    }
    tasks.delete(payload.id);
    (self as DedicatedWorkerGlobalScope).postMessage({
      type: 'due',
      payload,
    });
  }, delay) as unknown as number;

  tasks.set(payload.id, {
    timerId,
    targetTime,
    payload,
  });
};

const scheduleReminder = (payload: ReminderPayload) => {
  const targetTime = new Date(payload.nextReviewAt).getTime();
  if (Number.isNaN(targetTime)) {
    clearTask(payload.id);
    return;
  }
  const timeLeft = targetTime - Date.now();
  if (timeLeft <= 0) {
    clearTask(payload.id);
    (self as DedicatedWorkerGlobalScope).postMessage({
      type: 'due',
      payload,
    });
    return;
  }

  scheduleChunkedTimeout(payload, targetTime, timeLeft);
};

const syncReminders = (incoming: ReminderPayload[]) => {
  const incomingIds = new Set(incoming.map((item) => item.id));

  for (const id of Array.from(tasks.keys())) {
    if (!incomingIds.has(id)) {
      clearTask(id);
    }
  }

  incoming.forEach((payload) => {
    const targetTime = new Date(payload.nextReviewAt).getTime();
    if (Number.isNaN(targetTime)) {
      return;
    }

    const existing = tasks.get(payload.id);
    if (existing && existing.targetTime === targetTime) {
      return;
    }

    clearTask(payload.id);
    scheduleReminder(payload);
  });
};

self.addEventListener('message', (event: MessageEvent) => {
  const { type, payload } = event.data || {};

  if (type === 'sync' && Array.isArray(payload?.cards)) {
    syncReminders(payload.cards as ReminderPayload[]);
  }

  if (type === 'cancel' && typeof payload?.id === 'string') {
    clearTask(payload.id);
  }

  if (type === 'schedule-test') {
    const targetTime = new Date(Date.now() + 60_000).toISOString();
    scheduleReminder({
      id: 'flashcards-test-reminder',
      groupId: '',
      title: 'Test reminder',
      body: 'Test push notification',
      nextReviewAt: targetTime,
    });
  }
});

export {};
