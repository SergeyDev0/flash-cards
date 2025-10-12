'use client';

import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import CardModal from '@/components/modal/CardModal';
import GroupModal from '@/components/modal/GroupModal';
import { useFlashcards } from '@/context/FlashcardsContext';

const TEXT = {
  homeHeading: 'Планировщик карточек',
  fallbackHeading: 'Памятные карточки',
  subtitle:
    'Создавайте подсказки с ответами, просматривайте их ежедневно и увеличивайте интервалы между карточками, чтобы поддерживать актуальность знаний.',
  createGroup: 'Новая группа',
  addCard: 'Добавить карточку',
  backToGroups: 'Вернуться назад к группам',
};

const Header = () => {
  const pathname = usePathname();
  const { createGroup, createCard, getGroupById } = useFlashcards();

  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [isCardModalOpen, setCardModalOpen] = useState(false);

  const pathSegments = useMemo(
    () => pathname.split('/').filter(Boolean),
    [pathname],
  );

  const isHome = pathSegments.length === 0;
  const isGroupPage = pathSegments[0] === 'cards';
  const groupId = isGroupPage ? pathSegments[1] ?? null : null;
  const currentGroup = groupId ? getGroupById(groupId) : undefined;

  const heading = useMemo(() => {
    if (isHome) return TEXT.homeHeading;
    if (currentGroup) return currentGroup.name;
    return TEXT.fallbackHeading;
  }, [isHome, currentGroup]);

  const backHref = useMemo(() => {
    if (isHome) return null;
    if (pathSegments[0] === 'cards') {
      if (pathSegments.length >= 3 && pathSegments[1]) {
        return `/cards/${pathSegments[1]}`;
      }
      return '/';
    }
    return '/';
  }, [isHome, pathSegments]);

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-black/10 pb-5 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            {backHref ? (
              <Link
                href={backHref}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[#111] transition hover:border-black/40 hover:bg-black hover:text-white"
                aria-label={TEXT.backToGroups}
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            ) : null}
            <h1 className="text-2xl font-semibold text-[#111] sm:text-3xl">
              {heading}
            </h1>
          </div>
          <p className="mt-2 max-w-xl text-sm text-[#555]">{TEXT.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isHome ? (
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-xl bg-[#111] px-5 text-sm font-semibold text-white transition hover:bg-[#222]"
              onClick={() => setGroupModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
              {TEXT.createGroup}
            </button>
          ) : null}
          {currentGroup ? (
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-5 text-sm font-semibold text-[#111] transition hover:border-black/40 hover:bg-black hover:text-white"
              onClick={() => setCardModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
              {TEXT.addCard}
            </button>
          ) : null}
        </div>
      </header>
      <GroupModal
        open={isGroupModalOpen}
        mode="create"
        onClose={() => setGroupModalOpen(false)}
        onSubmit={createGroup}
      />
      {currentGroup ? (
        <CardModal
          open={isCardModalOpen}
          mode="create"
          onClose={() => setCardModalOpen(false)}
          onSubmit={(payload) => createCard(currentGroup.id, payload)}
        />
      ) : null}
    </>
  );
};

export default Header;
