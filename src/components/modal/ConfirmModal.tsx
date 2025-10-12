'use client';

import Modal from './Modal';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
};

const DEFAULT_CONFIRM = 'Удалить';
const DEFAULT_CANCEL = 'Отмена';

const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = DEFAULT_CONFIRM,
  cancelLabel = DEFAULT_CANCEL,
  onClose,
  onConfirm,
}: ConfirmModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    width="sm"
    footer={
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="h-11 rounded-xl border border-black/10 px-5 text-sm font-medium text-[#333] transition hover:border-black/30 hover:text-black"
          onClick={onClose}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className="h-11 rounded-xl bg-[#d93829] px-5 text-sm font-semibold text-white transition hover:bg-[#b52c1f]"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    }
  >
    <></>
  </Modal>
);

export default ConfirmModal;

