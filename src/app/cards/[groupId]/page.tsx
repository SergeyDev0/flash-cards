'use client';

import { Pencil, RefreshCw, Trash } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import CardModal from '@/components/modal/CardModal';
import ConfirmModal from '@/components/modal/ConfirmModal';
import { useFlashcards } from '@/context/FlashcardsContext';
import { REGULARITY_LABELS } from '@/types';
import {
  formatDateFull,
  formatDateTime,
  formatRelative,
  isOverdue,
} from '@/utils/date';

const GroupPage = () => {
  const params = useParams<{ groupId: string }>();
  const groupId = params?.groupId ?? '';

  const { getGroupById, getCardsByGroup, updateCard, deleteCard } =
    useFlashcards();

  const group = getGroupById(groupId);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const cards = useMemo(
    () =>
      getCardsByGroup(groupId).sort((a, b) => {
        const nextA = new Date(a.nextReviewAt).getTime();
        const nextB = new Date(b.nextReviewAt).getTime();
        const overdueA = isOverdue(a.nextReviewAt);
        const overdueB = isOverdue(b.nextReviewAt);
        if (overdueA && !overdueB) return -1;
        if (!overdueA && overdueB) return 1;
        return nextA - nextB;
      }),
    [getCardsByGroup, groupId],
  );

  const stats = useMemo(() => {
    const total = cards.length;
    const due = cards.filter((card) => isOverdue(card.nextReviewAt));
    const next = cards.length > 0 ? cards[0] : null;
    return {
      total,
      dueCount: due.length,
      nextCard: next,
    };
  }, [cards]);

  const editingCard = editingCardId
    ? cards.find((card) => card.id === editingCardId)
    : null;
  const deletingCard = deletingCardId
    ? cards.find((card) => card.id === deletingCardId)
    : null;

  if (!group) {
    return (
      <section className="rounded-2xl border border-black/10 bg-white px-8 py-12 text-center">
        <h2 className="text-lg font-semibold text-[#111]">
          Group was not found
        </h2>
        <p className="mt-2 text-sm text-[#555]">
          It may have been deleted or the link is outdated.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#111] px-6 text-sm font-semibold text-white transition hover:bg-[#222]"
        >
          Back to groups
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#111]">
                Всего&nbsp;карточек: {stats.total}
              </h2>
              <p className="mt-1 text-sm text-[#555]">
                Группа&nbsp;создана: {formatDateFull(group.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-[#f7f7f9] px-3 py-1 text-sm text-[#333]">
                {stats.dueCount > 0
                  ? `${stats.dueCount} карточек(-ка) для повторения`
                  : 'Нет карточек для повторения'}
              </span>
              {stats.nextCard ? (
                <span className="rounded-full bg-[#e3fcef] px-3 py-1 text-sm font-medium text-[#149e55]">
                  След.&nbsp;повторение: {formatRelative(stats.nextCard.nextReviewAt)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white px-8 py-16 text-center">
            <h3 className="text-lg font-semibold text-[#111]">
              There are no cards yet
            </h3>
            <p className="mt-2 text-sm text-[#555]">
              Use the “Add card” button in the header to create your first
              card.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {cards.map((card) => {
              const overdue = isOverdue(card.nextReviewAt);
              return (
                <li
                  key={card.id}
                  className="rounded-2xl border border-black/10 bg-white p-6 transition hover:border-black/20 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-[#111]">
                          {card.title}
                        </h3>
                        <span className="rounded-full bg-[#f7f7f9] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#666]">
                          {REGULARITY_LABELS[card.regularity]}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                            overdue
                              ? 'bg-[#ffeaea] text-[#d93829]'
                              : 'bg-[#e3fcef] text-[#149e55]'
                          }`}
                        >
                          {overdue ? 'Нужно повторить' : 'Всё по плану'}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-1">
                        <div className="rounded-xl border border-dashed border-black/10 bg-[#f9f9fb] p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-[#888]">
                            Передняя сторона
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-[#333]">
                            {card.front}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-col gap-2 md:w-48">
                      <div className="rounded-xl bg-[#f7f7f9] px-4 py-3 text-sm text-[#555]">
                        <p>
                          След. повторение: <br />
                          <strong className="text-[#111]">
                            {formatDateTime(card.nextReviewAt)}
                          </strong>
                        </p>
                        {card.lastReviewedAt ? (
                          <p className="mt-1 text-xs text-[#777]">
                            Посл. повторение <br /> {formatRelative(card.lastReviewedAt)}
                          </p>
                        ) : null}
                      </div>
                      <Link
                        href={`/cards/${groupId}/${card.id}`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111] px-4 text-sm font-semibold text-white transition hover:bg-[#222]"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Повторить
                      </Link>
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white text-sm font-medium text-[#111] transition hover:border-black/40 hover:bg-black hover:text-white"
                        onClick={() => setEditingCardId(card.id)}
                      >
                        <Pencil className="h-4 w-4" />
                        Изменить
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#d93829]/30 bg-[#ffeaea] text-sm font-medium text-[#d93829] transition hover:border-[#d93829]/60 hover:bg-[#ffd5d5]"
                        onClick={() => setDeletingCardId(card.id)}
                      >
                        <Trash className="h-4 w-4" />
                        Удалить
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {editingCard ? (
        <CardModal
          open
          mode="edit"
          defaultValues={{
            title: editingCard.title,
            front: editingCard.front,
            back: editingCard.back,
          }}
          onClose={() => setEditingCardId(null)}
          onSubmit={(payload) => updateCard(editingCard.id, payload)}
        />
      ) : null}

      {deletingCard ? (
        <ConfirmModal
          open
          title="Remove card?"
          description="This card will be deleted permanently."
          confirmLabel="Delete card"
          onClose={() => setDeletingCardId(null)}
          onConfirm={() => deleteCard(deletingCard.id)}
        />
      ) : null}
    </>
  );
};

export default GroupPage;

