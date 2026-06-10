import { useSelector, useDispatch } from "react-redux";

import { toggleTheme, setLanguage } from "../store/slices/uiSlice";
import i18n from "../i18n";
import type { AppDispatch, RootState } from "../store";

export const useUI = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme, language } = useSelector((state: RootState) => state.ui);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleSetLanguage = (lang: "en" | "ar") => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  return {
    theme,
    language,
    toggleTheme: handleToggleTheme,
    setLanguage: handleSetLanguage,
  };
};
