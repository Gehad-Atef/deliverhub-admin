import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "./store";

const AppContent = () => {
  const { theme, language } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      language === "ar" ? "rtl" : "ltr",
    );
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  return <RouterProvider router={router} />;
};

const App = () => {
  return <AppContent />;
};

export default App;
