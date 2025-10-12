'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Modal from './Modal';

type CardModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (data: { title: string; front: string; back: string }) => void;
  defaultValues?: {
    title?: string;
    front?: string;
    back?: string;
  };
};

const TITLE: Record<CardModalProps['mode'], string> = {
  create: 'Создать карточку',
  edit: 'Изменить карточку',
};

const DESCRIPTION: Record<CardModalProps['mode'], string> = {
  create:
    'Опишите вопрос на лицевой стороне и подробный ответ на обороте. Вопрос должен быть кратким и понятным.',
  edit: 'Сформулируйте формулировку так, чтобы карточку было легче вспомнить.',
};

const SUBMIT_LABEL: Record<CardModalProps['mode'], string> = {
  create: 'Создать карточку',
  edit: 'Сохранить карточку',
};

const CardModal = ({
  open,
  mode,
  onClose,
  onSubmit,
  defaultValues,
}: CardModalProps) => {
  const [title, setTitle] = useState(defaultValues?.title ?? '');
  const [front, setFront] = useState(defaultValues?.front ?? '');
  const [back, setBack] = useState(defaultValues?.back ?? '');

  const isValid = useMemo(
    () => Boolean(title.trim() && front.trim() && back.trim()),
    [title, front, back],
  );

  useEffect(() => {
    if (open) {
      setTitle(defaultValues?.title ?? '');
      setFront(defaultValues?.front ?? '');
      setBack(defaultValues?.back ?? '');
    }
  }, [open, defaultValues?.title, defaultValues?.front, defaultValues?.back]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;
    onSubmit({
      title: title.trim(),
      front: front.trim(),
      back: back.trim(),
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={TITLE[mode]}
      description={DESCRIPTION[mode]}
      width="lg"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col gap-2 text-sm text-[#333]">
          <span>Название карточки</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Краткое название списка"
            className="h-12 rounded-xl border border-black/10 bg-[#f7f7f9] px-4 text-base transition focus:border-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-[#333]">
          <span>Передняя сторона</span>
          <textarea
            rows={4}
            value={front}
            onChange={(event) => setFront(event.target.value)}
            placeholder="Вопрос или подсказка"
            className="w-full rounded-xl border border-black/10 bg-[#f7f7f9] px-4 py-3 text-base transition focus:border-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-[#333]">
          <span>Задняя сторона</span>
          <textarea
            rows={4}
            value={back}
            onChange={(event) => setBack(event.target.value)}
            placeholder="Подробный ответ"
            className="w-full rounded-xl border border-black/10 bg-[#f7f7f9] px-4 py-3 text-base transition focus:border-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="h-11 rounded-xl border border-black/10 px-5 text-sm font-medium text-[#333] transition hover:border-black/30 hover:text-black"
            onClick={onClose}
          >
            Отменить
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="h-11 rounded-xl bg-[#111] px-5 text-sm font-semibold text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:bg-[#c7c7cc]"
          >
            {SUBMIT_LABEL[mode]}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CardModal;
