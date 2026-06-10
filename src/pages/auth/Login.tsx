import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useUI } from "../../hooks/useUI";
import PasswordInput from "../../components/auth/PasswordInput";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const { theme, language, toggleTheme, setLanguage } = useUI();

  const [form, setForm] = useState({ email: "", password: "" });
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validate = () => {
    const errors = { email: "", password: "" };
    let valid = true;

    if (!form.email) {
      errors.email = t("auth.emailRequired");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = t("auth.emailInvalid");
      valid = false;
    }

    if (!form.password) {
      errors.password = t("auth.passwordRequired");
      valid = false;
    } else if (form.password.length < 6) {
      errors.password = t("auth.passwordMin");
      valid = false;
    }

    setValidationErrors(errors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) login(form);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      {/* Language + Theme controls */}
      <div className="fixed top-4 end-4 flex items-center gap-2">
        <div
          className="flex items-center gap-1 p-1 rounded-lg border border-[var(--border-color)]
          bg-[var(--bg-secondary)]"
        >
          <button
            onClick={() => setLanguage("en")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition
              ${
                language === "en"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("ar")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition
              ${
                language === "ar"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
          >
            ع
          </button>
        </div>

        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]
            flex items-center justify-center text-[var(--text-secondary)] 
            hover:bg-[var(--bg-primary)] transition"
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
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12h12l1-12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            DeliverHub
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t("auth.adminDashboard")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-sm border border-[var(--border-color)] p-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
            {t("auth.signIn")}
          </h2>

          {/* API Error */}
          {error && (
            <div
              className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 
              dark:border-red-900 rounded-lg flex items-center gap-2 text-sm text-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (validationErrors.email)
                    setValidationErrors({ ...validationErrors, email: "" });
                }}
                placeholder="admin@deliverhub.com"
                disabled={isLoading}
                className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--bg-secondary)] 
                  text-[var(--text-primary)] text-sm outline-none transition
                  placeholder:text-[var(--text-muted)]
                  ${
                    validationErrors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-[var(--border-color)] focus:border-blue-500"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                {t("auth.password")}
              </label>
              <PasswordInput
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (validationErrors.password)
                    setValidationErrors({ ...validationErrors, password: "" });
                }}
                placeholder="••••••••"
                disabled={isLoading}
                error={validationErrors.password}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  {t("auth.signingIn")}
                </>
              ) : (
                t("auth.signIn")
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          {t("auth.copyright")} © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;
