import React, { useCallback, useRef, useState } from "react";
import csvToJson from "csvtojson";

import claimSlp from "../../api/claimSlp";
import profile from "../../api/profile";
import { transferAllSlp } from "../../api/transferSlp";
import AddAxieAccountModal, {
  Payload,
} from "../../components/AddAxieAccountModal";
import LoadingMask from "../../components/LoadingMask";
import useAxieAccounts from "../../hooks/useAxieAccounts";
import useModalHandlers from "../../hooks/useModalHandlers";
import randomMessageAPI from "../../api/randomMessage";
import jwtAccessToken from "../../api/jwtAccessToken";
import RoninChain from "../../utils/RoninChain";
import {testPrivateKey, testRoninAddress} from "../../utils/validation";

function ModeClaim() {
  const csvInput = useRef(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    accounts,
    mainAccount,
    setAccounts,
    balances,
    forceUpdate,
  } = useAxieAccounts();

  const {
    isModalOpen: isAddAxieAccountModalOpen,
    open: openAddAxieAccountModal,
    close: closeAddAxieAccountModal,
  } = useModalHandlers();

  const handleAddAxieAccountModalSubmit = useCallback(
    async (payload: Payload) => {
      let result = {
        success: true,
        error: "",
      };

      // find duplicated account
      const { name, ronin_address, private_key } = payload;
      const foundAccount = accounts.find(
        ({ ronin_address: roninAddress }) => roninAddress === ronin_address
      );
      if (foundAccount) {
        result.success = false;
        result.error = "錢包位址已存在";
        return result;
      }

      // find invalid private key
      try {
        const { data: randomMessage } = await randomMessageAPI();
        const { data: accessToken } = await jwtAccessToken({
          address: ronin_address,
          privateKey: private_key,
          randomMessage,
        });
        const data = await profile({ accessToken });
        console.log(data);
      } catch (err) {
        console.log(err);
        result.success = false;
        result.error = "Ronin 錢包位址與私鑰不匹配";
        return result;
      }

      // write into localstorage
      const newAccounts = [].concat(accounts, {
        is_main_account: accounts.length === 0,
        name,
        ronin_address,
        private_key,
      });
      localStorage.axieAccounts = JSON.stringify(newAccounts);
      setAccounts(newAccounts);

      return result;
    },
    [accounts]
  );

  const handleSetMainAccount = useCallback(
    (mainAccountAddress) => {
      const newAccounts = accounts.map((account) => ({
        ...account,
        is_main_account: account.ronin_address === mainAccountAddress,
      }));
      localStorage.axieAccounts = JSON.stringify(newAccounts);
      setAccounts(newAccounts);
    },
    [accounts]
  );

  const handleAxieAccountDelete = useCallback(
    ({ name, ronin_address }) => {
      if (confirm(`確定刪除錢包 ${name} ${ronin_address}`)) {
        const newAccounts = accounts.filter(
          ({ ronin_address: roninAddress }) => roninAddress !== ronin_address
        );
        localStorage.axieAccounts = JSON.stringify(newAccounts);
        setAccounts(newAccounts);
      }
    },
    [accounts]
  );

  const handleClaimSlp = useCallback(async (payload) => {
    const { ronin_address: address, private_key: privateKey } = payload;

    if (address === "" || privateKey === "") return;
    setIsLoading(true);

    const { data: randomMessage } = await randomMessageAPI();

    const { data: accessToken } = await jwtAccessToken({
      address,
      privateKey,
      randomMessage,
    });

    try {
      const {
        success,
        blockchain_related: {
          signature: { amount, signature, timestamp },
        },
        error,
        details,
      } = await claimSlp({
        address,
        accessToken,
      });

      if (!success || error) {
        throw new Error(`${error}\n${details.map(({ code }) => code)}`);
      }

      const result = await RoninChain.checkpoint(
        address,
        privateKey,
        amount,
        timestamp,
        signature
      );
      console.log(result);
      window.alert("收穫 SLP 成功");
      forceUpdate();
    } catch (err) {
      window.alert(`收穫 SLP 失敗\n${err}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTransfer = useCallback(
    async (payload) => {
      const {
        ronin_address: fromAddress,
        private_key: privateKey,
        main_account: toAddress,
      } = payload;

      if (toAddress === "" || fromAddress === "" || privateKey === "") return;
      setIsLoading(true);

      try {
        const data = await transferAllSlp({
          fromAddress,
          toAddress,
          privateKey,
        });
        if (data.transactionHash) {
          window.alert("轉帳成功");
          forceUpdate();
        }
      } catch (err) {
        window.alert(`轉帳失敗\n${err}`);
      } finally {
        setIsLoading(false);
      }
    },
    [accounts]
  );

  const handleCsvImportClick = useCallback(() => {
    csvInput.current.value = "";
    localStorage.axieAccounts = JSON.stringify([]);
    setAccounts([]);
    csvInput.current.click();
  }, [setAccounts]);
  const handleCsvImport = useCallback(
    (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = function (event) {
        const result = event.target.result.toString();
        csvToJson({ noheader: true, ignoreEmpty: true })
          .fromString(result)
          .then((json) => {
            const newAccounts = json.reduce(
              (result, { field1, field2, field3 }, index) => {
                if (!testRoninAddress(field2) || !testPrivateKey(field3)) {
                  console.log(`${field1} is not a valid wallet`);
                  return result;
                }
                result.push({
                  name: field1,
                  ronin_address: field2,
                  private_key: field3,
                  is_main_account: index === 0 ? true : false,
                });
                return result;
              },
              [].concat(accounts)
            );
            localStorage.axieAccounts = JSON.stringify(newAccounts);
            setAccounts(newAccounts);
          });
      };
      reader.readAsText(file);
    },
    [accounts]
  );
  return (
    <>
      <div className="p-5">
        <div className="float-left mb-6">
          <button
            onClick={openAddAxieAccountModal}
            className="inline-flex items-center float-right px-3 py-1 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
          >
            新增錢包
          </button>
        </div>
        <div className="float-left mb-6 ml-3">
          <button
            onClick={handleCsvImportClick}
            className="inline-flex items-center float-right px-3 py-1 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
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
        <div className="float-left mb-6 ml-3">
          <button
            onClick={forceUpdate}
            className="inline-flex items-center float-right px-3 py-1 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
          >
            刷新資料
          </button>
        </div>
        <div className="flex-1 text-gray-400 bg-gray-900 body-font">
          <table className="w-full text-left whitespace-no-wrap table-auto">
            <thead>
              <tr>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tl rounded-bl title-font">
                  名稱
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                  Ronin 錢包地址
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                  持有 SLP
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tr rounded-br title-font">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(
                ({ is_main_account, name, ronin_address, private_key }) => (
                  <tr key={ronin_address}>
                    <td className="px-4 py-3">
                      {name} {is_main_account ? "[主]" : ""}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        title={ronin_address}
                        className="w-32 overflow-hidden overflow-ellipsis"
                      >
                        {ronin_address}
                      </div>
                    </td>
                    <td className="px-4 py-3">{balances[ronin_address]}</td>
                    <td className="px-4 py-3">
                      <a
                        onClick={() =>
                          handleClaimSlp({ ronin_address, private_key })
                        }
                        className="mr-5 cursor-pointer hover:text-white"
                      >
                        收穫SLP
                      </a>
                      {!is_main_account && (
                        <a
                          onClick={() =>
                            handleTransfer({
                              ronin_address,
                              private_key,
                              main_account: mainAccount.ronin_address,
                            })
                          }
                          className="mr-5 cursor-pointer hover:text-white"
                        >
                          轉帳至主錢包
                        </a>
                      )}
                      {!is_main_account && (
                        <a
                          onClick={() => handleSetMainAccount(ronin_address)}
                          className="mr-5 cursor-pointer hover:text-white"
                        >
                          設為主錢包
                        </a>
                      )}
                      <a
                        onClick={() =>
                          handleAxieAccountDelete({ name, ronin_address })
                        }
                        className="mr-5 cursor-pointer hover:text-white"
                      >
                        刪除
                      </a>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AddAxieAccountModal
        isModalOpen={isAddAxieAccountModalOpen}
        onSubmit={handleAddAxieAccountModalSubmit}
        onClose={closeAddAxieAccountModal}
      />
      <LoadingMask show={isLoading} />
    </>
  );
}

export default ModeClaim;
