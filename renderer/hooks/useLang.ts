import { useCallback, useState } from "react";

export enum LANG {
  EN = "en",
  ZH_TW = "zh-tw",
}

function useLang(): {
  lang: LANG;
  setLang: (value: LANG) => void;
} {
  const [lang, setLangState] = useState<LANG>(
    localStorage?.lang || LANG.ZH_TW
  );
  const setLang = useCallback((value: LANG) => {
    localStorage.lang = value;
    setLangState(value);
  }, [lang]);
  return {
    lang,
    setLang,
  };
}

export default useLang;
