import { createSlice } from "@reduxjs/toolkit";

type Theme = "light" | "dark";
type Language = "en" | "ar";

interface UIState {
  theme: Theme;
  language: Language;
}

const initialState: UIState = {
  theme: (localStorage.getItem("theme") as Theme) || "light",
  language: (localStorage.getItem("language") as Language) || "en",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
      document.documentElement.classList.toggle("dark", state.theme === "dark");
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem("language", action.payload);
      document.documentElement.setAttribute(
        "dir",
        action.payload === "ar" ? "rtl" : "ltr",
      );
      document.documentElement.setAttribute("lang", action.payload);
    },
  },
});

export const { toggleTheme, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;
