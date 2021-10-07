import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import AddAxieAccountModal, {
  Payload,
} from "../components/AddAxieAccountModal";
import LoadingMask from "../components/LoadingMask";
import useModalHandlers from "../hooks/useModalHandlers";
import balanceOfSlpAPI from "../api/balanceOfSlp";
import randomMessageAPI from "../api/randomMessage";
import jwtAccessToken from "../api/jwtAccessToken";
import claimSlp from "../api/claimSlp";
import transferSlp from "../api/transferSlp";

type AxieAccount = {
  name: string;
  ronin_address: string;
  private_key: string;
  is_main_account: boolean;
};

function Home() {
  if (typeof window === "undefined") return <></>;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<AxieAccount[]>(
    JSON.parse(localStorage?.axieAccounts || "[]")
  );
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const mainAccount = accounts.find(({ is_main_account }) => is_main_account);

  useEffect(() => {
    (async function () {
      const results = await Promise.all(
        accounts.map(({ ronin_address }) =>
          balanceOfSlpAPI({ roninAddress: ronin_address })
        )
      );
      setBalances(results.reduce((r, v) => Object.assign(r, v), {}));
    })();
  }, [accounts]);

  const {
    isModalOpen: isAddAxieAccountModalOpen,
    open: openAddAxieAccountModal,
    close: closeAddAxieAccountModal,
  } = useModalHandlers();

  const handleAddAxieAccountModalSubmit = useCallback(
    async (payload: Payload) => {
      const { name, ronin_address, private_key } = payload;
      const foundAccount = accounts.find(
        ({ ronin_address: roninAddress }) => roninAddress === ronin_address
      );
      if (!foundAccount) {
        const newAccounts = [].concat(accounts, {
          is_main_account: accounts.length === 0,
          name,
          ronin_address,
          private_key,
        });
        localStorage.axieAccounts = JSON.stringify(newAccounts);
        setAccounts(newAccounts);
      }
      return !!foundAccount ? false : true;
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

    const data = await claimSlp({
      address,
      accessToken,
    });

    if (data.error) {
      window.alert(`${data.error}\n${data.details.map(({ code }) => code)}`);
    }
    setIsLoading(false);
    console.log(data);
  }, []);
  const handleTransfer = useCallback(async (payload) => {
    const {
      ronin_address: fromAddress,
      private_key: privateKey,
      main_account: toAddress,
    } = payload;

    if (toAddress === "" || fromAddress === "" || privateKey === "") return;
    setIsLoading(true);

    const data = await transferSlp({
      fromAddress,
      toAddress,
      privateKey,
    });
    if (data.transactionHash) {
      window.alert("transaction success");
      window.location.reload();
    }
    setIsLoading(false);
  }, [accounts]);

  return (
    <React.Fragment>
      <Head>
        <title>Axie Infinity Claim Tool</title>
      </Head>
      {accounts.length === 0 && (
        <div className="flex flex-col items-center justify-center w-screen h-screen">
          <p className="w-full mb-5 leading-relaxed text-center text-gray-400 lg:w-1/2 text-opacity-90">
            你需要一個 Ronin 錢包
          </p>
          <button
            onClick={() => openAddAxieAccountModal()}
            className="inline-flex items-center float-right px-4 py-2 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
          >
            新增
          </button>
        </div>
      )}
      {accounts.length > 0 && (
        <div className="p-5">
          <div className="float-right mb-6">
            <button
              onClick={() => openAddAxieAccountModal()}
              className="inline-flex items-center float-right px-3 py-1 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
            >
              新增錢包
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
                    Ronin 錢包位址
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
                        <div className="w-32 overflow-hidden overflow-ellipsis">
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
      )}
      <AddAxieAccountModal
        isModalOpen={isAddAxieAccountModalOpen}
        onSubmit={handleAddAxieAccountModalSubmit}
        onClose={closeAddAxieAccountModal}
      />
      <LoadingMask show={isLoading} />
    </React.Fragment>
  );
}

export default Home;
