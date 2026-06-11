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
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      {/* ===== Left side — Image ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Photo */}
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80"
          alt="Delivery logistics"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-slate-900/70 to-indigo-900/80" />

        {/* Content on top of image */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
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
            <span className="text-white font-bold text-lg">DeliverHub</span>
          </div>

          {/* Bottom text */}
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug mb-3">
              {t("auth.heroTitle", "Manage your deliveries smarter")}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              {t(
                "auth.heroSub",
                "Full control over orders, drivers, and routes — all in one dashboard.",
              )}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-6">
              {[
                { value: "12k+", label: t("auth.statOrders", "Orders/day") },
                { value: "98%", label: t("auth.statRate", "Delivery rate") },
                {
                  value: "340+",
                  label: t("auth.statDrivers", "Active drivers"),
                },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-white font-bold text-xl">
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Right side — Form ===== */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 relative">
        {/* Controls */}
        <div className="absolute top-4 end-4 flex items-center gap-2 z-10">
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition relative
              bg-[var(--bg-secondary)] border border-[var(--border-color)]
              text-[var(--text-secondary)] hover:text-[var(--text-primary)]
              hover:border-blue-400 dark:hover:border-blue-500"
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

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition
              bg-[var(--bg-secondary)] border border-[var(--border-color)]
              text-[var(--text-secondary)] hover:text-[var(--text-primary)]
              hover:border-blue-400 dark:hover:border-blue-500"
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
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
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
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Form container */}
        <div className="w-full max-w-sm">
          {/* Logo — mobile only */}
          <div className="text-center mb-8 lg:hidden">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                boxShadow: "0 0 0 6px rgba(37,99,235,0.12)",
              }}
            >
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
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {t("auth.signIn")}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {t("auth.adminDashboard")}
            </p>
          </div>

          {/* API Error */}
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm
              bg-red-50 dark:bg-red-950/30
              border border-red-200 dark:border-red-900
              text-red-600 dark:text-red-400"
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {t("auth.email")}
              </label>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
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
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition
                    bg-[var(--bg-secondary)] text-[var(--text-primary)]
                    placeholder:text-[var(--text-muted)]
                    focus:ring-2 focus:ring-blue-500/20
                    ${
                      validationErrors.email
                        ? "border-red-400 focus:border-red-500"
                        : "border-[var(--border-color)] focus:border-blue-500"
                    }
                    ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-red-500">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
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
              className="mt-2 w-full py-2.5 text-white text-sm font-medium rounded-lg transition
                flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed
                hover:opacity-90 active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #2563eb, #4338ca)",
              }}
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

          <p className="text-center text-xs text-[var(--text-muted)] mt-8">
            {t("auth.copyright")} © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
