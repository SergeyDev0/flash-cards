'use client';

import { X } from 'lucide-react';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import clsx from 'clsx';

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  width?: 'sm' | 'md' | 'lg';
};

const MODAL_WIDTH: Record<NonNullable<ModalProps['width']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

const Modal = ({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  width = 'md',
}: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const widthClass = useMemo(
    () => MODAL_WIDTH[width] ?? MODAL_WIDTH.md,
    [width],
  );

  const closeOnEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, closeOnEscape]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div
        className={clsx(
          'relative w-full rounded-3xl bg-white p-6 shadow-2xl transition-all',
          widthClass,
        )}
      >
        <button
          type="button"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/70 transition hover:bg-black hover:text-white"
          onClick={onClose}
          aria-label="Закрыть модальное окно"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="pr-12">
          <h2 className="text-xl font-semibold text-[#111]">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm text-[#555]">{description}</p>
          ) : null}
        </div>
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
};

export default Modal;

