'use client';

import {
  ArrowLeftRight,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  RotateCw,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFlashcards } from '@/context/FlashcardsContext';
import { REGULARITY_LABELS } from '@/types';
import { formatDateTime, formatRelative, isOverdue } from '@/utils/date';

const CardReviewPage = () => {
  const params = useParams<{ groupId: string; cardId: string }>();
  const router = useRouter();

  const groupId = params?.groupId ?? '';
  const cardId = params?.cardId ?? '';
  const { getGroupById, getCardsByGroup, gradeCard } = useFlashcards();

  const group = getGroupById(groupId);
  const cards = useMemo(
    () => getCardsByGroup(groupId),
    [getCardsByGroup, groupId],
  );
  const card = cards.find((item) => item.id === cardId);

  const [isBackVisible, setBackVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [actionsVisible, setActionsVisible] = useState(true);
  const redirectTimeoutRef = useRef<number | null>(null);
  const resetStatusTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (groupId) {
      router.prefetch(`/cards/${groupId}`);
    }
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
        }
      if (resetStatusTimeoutRef.current) {
        window.clearTimeout(resetStatusTimeoutRef.current);
      }
    };
  }, [groupId, router]);

  if (!group || !card) {
    return (
      <section className="rounded-2xl border border-black/10 bg-white px-8 py-12 text-center">
        <h2 className="text-lg font-semibold text-[#111]">
          Card was not found
        </h2>
        <p className="mt-2 text-sm text-[#555]">
          It may have been deleted or the link is outdated.
        </p>
        <Link
          href={`/cards/${groupId || ''}`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#111] px-6 text-sm font-semibold text-white transition hover:bg-[#222]"
        >
          Back to group
        </Link>
      </section>
    );
  }

  const overdue = isOverdue(card.nextReviewAt);
  const cardIndex = cards.findIndex((item) => item.id === cardId);
  const nextCard = cards[cardIndex + 1];

  const handleFlip = () => setBackVisible((prev) => !prev);

  const handleGrade = (isCorrect: boolean) => {
    if (!actionsVisible) return;
    setActionsVisible(false);
    gradeCard(card.id, isCorrect);
    setStatus(isCorrect ? 'success' : 'error');
    if (resetStatusTimeoutRef.current) {
      window.clearTimeout(resetStatusTimeoutRef.current);
    }
    resetStatusTimeoutRef.current = window.setTimeout(
      () => setStatus('idle'),
      2500,
    );
    if (redirectTimeoutRef.current) {
      window.clearTimeout(redirectTimeoutRef.current);
    }
    redirectTimeoutRef.current = window.setTimeout(() => {
      if (groupId) {
        router.push(`/cards/${groupId}`);
      } else {
        router.push('/');
      }
    }, 1200);
  };

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[#666]">Группа</p>
            <h2 className="text-xl font-semibold text-[#111]">{group.name}</h2>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full bg-[#f7f7f9] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#555]">
            {REGULARITY_LABELS[card.regularity]}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              overdue ? 'bg-[#ffeaea] text-[#d93829]' : 'bg-[#e3fcef] text-[#149e55]'
            }`}
          >
            {overdue ? 'Нужно повторить' : 'Всё по плану'}
          </span>
          <span className="rounded-full bg-[#f7f7f9] px-3 py-1 text-xs font-medium text-[#444]">
            След.&nbsp;повторение: {formatDateTime(card.nextReviewAt)}
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-white to-[#f7f7f9] p-8 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#888]">
              {isBackVisible ? 'Задняя сторона' : 'Передняя сторона'}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#111]">
              {card.title}
            </h3>
          </div>
          <button
            type="button"
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[#111] transition hover:border-black/40 hover:bg-black hover:text-white"
            onClick={handleFlip}
          >
            {isBackVisible ? (
              <>
                <EyeOff className="h-4 w-4" />
                Скрыть ответ
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Показать ответ
              </>
            )}
          </button>
        </div>
        <div className="mt-8 min-h-[180px] rounded-2xl bg-white/60 p-6 text-lg leading-relaxed text-[#222] shadow-inner whitespace-pre-wrap">
          {isBackVisible ? card.back : card.front}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#666]">
          <span>
            Посл.&nbsp;повторение:{' '}
            <strong className="text-[#111]">
              {card.lastReviewedAt
                ? formatRelative(card.lastReviewedAt)
                : 'Не было'}
            </strong>
          </span>
        </div>
      </div>

      {actionsVisible && (
      <div className="sticky bottom-4 flex flex-col gap-3 rounded-3xl border border-black/10 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#555]">
				Откройте ответ, оцените себя и определите, правильно ли вы ответили. Мы автоматически скорректируем график напоминаний.
        </p>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex h-12 px-4 flex-1 items-center justify-center gap-2 rounded-xl border border-[#d93829]/40 bg-[#ffeaea] text-sm font-semibold text-[#d93829] transition hover:border-[#d93829]/60 hover:bg-[#ffdada]"
            onClick={() => handleGrade(false)}
          >
            <XCircle className="h-5 w-5" />
            Неверно
          </button>
          <button
            type="button"
            className="inline-flex px-4 h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#149e55]/40 bg-[#e3fcef] text-sm font-semibold text-[#0e7c40] transition hover:border-[#149e55]/60 hover:bg-[#ccf5e0]"
            onClick={() => handleGrade(true)}
          >
            <Check className="h-5 w-5" />
            Верно
          </button>
        </div>
      </div>
      )}

      {status !== 'idle' ? (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg ${
            status === 'success'
              ? 'bg-[#e3fcef] text-[#0e7c40]'
              : 'bg-[#ffeaea] text-[#d93829]'
          }`}
        >
          {status === 'success'
            ? 'Отлично! Эта карточка будет появляться реже.'
            : 'Не расстраивайтесь, у вас ещё получится! Мы сохраним эту карту в текущем интервале.'}
        </div>
      ) : null}

      {nextCard ? (
        <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-6 py-4 text-sm text-[#555]">
          <div>
            <p className="font-medium text-[#111]">Следующая карточка</p>
            <p className="mt-1 text-sm text-[#555]">{nextCard.title}</p>
          </div>
          <Link
            href={`/cards/${groupId}/${nextCard.id}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#111] transition hover:border-black/40 hover:bg-black hover:text-white"
          >
            Перейти
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </section>
  );
};

export default CardReviewPage;
