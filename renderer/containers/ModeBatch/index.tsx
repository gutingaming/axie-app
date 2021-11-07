import React, { useCallback, useRef, useState } from "react";
import cx from "classnames";
import csvToJson from "csvtojson";

import useAxieAccounts from "../../hooks/useAxieAccounts";
import { transferSlp } from "../../api/transferSlp";

type ToAccount = {
  [ronin_address: string]: {
    balance: number;
  };
};

function ModeBatch() {
  const csvInput = useRef(null);
  const { accounts, mainAccount, balances } = useAxieAccounts();

  if (accounts.length === 0)
    return (
      <div className="flex flex-col items-center justify-center w-screen mt-48">
        <p className="w-full mb-5 leading-relaxed text-center text-gray-400 lg:w-1/2 text-opacity-90">
          你需要一個 Ronin 錢包
        </p>
      </div>
    );

  const [selectedRoninAddress, setSelectedRoninAddress] = useState(
    mainAccount.ronin_address
  );
  const [transactions, setTransactions] = useState<{ [key: string]: string }>(
    JSON.parse(localStorage?.transactions || "{}")
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>(
    JSON.parse(localStorage?.errors || "{}")
  );
  const [toAccounts, setToAccounts] = useState<ToAccount>(
    JSON.parse(localStorage?.toAccounts || "{}")
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

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
  const handleConfirmTransfer = useCallback(() => {
    const totalOutputSlp = Object.values(toAccounts).reduce(
      (result, { balance }) => (result += Number(balance)),
      0
    );
    if (totalOutputSlp > balances[selectedRoninAddress]) {
      window.alert("餘額不足，無法進行轉帳。");
      return;
    }

    if (confirm("確認轉出資訊無誤，執行批次轉帳？")) {
      const seqPromises = (promises) => {
        return promises.reduce((prev, promise) => {
          return prev.then(promise).catch((err) => {
            console.warn("err", err.message);
          });
        }, Promise.resolve());
      };

      setIsExecuting(true);

      seqPromises(
        Object.keys(toAccounts).map((ronin_address) =>
          transferSlp({
            fromAddress: selectedRoninAddress,
            toAddress: ronin_address,
            privateKey: accounts.find(
              (account) => account.ronin_address === selectedRoninAddress
            ).private_key,
            balance: Number(toAccounts[ronin_address].balance),
          })
            .then((data) => {
              const { to: to_address, transactionHash } = data;
              const toAddresss = to_address.replace("0x", "ronin:");
              console.log(data);
              if (transactionHash) {
                changeTransaction(transactionHash, toAddresss);
              }
            })
            .catch((err) => {
              changeError(err, ronin_address);
            })
        )
      );
    }
  }, [accounts, mainAccount, toAccounts, changeError, changeTransaction]);
  const handleCsvImportClick = useCallback(() => {
    csvInput.current.value = "";
    localStorage.toAccounts = JSON.stringify({});
    localStorage.errors = JSON.stringify({});
    localStorage.transactions = JSON.stringify({});
    setToAccounts({});
    setErrors({});
    setTransactions({});
    setIsExecuting(false);
    csvInput.current.click();
  }, [setIsExecuting, setTransactions, setErrors]);
  const handleCsvImport = useCallback((e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const result = event.target.result.toString();
      csvToJson({ noheader: true, ignoreEmpty: true })
        .fromString(result)
        .then((json) => {
          const newToAccounts = json.reduce((result, { field1, field2 }) => {
            result[field2] = {
              balance: field1 as number,
            };
            return result;
          }, {});
          localStorage.toAccounts = JSON.stringify(newToAccounts);
          setToAccounts(newToAccounts);
        });
    };
    reader.readAsText(file);
  }, []);

  const isConfirmButtonDisabled =
    Object.keys(toAccounts).length <= 0 || isExecuting;

  return (
    <>
      <div className="p-5">
        <table className="w-full py-5 text-left text-gray-400 whitespace-no-wrap table-auto">
          <thead>
            <tr>
              <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tl rounded-bl title-font">
                名稱
              </th>
              <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                Ronin 錢包地址
              </th>
              <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tr rounded-br title-font">
                持有 SLP
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
              onClick={handleCsvImportClick}
              className="inline-flex items-center float-right px-3 py-1 mr-3 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
            >
              匯入CSV
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
              提醒：開啟轉帳成功連結並不會馬上看到交易明細，需稍待 30 秒至 1
              分鐘。
            </p>
          </div>
          <div className="float-right mb-6">
            <button
              onClick={handleConfirmTransfer}
              className={cx(
                "inline-flex items-center float-right px-3 py-1 text-base bg-indigo-500 border-0 rounded focus:outline-none md:mt-0",
                isConfirmButtonDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-indigo-600"
              )}
              disabled={isConfirmButtonDisabled}
            >
              確認轉帳
            </button>
          </div>
          <table className="w-full py-5 text-left text-gray-400 whitespace-no-wrap table-auto">
            <thead>
              <tr>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tl rounded-bl title-font">
                  編號
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                  轉出錢包地址
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                  轉出 SLP
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                  轉入錢包地址
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tr rounded-br title-font">
                  執行結果
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(toAccounts).map((ronin_address, id) => {
                const { balance } = toAccounts[ronin_address];
                return (
                  <tr key={ronin_address}>
                    <td className="px-4 py-3">{id + 1}</td>
                    <td className="px-4 py-3">
                      <div
                        title={selectedRoninAddress}
                        className="w-32 overflow-hidden overflow-ellipsis"
                      >
                        {selectedRoninAddress}
                      </div>
                    </td>
                    <td className="px-4 py-3">{balance}</td>
                    <td className="px-4 py-3">
                      <div
                        title={ronin_address}
                        className="w-32 overflow-hidden overflow-ellipsis"
                      >
                        {ronin_address}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {transactions[ronin_address] ? (
                        <a
                          href={`https://explorer.roninchain.com/tx/${transactions[ronin_address]}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-indigo-400 hover:text-indigo-500"
                        >
                          轉帳成功
                        </a>
                      ) : (
                        ""
                      )}
                      {errors[ronin_address] ? errors[ronin_address] : ""}
                      {isExecuting &&
                      !transactions[ronin_address] &&
                      !errors[ronin_address]
                        ? "執行中..."
                        : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ModeBatch;
