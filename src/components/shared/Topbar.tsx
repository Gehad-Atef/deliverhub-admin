import { useUI } from "../../hooks/useUI";
import { useAuth } from "../../hooks/useAuth";

const Topbar = () => {
  const { theme, language, toggleTheme, setLanguage } = useUI();
  const { admin } = useAuth();

  return (
    <div
      className="h-16 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] 
      flex items-center justify-between px-6"
    >
      <div />

      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          className="w-9 h-9 rounded-lg border border-[var(--border-color)] flex items-center
    justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition relative"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 
      3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          <span
            className="absolute -top-1 -end-1 w-4 h-4 bg-blue-600 rounded-full text-white 
    text-[9px] font-bold flex items-center justify-center"
          >
            {language === "en" ? "ع" : "E"}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg border border-[var(--border-color)] flex items-center
            justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition"
        >
          {theme === "light" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 
                9.003 0 008.354-5.646z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 
                17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 
                8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
          )}
        </button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center 
          justify-center text-blue-700 dark:text-blue-400 font-semibold text-sm cursor-pointer"
        >
          {admin?.name?.charAt(0) ?? "A"}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
