'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Modal from './Modal';

type GroupModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (name: string) => void;
  defaultName?: string;
};

const TITLE: Record<GroupModalProps['mode'], string> = {
  create: 'Новая группа',
  edit: 'Редактировать группу',
};

const DESCRIPTION: Record<GroupModalProps['mode'], string> = {
  create:
    'Выделите отдельное место для карточек. Подумайте о таких группах, как «Языки», «Подготовка к экзаменам» или «Идеи для проектов»..',
  edit: 'Переименуйте группу так, чтобы ее название отражало карты внутри неё.',
};

const SUBMIT_LABEL: Record<GroupModalProps['mode'], string> = {
  create: 'Создать группу',
  edit: 'Сохранить',
};

const GroupModal = ({
  open,
  mode,
  onClose,
  onSubmit,
  defaultName = '',
}: GroupModalProps) => {
  const [name, setName] = useState(defaultName);
  const trimmed = useMemo(() => name.trim(), [name]);

  useEffect(() => {
    if (open) {
      setName(defaultName);
    }
  }, [open, defaultName]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmed) return;
    onSubmit(trimmed);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={TITLE[mode]}
      description={DESCRIPTION[mode]}
      width="md"
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col gap-2 text-sm text-[#333]">
          <span>Название группы</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder='например "Когнитивная психология"'
            className="h-12 w-full rounded-xl border border-black/10 bg-[#f7f7f9] px-4 text-base transition focus:border-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
            autoFocus
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="h-11 rounded-xl border border-black/10 px-5 text-sm font-medium text-[#333] transition hover:border-black/30 hover:text-black"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!trimmed}
            className="h-11 rounded-xl bg-[#111] px-5 text-sm font-semibold text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:bg-[#c7c7cc]"
          >
            {SUBMIT_LABEL[mode]}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupModal;
