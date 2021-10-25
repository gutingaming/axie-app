import React, { useCallback, useState } from "react";

import useAxieAccounts from "../../hooks/useAxieAccounts";

function ModeBatch() {
  const { accounts, mainAccount, balances } = useAxieAccounts();
  const [selectedRoninAddress, setSelectedRoninAddress] = useState(
    mainAccount.ronin_address
  );

  const handleAccountChange = useCallback((e) => {
    setSelectedRoninAddress(e.target.value);
  }, []);
  const handleConfirmTransfer = useCallback(() => {
    if (confirm("Are you sure to transfer SLP to these accounts?")) {
      // TODO: transfer process
      console.log("transfered");
    }
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
                    <option key={ronin_address} value={ronin_address} selected={is_main_account}>
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
              onClick={() => {}}
              className="inline-flex items-center float-right px-3 py-1 mr-3 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
            >
              新增轉出
            </button>
          </div>
          <div className="float-left mb-6">
            <button
              onClick={() => {}}
              className="inline-flex items-center float-right px-3 py-1 mr-3 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
            >
              匯入CSV
            </button>
          </div>
          <div className="float-left mb-6">
            <button
              onClick={() => {}}
              className="inline-flex items-center float-right px-3 py-1 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
            >
              清除全部
            </button>
          </div>
          <div className="float-right mb-6">
            <button
              onClick={handleConfirmTransfer}
              className="inline-flex items-center float-right px-3 py-1 text-base bg-indigo-500 border-0 rounded focus:outline-none hover:bg-indigo-600 md:mt-0"
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
              <tr>
                <td className="px-4 py-3">1</td>
                <td className="px-4 py-3">
                  <div className="w-32 overflow-hidden overflow-ellipsis">
                    xxxxxxxxxxxxxxxxxxxxxxxx
                  </div>
                </td>
                <td className="px-4 py-3">0.1</td>
                <td className="px-4 py-3">
                  <div className="w-32 overflow-hidden overflow-ellipsis">
                    xxxxxxxxxxxxxxxxxxxxxxxx
                  </div>
                </td>
                <td className="px-4 py-3">成功</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ModeBatch;
