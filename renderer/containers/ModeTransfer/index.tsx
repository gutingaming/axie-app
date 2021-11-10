import React, { useCallback, useRef, useState } from "react";
import csvToJson from "csvtojson";

import useAxieAccounts from "../../hooks/useAxieAccounts";
import { transferSlp } from "../../api/transferSlp";

type ToAccount = {
  [ronin_address: string]: {
    outputSlp: number;
  };
};

function ModeTransfer() {
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
        window.alert("餘額不足，無法進行轉帳。");
        return;
      }

      if (confirm("確認轉出資訊無誤，執行單筆轉帳？")) {
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
          });
      }
    },
    [
      balances,
      selectedRoninAddress,
      selectedPrivateKey,
      toAccounts,
      changeError,
      changeTransaction,
    ]
  );
  const handleCsvImportClick = useCallback(() => {
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
          const newToAccounts = json.reduce((result, { field1, field2 }) => {
            result[field2] = {
              outputSlp: field1 as number,
            };
            return result;
          }, {});
          localStorage.toAccounts = JSON.stringify(newToAccounts);
          setToAccounts(newToAccounts);
        });
    };
    reader.readAsText(file);
  }, []);

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
              提醒：點擊轉帳成功並不會馬上看到交易明細，需稍待 30 秒至 1 分鐘。
            </p>
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
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                  操作
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tr rounded-br title-font">
                  執行結果
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(toAccounts).map((toAddress, id) => {
                const { outputSlp } = toAccounts[toAddress];
                return (
                  <tr key={toAddress}>
                    <td className="px-4 py-3">{id + 1}</td>
                    <td className="px-4 py-3">
                      <div
                        title={selectedRoninAddress}
                        className="w-32 overflow-hidden overflow-ellipsis"
                      >
                        {selectedRoninAddress}
                      </div>
                    </td>
                    <td className="px-4 py-3">{outputSlp}</td>
                    <td className="px-4 py-3">
                      <div
                        title={toAddress}
                        className="w-32 overflow-hidden overflow-ellipsis"
                      >
                        {toAddress}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        onClick={() =>
                          handleSingleTransfer(outputSlp, toAddress)
                        }
                        className="mr-5 cursor-pointer hover:text-white"
                      >
                        轉帳
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {transactions[toAddress] ? (
                        <a
                          href={`https://explorer.roninchain.com/tx/${transactions[toAddress]}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-indigo-400 hover:text-indigo-500"
                        >
                          轉帳成功
                        </a>
                      ) : (
                        ""
                      )}
                      {errors[toAddress] ? errors[toAddress] : ""}
                      {!executing[toAddress] ||
                      transactions[toAddress] ||
                      errors[toAddress]
                        ? ""
                        : "執行中..."}
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

export default ModeTransfer;
