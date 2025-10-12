'use client';

import { Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import ConfirmModal from '@/components/modal/ConfirmModal';
import GroupModal from '@/components/modal/GroupModal';
import { useFlashcards } from '@/context/FlashcardsContext';
import { REGULARITY_LABELS } from '@/types';
import { formatDateTime, formatRelative, isOverdue } from '@/utils/date';

const TEXT = {
  loading: 'Загрузка групп...',
  emptyTitle: 'Создайте свою первую группу',
  emptySubtitle:
    'Нажмите на кнопку "Создать группу" в верхней части экрана',
  cardsWord: 'Карточки',
  nextReview: 'След. напоминание:',
  noReviews: 'Пока нет карточек',
  allGood: 'Всё идёт по плану',
  overdueSuffix: 'Просрочено',
  goToGroup: 'Открыть группу',
  renameGroup: 'Переименовать группу',
  deleteGroup: 'Удалить группу',
  confirmDeleteTitle: 'Удалить группу?',
  confirmDeleteDescription:
    'Карты внутри этой группы также будут удалены. Это действие не может быть отменено.',
  confirmDeleteButton: 'Удалить группу',
};

type GroupListItem = {
  id: string;
  title: string;
  cardsCount: number;
  dueCount: number;
  nextReviewAt?: string;
  topRegularity?: string;
};

export default function Home() {
  const {
    groups,
    getCardsByGroup,
    updateGroup,
    deleteGroup,
    isHydrated,
  } = useFlashcards();

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  const groupItems = useMemo<GroupListItem[]>(() => {
    return groups.map((group) => {
      const cards = getCardsByGroup(group.id);
      const cardsCount = cards.length;
      if (cardsCount === 0) {
        return {
          id: group.id,
          title: group.name,
          cardsCount,
          dueCount: 0,
        };
      }
      const dueCount = cards.reduce(
        (acc, card) => (isOverdue(card.nextReviewAt) ? acc + 1 : acc),
        0,
      );
      const nextReviewAt = cards.reduce<string | undefined>((nearest, card) => {
        if (!nearest) return card.nextReviewAt;
        return new Date(card.nextReviewAt).getTime() <
          new Date(nearest).getTime()
          ? card.nextReviewAt
          : nearest;
      }, undefined);
      const topRegularityValue = cards.reduce<number>(
        (acc, card) => Math.max(acc, card.regularity),
        1,
      );
      return {
        id: group.id,
        title: group.name,
        cardsCount,
        dueCount,
        nextReviewAt,
        topRegularity: REGULARITY_LABELS[topRegularityValue as 1 | 2 | 3],
      };
    });
  }, [groups, getCardsByGroup]);

  const editingGroup = editingGroupId
    ? groups.find((group) => group.id === editingGroupId)
    : null;
  const deletingGroup = deletingGroupId
    ? groups.find((group) => group.id === deletingGroupId)
    : null;

  return (
    <>
      <section className="space-y-6">
        {!isHydrated ? (
          <div className="rounded-2xl border border-black/10 bg-white p-10 text-center text-sm text-[#777]">
            {TEXT.loading}
          </div>
        ) : groupItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white px-8 py-12 text-center">
            <h2 className="text-lg font-semibold text-[#111]">
              {TEXT.emptyTitle}
            </h2>
            <p className="mt-2 text-sm text-[#555]">{TEXT.emptySubtitle}</p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groupItems.map((group) => (
              <li key={group.id}>
                <Link
                  href={`/cards/${group.id}`}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 transition hover:border-black/20 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-[#111]">
                          {group.title}
                        </h2>
                        <p className="mt-1 text-sm text-[#666]">
                          {group.cardsCount} {TEXT.cardsWord}
                          {group.topRegularity
                            ? ` · ${group.topRegularity}`
                            : ''}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[#111] transition hover:border-black/40 hover:bg-black hover:text-white"
                          onClick={(event) => {
                            event.preventDefault();
                            setEditingGroupId(group.id);
                          }}
                          aria-label={TEXT.renameGroup}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-[#d93829] transition hover:border-[#d93829]/40 hover:bg-[#d93829] hover:text-white"
                          onClick={(event) => {
                            event.preventDefault();
                            setDeletingGroupId(group.id);
                          }}
                          aria-label={TEXT.deleteGroup}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#555]">
                      {group.nextReviewAt ? (
                        <span className="rounded-full bg-[#f7f7f9] px-3 py-1">
                          {TEXT.nextReview}{' '}
                          <strong className="font-medium text-[#111]">
                            {formatDateTime(group.nextReviewAt)}
                          </strong>{' '}
                          ({formatRelative(group.nextReviewAt)})
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#f7f7f9] px-3 py-1">
                          {TEXT.noReviews}
                        </span>
                      )}
                      {group.dueCount > 0 ? (
                        <span className="rounded-full bg-[#ffeaea] px-3 py-1 font-medium text-[#d93829]">
                          {group.dueCount} {TEXT.overdueSuffix}
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#e3fcef] px-3 py-1 font-medium text-[#149e55]">
                          {TEXT.allGood}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#111] transition group-hover:gap-3 group-hover:text-black">
                    {TEXT.goToGroup}
                    <span aria-hidden>&rarr;</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editingGroup ? (
        <GroupModal
          open
          mode="edit"
          defaultName={editingGroup.name}
          onClose={() => setEditingGroupId(null)}
          onSubmit={(name) => updateGroup(editingGroup.id, name)}
        />
      ) : null}

      {deletingGroup ? (
        <ConfirmModal
          open
          title={TEXT.confirmDeleteTitle}
          description={TEXT.confirmDeleteDescription}
          confirmLabel={TEXT.confirmDeleteButton}
          onClose={() => setDeletingGroupId(null)}
          onConfirm={() => deleteGroup(deletingGroup.id)}
        />
      ) : null}
    </>
  );
}
