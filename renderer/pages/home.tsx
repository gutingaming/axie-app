import React, { useCallback, useState } from "react";
import Head from "next/head";
import cx from "classnames";

import ModeClaim from "../containers/ModeClaim";
import ModeTransfer from "../containers/ModeTransfer";
import useLang, { LANG } from "../hooks/useLang";
import { claimModeI18n, transferModeI18n } from "../constants/locale";

enum MODE {
  CLAIM = "claim",
  TRANSFER = "transfer",
}

function Home() {
  if (typeof window === "undefined") return <></>;

  const [mode, setMode] = useState<MODE>(MODE.CLAIM);

  const handleModeButtonClick = useCallback((value: MODE) => {
    setMode(value);
  }, []);

  const { lang, setLang } = useLang();

  const handleLangButtonClick = useCallback((value: LANG) => {
    setLang(value);
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Axie Infinity Claim Tool</title>
      </Head>
      <div className="flex justify-between inline mt-5">
        <div className="w-28">&nbsp;</div>
        <div className="flex justify-center">
          <a
            className={cx(
              mode === MODE.CLAIM
                ? "text-white bg-gray-800 border-b-2 border-indigo-500 rounded-t"
                : "border-b-2 border-gray-800 cursor-pointer",
              "inline-flex items-center justify-center w-1/2 py-3 font-medium leading-none tracking-wider sm:px-6 sm:w-auto sm:justify-start title-font"
            )}
            onClick={() => handleModeButtonClick(MODE.CLAIM)}
          >
            {claimModeI18n[lang]}
          </a>
          <a
            className={cx(
              mode === MODE.TRANSFER
                ? "text-white bg-gray-800 border-b-2 border-indigo-500 rounded-t"
                : "border-b-2 border-gray-800 cursor-pointer",
              "inline-flex items-center justify-center w-1/2 py-3 font-medium leading-none tracking-wider sm:px-6 sm:w-auto sm:justify-start title-font"
            )}
            onClick={() => handleModeButtonClick(MODE.TRANSFER)}
          >
            {transferModeI18n[lang]}
          </a>
        </div>
        <div>
          <button
            className={cx(
              lang === LANG.EN
                ? "text-white-500 border-indigo-500"
                : "text-gray-500 border-gray-800",
              "w-10 h-10 p-0 ml-1 mr-2 border-2 bg-gray-800 rounded-full"
            )}
            onClick={() => handleLangButtonClick(LANG.EN)}
          >
            EN
          </button>
          <button
            className={cx(
              lang === LANG.ZH_TW
                ? "text-white-500 border-indigo-500"
                : "text-gray-500 border-gray-800",
              "w-10 h-10 p-0 mr-5 border-2 bg-gray-800 rounded-full"
            )}
            onClick={() => handleLangButtonClick(LANG.ZH_TW)}
          >
            繁
          </button>
        </div>
      </div>
      <div>
        {mode === MODE.CLAIM && <ModeClaim lang={lang} />}
        {mode === MODE.TRANSFER && <ModeTransfer lang={lang} />}
      </div>
    </React.Fragment>
  );
}

export default Home;
