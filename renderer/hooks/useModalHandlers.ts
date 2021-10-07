import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";

export type Uuid = ReturnType<typeof uuid>;

interface IUseModalHandlersOutput<T> {
  /**
   * Usage: `<Component key={modalId} />`
   *
   * Force the component to re-mount every time it opens to reset its internal state
   */
  modalId: Uuid;
  modalValue: T | undefined;
  isModalOpen: boolean;
  open: (newModalValue?: T) => void;
  close: () => void;
  toggle: (newModalValue?: T) => void;
}

interface IUseModalHandlersOutputWithDefaultValue<T> {
  modalValue: T;
  isModalOpen: boolean;
  open: (newModalValue: T) => void;
  close: () => void;
  toggle: (newModalValue: T) => void;
}

/**
 * useModalHandlers can accept a default value,
 * can update the value when the modal be opened or closed,
 * and can get the value every time the hook be called
 */
function useModalHandlers<T>(): IUseModalHandlersOutput<T>;
function useModalHandlers<T>(
  defaultModalValue: T
): IUseModalHandlersOutputWithDefaultValue<T>;
function useModalHandlers<T>(
  defaultModalValue?: T
): IUseModalHandlersOutput<T> {
  const [modalId, setModalId] = useState<string>(uuid());
  const [modalValue, setModalValue] = useState(defaultModalValue);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const open = useCallback((newModalValue?: T) => {
    if (typeof newModalValue !== "undefined") {
      setModalValue(newModalValue);
    }
    setIsModalOpen(true);
    setModalId(uuid());
  }, []);

  const close = useCallback(() => {
    setModalValue(defaultModalValue);
    setIsModalOpen(false);
  }, [defaultModalValue]);

  const toggle = useCallback((newModalValue?: T) => {
    if (typeof newModalValue !== "undefined") {
      setModalValue(newModalValue);
    }
    setIsModalOpen((prev) => !prev);
  }, []);

  return {
    modalId,
    modalValue,
    isModalOpen,
    open,
    close,
    toggle,
  };
}

export default useModalHandlers;
