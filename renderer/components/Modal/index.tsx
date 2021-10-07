import { forwardRef, PropsWithChildren, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import classNames from 'classnames';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export type Ref = {
  close: () => void;
};

const Modal = forwardRef<Ref, PropsWithChildren<Props>>(({ isOpen, onClose, children }, ref) => {
  const refRenderTime = useRef(0);
  const [isTransitionStart, setIsTransitionStart] = useState(false);
  const handleTransitionEnd = useCallback(() => {
    setIsTransitionStart(false);
  }, []);
  const handleSectionClick = useCallback(e => e.stopPropagation(), []);
  const handleClose = useCallback(() => {
    setIsTransitionStart(true);
    onClose();
    refRenderTime.current = 0;
  }, [onClose]);
  useEffect(() => {
    refRenderTime.current += 1;
    if (refRenderTime.current > 1) {
      setIsTransitionStart(true);
    }
  }, [isOpen]);
  useImperativeHandle(ref, () => ({
    close: handleClose,
  }));
  return (
    <div
      className={classNames(
        isOpen ? 'opacity-100' : 'opacity-0',
        isOpen && !isTransitionStart ? 'z-10' : '',
        !isOpen && !isTransitionStart ? '-z-10' : '',
        'fixed transition duration-300 ease-in-out inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80'
      )}
      onClick={handleClose}
      onTransitionEnd={handleTransitionEnd}
      aria-modal="true"
    >
      <section
        onClick={handleSectionClick}
        className="relative px-4 py-4 text-gray-400 bg-gray-900 rounded shadow-lg table-auto md:px-8 md:py-8 -mt-30 transition duration-300 ease-in-out body-font"
      >
        {children}
      </section>
    </div>
  );
});

export default Modal;
