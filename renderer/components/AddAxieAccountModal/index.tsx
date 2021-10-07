import { FC, useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";

import Modal, { Ref as ModalRef } from "../Modal";

export type Payload = {
  name: string;
  ronin_address: string;
  private_key: string;
};

interface Props {
  isModalOpen: boolean;
  onSubmit: (payload: Payload) => Promise<boolean>;
  onClose: () => void;
}

const AddAxieAccountModal: FC<Props> = ({ isModalOpen, onSubmit, onClose }) => {
  const modalRef = useRef<ModalRef>(null);
  const [isFormError, setIsFormError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [roninAddress, setRoninAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const handleNameChange = useCallback((e) => {
    setName(e.target.value);
  }, []);
  const handleRoninAddressChange = useCallback((e) => {
    setRoninAddress(e.target.value);
  }, []);
  const handlePrivateKeyChange = useCallback((e) => {
    setPrivateKey(e.target.value);
  }, []);
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    if (name === "" || roninAddress === "" || privateKey === "") {
      setIsFormError(true);
      setIsSubmitting(false);
      return;
    }
    setIsFormError(false);
    const success = await onSubmit({
      name,
      ronin_address: roninAddress,
      private_key: privateKey,
    });
    if (success) {
      modalRef.current?.close();
    }
    setIsSubmitting(false);
  }, [onSubmit, name, roninAddress, privateKey]);

  useEffect(() => {
    setName("");
    setRoninAddress("");
    setPrivateKey("");
  }, [isModalOpen]);
  return (
    <Modal ref={modalRef} isOpen={isModalOpen} onClose={onClose}>
      <h2 className="mb-5 text-lg font-medium text-white title-font">
        新增錢包
      </h2>
      <div className="relative flex py-5 mx-auto sm:items-center">
        <div className="absolute inset-0 flex items-center justify-center w-6 h-full">
          <div className="w-1 h-full bg-gray-800 pointer-events-none" />
        </div>
        <div className="relative z-10 inline-flex items-center justify-center flex-shrink-0 w-6 h-6 mt-10 text-sm font-medium text-white bg-indigo-500 rounded-full sm:mt-0 title-font">
          1
        </div>
        <div className="flex flex-col items-start flex-grow pl-6 md:pl-8 sm:items-center sm:flex-row">
          <p className="w-4/5 leading-relaxed">
            <label
              htmlFor="player-name"
              className="text-sm text-gray-400 leading-7"
            >
              名稱
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleNameChange}
              className="w-full px-3 py-1 text-base text-gray-100 bg-gray-600 border border-gray-600 rounded outline-none bg-opacity-20 focus:bg-transparent focus:ring-2 focus:ring-indigo-900 focus:border-indigo-500 leading-8 transition-colors duration-200 ease-in-out"
            />
          </p>
        </div>
      </div>
      <div className="relative flex pb-5 mx-auto sm:items-center">
        <div className="absolute inset-0 flex items-center justify-center w-6 h-full">
          <div className="w-1 h-full bg-gray-800 pointer-events-none" />
        </div>
        <div className="relative z-10 inline-flex items-center justify-center flex-shrink-0 w-6 h-6 mt-10 text-sm font-medium text-white bg-indigo-500 rounded-full sm:mt-0 title-font">
          2
        </div>
        <div className="flex flex-col items-start flex-grow pl-6 md:pl-8 sm:items-center sm:flex-row">
          <p className="w-4/5 leading-relaxed">
            <label
              htmlFor="ronin-address"
              className="text-sm text-gray-400 leading-7"
            >
              Ronin 錢包位址
            </label>
            <input
              type="text"
              id="ronin-address"
              name="ronin-address"
              value={roninAddress}
              onChange={handleRoninAddressChange}
              className="w-full px-3 py-1 text-base text-gray-100 bg-gray-600 border border-gray-600 rounded outline-none bg-opacity-20 focus:bg-transparent focus:ring-2 focus:ring-indigo-900 focus:border-indigo-500 leading-8 transition-colors duration-200 ease-in-out"
            />
          </p>
        </div>
      </div>
      <div className="relative flex pb-5 mx-auto sm:items-center">
        <div className="absolute inset-0 flex items-center justify-center w-6 h-full">
          <div className="w-1 h-full bg-gray-800 pointer-events-none" />
        </div>
        <div className="relative z-10 inline-flex items-center justify-center flex-shrink-0 w-6 h-6 mt-10 text-sm font-medium text-white bg-indigo-500 rounded-full sm:mt-0 title-font">
          3
        </div>
        <div className="flex flex-col items-start flex-grow pl-6 md:pl-8 sm:items-center sm:flex-row">
          <p className="w-4/5 leading-relaxed">
            <label
              htmlFor="ronin-address"
              className="text-sm text-gray-400 leading-7"
            >
              私鑰 (Private Key)
            </label>
            <input
              type="text"
              id="private-key"
              name="private-key"
              value={privateKey}
              onChange={handlePrivateKeyChange}
              className="w-full px-3 py-1 text-base text-gray-100 bg-gray-600 border border-gray-600 rounded outline-none bg-opacity-20 focus:bg-transparent focus:ring-2 focus:ring-indigo-900 focus:border-indigo-500 leading-8 transition-colors duration-200 ease-in-out"
            />
          </p>
        </div>
      </div>
      {isFormError && (
        <div className="mt-3 text-sm text-center text-red-700">
          請正確填寫所有欄位
        </div>
      )}
      <button
        className={classNames(
          isSubmitting
            ? "opacity-50 cursor-not-allowed"
            : "opacity-100 hover:bg-indigo-500 focus:outline-none",
          "w-full px-8 py-2 mt-3 text-lg text-white bg-indigo-600 border-0 rounded"
        )}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "送出中..." : "送出"}
      </button>
    </Modal>
  );
};

export default AddAxieAccountModal;
