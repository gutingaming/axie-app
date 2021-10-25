import React, { useCallback, useState } from "react";
import Head from "next/head";
import cx from "classnames";

import ModeClaim from "../containers/ModeClaim";
import ModeBatch from "../containers/ModeBatch";

enum MODE {
  CLAIM = "claim",
  BATCH = "batch",
}

function Home() {
  if (typeof window === "undefined") return <></>;

  const [mode, setMode] = useState<MODE>(MODE.CLAIM);

  const handleModeButtonClick = useCallback((value: MODE) => {
    setMode(value);
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Axie Infinity Claim Tool</title>
      </Head>
      <div className="flex flex-wrap justify-center mt-5">
        <a
          className={cx(
            mode === MODE.CLAIM
              ? "text-white bg-gray-800 border-b-2 border-indigo-500 rounded-t"
              : "border-b-2 border-gray-800 cursor-pointer",
            "inline-flex items-center justify-center w-1/2 py-3 font-medium leading-none tracking-wider sm:px-6 sm:w-auto sm:justify-start title-font"
          )}
          onClick={() => handleModeButtonClick(MODE.CLAIM)}
        >
          集中資金
        </a>
        <a
          className={cx(
            mode === MODE.BATCH
              ? "text-white bg-gray-800 border-b-2 border-indigo-500 rounded-t"
              : "border-b-2 border-gray-800 cursor-pointer",
            "inline-flex items-center justify-center w-1/2 py-3 font-medium leading-none tracking-wider sm:px-6 sm:w-auto sm:justify-start title-font"
          )}
          onClick={() => handleModeButtonClick(MODE.BATCH)}
        >
          批次轉帳
        </a>
      </div>
      <div>
        {mode === MODE.CLAIM && <ModeClaim />}
        {mode === MODE.BATCH && <ModeBatch />}
      </div>
    </React.Fragment>
  );
}

export default Home;
