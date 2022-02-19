import React, { useCallback, useRef, useState } from "react";
import csvToJson from "csvtojson";

import * as i18n from "../../constants/locale";
import useAxieAccounts from "../../hooks/useAxieAccounts";
import { LANG } from "../../hooks/useLang";
import useModalHandlers from "../../hooks/useModalHandlers";
import { transferSlp } from "../../api/transferSlp";
import ImportTransactionCsvModal from "../../components/ImportTransactionCsvModal";

type ToAccount = {
  [ronin_address: string]: {
    name: string;
    outputSlp: number;
    address: string;
  };
};

function ModeTransfer({ lang }: { lang: LANG }) {
  const csvInput = useRef(null);
  const { accounts, forceUpdate, mainAccount, balances } = useAxieAccounts();

  if (accounts.length === 0)
    return (
      <div className="flex flex-col items-center justify-center w-screen mt-48">
        <p className="w-full mb-5 leading-relaxed text-center text-gray-400 lg:w-1/2 text-opacity-90">
          {i18n.requireAxieAccountI18n[lang]}
        </p>
      </div>
    );

  const [selectedRoninAddress, setSelectedRoninAddress] = useState(
    mainAccount.ronin_address
  );
  const selectedPrivateKey = accounts.find(
    (account) => account.ronin_address === selectedRoninAddress
  ).private_key;
  const [transactions, setTransactions] = useState<{ [key: string]: string }>(
    JSON.parse(localStorage?.transactions || "{}")
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>(
    JSON.parse(localStorage?.errors || "{}")
  );
  const [toAccounts, setToAccounts] = useState<ToAccount>(
    JSON.parse(localStorage?.toAccounts || "{}")
  );
  const [executing, setExecuting] = useState<{ [key: string]: boolean }>({});

  const {
    isModalOpen: isImportTransactionModalOpen,
    open: openImportTransactionModal,
    close: closeImportTransactionModal,
  } = useModalHandlers();

  const changeTransaction = useCallback(
    (transaction_hash: string, ronin_address: string) => {
      const newTransactions = {
        ...transactions,
        [ronin_address]: transaction_hash,
      };
      localStorage.transactions = JSON.stringify(newTransactions);
      setTransactions(newTransactions);
    },
    [transactions]
  );

  const changeError = useCallback(
    (error: string, ronin_address: string) => {
      const newErrors = {
        ...errors,
        [ronin_address]: `${error}`,
      };
      localStorage.errors = JSON.stringify(newErrors);
      setErrors(newErrors);
    },
    [errors]
  );

  const handleAccountChange = useCallback((e) => {
    setSelectedRoninAddress(e.target.value);
  }, []);
  const handleSingleTransfer = useCallback(
    (outputSlp: number, toAddress: string) => {
      const fromAddress = selectedRoninAddress;
      const privateKey = selectedPrivateKey;
      if (balances[fromAddress] === 0 || balances[fromAddress] < outputSlp) {
        window.alert(i18n.notEnoughBalanceI18n[lang]);
        return;
      }

      if (confirm(i18n.confirmTransferI18n[lang])) {
        setExecuting({
          ...executing,
          [toAddress]: true,
        });
        transferSlp({
          fromAddress,
          toAddress,
          privateKey,
          balance: Number(toAccounts[toAddress].outputSlp),
        })
          .then((data) => {
            const { to: roninAddress, transactionHash } = data;
            const ethAddresss = roninAddress.replace("0x", "ronin:");
            console.log(data);
            if (transactionHash) {
              changeTransaction(transactionHash, ethAddresss);
            }
          })
          .catch((err) => {
            changeError(err, toAddress);
          })
          .finally(() => {
            setExecuting({
              ...executing,
              [toAddress]: false,
            });
            forceUpdate();
          });
      }
    },
    [
      lang,
      balances,
      selectedRoninAddress,
      selectedPrivateKey,
      toAccounts,
      changeError,
      changeTransaction,
    ]
  );
  const handleImportTransactionModalSubmit = useCallback(() => {
    csvInput.current.value = "";
    localStorage.toAccounts = JSON.stringify({});
    localStorage.errors = JSON.stringify({});
    localStorage.transactions = JSON.stringify({});
    setToAccounts({});
    setErrors({});
    setTransactions({});
    csvInput.current.click();
  }, [setTransactions, setErrors]);
  const handleCsvImport = useCallback((e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const result = event.target.result.toString();
      csvToJson({ noheader: true, ignoreEmpty: true })
        .fromString(result)
        .then((json) => {
          const newToAccounts = json.reduce(
            (result, { field1, field2, field3 }) => {
              if (Number.isNaN(Number(field2))) {
                return result;
              }
              result[`${field1}-${field3}`] = {
                name: field1 as string,
                outputSlp: field2 as number,
                address: field3 as string,
              };
              return result;
            },
            {}
          );
          if (Object.keys(newToAccounts).length > 0) {
            localStorage.toAccounts = JSON.stringify(newToAccounts);
            setToAccounts(newToAccounts);
            closeImportTransactionModal();
          } else {
            window.alert(i18n.invalidCsvFormatI18n[lang]);
          }
        });
    };
    reader.readAsText(file);
  }, [lang]);

  return (
    <>
      <div className="p-5">
        <table className="w-full py-5 text-left text-gray-400 whitespace-no-wrap table-auto">
          <thead>
            <tr>
              <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tl rounded-bl title-font">
                {i18n.nameI18n[lang]}
              </th>
              <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                {i18n.walletAddressI18n[lang]}
              </th>
              <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tr rounded-br title-font">
                {i18n.balanceI18n[lang]}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3">
                <select
                  onChange={handleAccountChange}
                  className="py-2 pl-3 pr-10 bg-transparent border border-gray-700 rounded appearance-none focus:ring-2 focus:ring-indigo-900 focus:outline-none focus:border-indigo-500"
                >
                  {accounts.map(({ name, is_main_account, ronin_address }) => (
                    <option
                      key={ronin_address}
                      value={ronin_address}
                      selected={is_main_account}
                    >
                      {name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">{selectedRoninAddress}</td>
              <td className="px-4 py-3">{balances[selectedRoninAddress]}</td>
            </tr>
          </tbody>
        </table>
        <div className="pt-5 mt-5 border-t-2 border-gray-800">
          <div className="float-left mb-6">
            <button
              onClick={openImportTransactionModal}
              className="inline-flex items-center float-right px-3 py-1 mr-3 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
            >
              {i18n.importCsvI18n[lang]}
            </button>
            <input
              ref={csvInput}
              type="file"
              accept=".csv"
              onChange={handleCsvImport}
              hidden
            />
          </div>
          <div className="float-left mb-6">
            <p className="w-full text-sm text-gray-500 leading-8">
              {i18n.tipForTransferDetailI18n[lang]}
            </p>
          </div>
          <table className="w-full py-5 text-left text-gray-400 whitespace-no-wrap table-auto">
            <thead>
              <tr>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tl rounded-bl title-font">
                  {i18n.nameI18n[lang]}
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                  {i18n.slpAmtI18n[lang]}
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                  {i18n.toWalletAddressI18n[lang]}
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                  {i18n.actionsI18n[lang]}
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tr rounded-br title-font">
                  {i18n.execResultI18n[lang]}
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(toAccounts).map((key) => {
                const { name, outputSlp, address } = toAccounts[key];
                return (
                  <tr key={address}>
                    <td className="px-4 py-3">{name}</td>
                    <td className="px-4 py-3">{outputSlp}</td>
                    <td className="px-4 py-3">
                      <div
                        title={address}
                        className="w-full overflow-hidden overflow-ellipsis"
                      >
                        {address}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        onClick={() =>
                          handleSingleTransfer(outputSlp, address)
                        }
                        className="mr-5 cursor-pointer hover:text-white"
                      >
                        {i18n.transferI18n[lang]}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {transactions[address] ? (
                        <a
                          href={`https://explorer.roninchain.com/tx/${transactions[address]}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-indigo-400 hover:text-indigo-500"
                        >
                          {i18n.transactionDetailI18n[lang]}
                        </a>
                      ) : (
                        ""
                      )}
                      {errors[address] ? errors[address] : ""}
                      {!executing[address] ||
                      transactions[address] ||
                      errors[address]
                        ? ""
                        : i18n.executingI18n[lang]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ImportTransactionCsvModal
        lang={lang}
        isModalOpen={isImportTransactionModalOpen}
        onSubmit={handleImportTransactionModalSubmit}
        onClose={closeImportTransactionModal}
      />
    </>
  );
}

export default ModeTransfer;
