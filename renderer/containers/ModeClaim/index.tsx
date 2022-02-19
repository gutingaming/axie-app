import React, { useCallback, useRef, useState } from "react";
import csvToJson from "csvtojson";
import cx from "classnames";

import profile from "../../api/profile";
import { transferAllSlp } from "../../api/transferSlp";
import AddAxieAccountModal, {
  Payload,
} from "../../components/AddAxieAccountModal";
import ImportAxieAccountCsvModal from "../../components/ImportAxieAccountCsvModal";
import LoadingMask from "../../components/LoadingMask";
import * as i18n from "../../constants/locale";
import useAxieAccounts from "../../hooks/useAxieAccounts";
import useClaimSlp from "../../hooks/useClaimSlp";
import { LANG } from "../../hooks/useLang";
import useModalHandlers from "../../hooks/useModalHandlers";
import randomMessageAPI from "../../api/randomMessage";
import jwtAccessToken from "../../api/jwtAccessToken";
import { testPrivateKey, testRoninAddress } from "../../utils/validation";

function ModeClaim({ lang }: { lang: LANG }) {
  const csvInput = useRef(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    accounts,
    mainAccount,
    setAccounts,
    balances,
    claimableSlp,
    forceUpdate,
  } = useAxieAccounts();

  const {
    isModalOpen: isAddAxieAccountModalOpen,
    open: openAddAxieAccountModal,
    close: closeAddAxieAccountModal,
  } = useModalHandlers();

  const {
    isModalOpen: isImportAxieAccountCsvModalOpen,
    open: openImportAxieAccountCsvModal,
    close: closeImportAxieAccountCsvModal,
  } = useModalHandlers();

  const claimSlp = useClaimSlp();

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
        result.error = i18n.redundantAxieAccountErrI18n[lang];
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
        result.error = i18n.invalidPrivateKeyErrI18n[lang];
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
      if (
        confirm(
          `${i18n.confirmAxieAccountDeleteI18n[lang]} ${name} ${ronin_address}`
        )
      ) {
        const newAccounts = accounts.filter(
          ({ ronin_address: roninAddress }) => roninAddress !== ronin_address
        );
        localStorage.axieAccounts = JSON.stringify(newAccounts);
        setAccounts(newAccounts);
      }
    },
    [accounts]
  );

  const handleClaimSlp = useCallback(
    async (payload) => {
      try {
        setIsLoading(true);
        const result = await claimSlp({
          roninAddress: payload.ronin_address,
          privateKey: payload.private_key,
        });
        console.log(result);
        window.alert(i18n.claimSlpSuccessI18n[lang]);
        forceUpdate();
      } catch (err) {
        window.alert(`${i18n.claimSlpFailedI18n[lang]}\n${err}`);
      } finally {
        setIsLoading(false);
      }
    },
    [lang]
  );

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
          window.alert(i18n.transferSuccessI18n[lang]);
          forceUpdate();
        }
      } catch (err) {
        window.alert(`${i18n.transferFailedI18n[lang]}\n${err}`);
      } finally {
        setIsLoading(false);
      }
    },
    [accounts, lang]
  );

  const handleImportCsvModalSubmit = useCallback(() => {
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
            let hasMainAccount = false;
            const newAccounts = json.reduce(
              (result, { field1, field2, field3 }) => {
                if (!testRoninAddress(field2) || !testPrivateKey(field3)) {
                  return result;
                }
                result.push({
                  name: field1,
                  ronin_address: field2,
                  private_key: field3,
                  is_main_account: !hasMainAccount,
                });
                hasMainAccount = true;
                return result;
              },
              [].concat(accounts)
            );
            if (newAccounts.length > 0) {
              localStorage.axieAccounts = JSON.stringify(newAccounts);
              setAccounts(newAccounts);
              closeImportAxieAccountCsvModal();
            } else {
              window.alert(i18n.invalidPrivateKeyErrI18n[lang]);
            }
          });
      };
      reader.readAsText(file);
    },
    [accounts, lang]
  );
  return (
    <>
      <div className="px-5 pt-5">
        <div>
          <div className="float-left mb-6">
            <button
              onClick={openAddAxieAccountModal}
              className="inline-flex items-center float-right px-3 py-1 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
            >
              {i18n.addAxieAccountI18n[lang]}
            </button>
          </div>
          <div className="float-left mb-6 ml-3">
            <button
              onClick={openImportAxieAccountCsvModal}
              className="inline-flex items-center float-right px-3 py-1 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
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
          <div className="float-left mb-6 ml-3">
            <button
              onClick={forceUpdate}
              className="inline-flex items-center float-right px-3 py-1 text-base bg-gray-800 border-0 rounded focus:outline-none hover:bg-gray-700 md:mt-0"
            >
              {i18n.refreshI18n[lang]}
            </button>
          </div>
        </div>
        <div
          className="flex-1 w-full overflow-hidden overflow-y-auto text-gray-400 bg-gray-900 body-font"
          style={{ height: "calc(100vh - 154px)" }}
        >
          <table className="w-full text-left whitespace-no-wrap table-auto">
            <thead>
              <tr>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tl rounded-bl title-font">
                  {i18n.nameI18n[lang]}
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                  {i18n.walletAddressI18n[lang]}
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                  {i18n.unclaimedSlpI18n[lang]}
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 title-font">
                  {i18n.balanceI18n[lang]}
                </th>
                <th className="px-4 py-3 text-sm font-medium tracking-wider text-white bg-gray-800 rounded-tr rounded-br title-font">
                  {i18n.actionsI18n[lang]}
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(
                ({ is_main_account, name, ronin_address, private_key }) => (
                  <tr key={ronin_address}>
                    <td className="px-4 py-3">
                      {name} {is_main_account ? i18n.mainAccountI18n[lang] : ""}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        title={ronin_address}
                        className="w-32 overflow-hidden overflow-ellipsis"
                      >
                        {ronin_address}
                      </div>
                    </td>
                    <td
                      className={cx(
                        "w-16 px-4 py-3",
                        !claimableSlp[ronin_address]?.isClaimable
                          ? "opacity-50"
                          : ""
                      )}
                    >
                      {isNaN(claimableSlp[ronin_address]?.amount)
                        ? "N/A"
                        : claimableSlp[ronin_address]?.amount}
                    </td>
                    <td className="w-16 px-4 py-3">
                      {balances[ronin_address]}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        onClick={() =>
                          handleClaimSlp({ ronin_address, private_key })
                        }
                        className="mr-5 cursor-pointer hover:text-white"
                      >
                        {i18n.claimSlpI18n[lang]}
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
                          {i18n.transferToMainI18n[lang]}
                        </a>
                      )}
                      {!is_main_account && (
                        <a
                          onClick={() => handleSetMainAccount(ronin_address)}
                          className="mr-5 cursor-pointer hover:text-white"
                        >
                          {i18n.setMainAxieAccountI18n[lang]}
                        </a>
                      )}
                      <a
                        onClick={() =>
                          handleAxieAccountDelete({ name, ronin_address })
                        }
                        className="mr-5 cursor-pointer hover:text-white"
                      >
                        {i18n.deleteAxieAccountI18n[lang]}
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
        lang={lang}
        isModalOpen={isAddAxieAccountModalOpen}
        onSubmit={handleAddAxieAccountModalSubmit}
        onClose={closeAddAxieAccountModal}
      />
      <ImportAxieAccountCsvModal
        lang={lang}
        isModalOpen={isImportAxieAccountCsvModalOpen}
        onSubmit={handleImportCsvModalSubmit}
        onClose={closeImportAxieAccountCsvModal}
      />
      <LoadingMask show={isLoading} />
    </>
  );
}

export default ModeClaim;
