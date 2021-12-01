import { FC } from "react";

import * as i18n from "../../constants/locale";
import { LANG } from "../../hooks/useLang";
import Modal from "../Modal";

export type Payload = {
  name: string;
  ronin_address: string;
  private_key: string;
};

interface Props {
  lang: LANG;
  isModalOpen: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

const ImportAxieAccountCsvModal: FC<Props> = ({
  lang,
  isModalOpen,
  onSubmit,
  onClose,
}) => {
  return (
    <Modal isOpen={isModalOpen} onClose={onClose}>
      <h2 className="mb-5 text-lg font-medium text-white title-font">
        {i18n.importCsvI18n[lang]}
      </h2>
      <p className="my-2">{i18n.csvFormatI18n[lang]}</p>
      <div className="p-5 bg-gray-800 rounded w-96 bg-opacity-40">
        {i18n.axieAccountCsvFormatI18n[lang]}
      </div>
      <p className="my-2">sample.csv</p>
      <div className="p-5 bg-gray-800 rounded w-96 bg-opacity-40">
        my_account1,ronin:xxxxxxxxxx...,0xaaaaaa...
        my_account2,ronin:xxxxxxxxxx...,0xaaaaaa...
        my_account3,ronin:xxxxxxxxxx...,0xaaaaaa...
      </div>
      <div className="flex justify-center mt-5">
        <button
          onClick={onSubmit}
          className="inline-flex items-center px-3 py-1 mr-3 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
        >
          {i18n.browseFileI18n[lang]}
        </button>
      </div>
    </Modal>
  );
};

export default ImportAxieAccountCsvModal;
