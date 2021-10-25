import { Dispatch, SetStateAction, useEffect, useState } from "react";

import balanceOfSlpAPI from "../api/balanceOfSlp";

type AxieAccount = {
  name: string;
  ronin_address: string;
  private_key: string;
  is_main_account: boolean;
};

function useAxieAccounts(): {
  accounts: Array<AxieAccount>;
  mainAccount: AxieAccount;
  setAccounts: Dispatch<SetStateAction<AxieAccount[]>>;
  balances: { [key: string]: number };
} {
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

  return {
    accounts,
    mainAccount,
    setAccounts,
    balances,
  };
}

export default useAxieAccounts;