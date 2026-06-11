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

  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          : "linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 50%, #fce7f3 100%)",
      }}
    >
      {/* Subtle bg blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-40"
          style={{
            background: isDark
              ? "rgba(99,102,241,0.2)"
              : "rgba(99,102,241,0.15)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-40"
          style={{
            background: isDark
              ? "rgba(59,130,246,0.2)"
              : "rgba(236,72,153,0.12)",
          }}
        />
      </div>

      {/* Controls */}
      <div className="fixed top-4 end-4 flex items-center gap-2 z-20">
        <button
          onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all relative"
          style={{
            background: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(255,255,255,0.7)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.15)"
              : "1px solid rgba(0,0,0,0.1)",
            color: isDark ? "rgba(255,255,255,0.7)" : "rgba(30,41,59,0.8)",
            backdropFilter: "blur(8px)",
          }}
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
            className="absolute -top-1 -end-1 w-4 h-4 bg-blue-500 rounded-full text-white
            text-[9px] font-bold flex items-center justify-center"
          >
            {language === "en" ? "ع" : "E"}
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
          style={{
            background: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(255,255,255,0.7)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.15)"
              : "1px solid rgba(0,0,0,0.1)",
            color: isDark ? "rgba(255,255,255,0.7)" : "rgba(30,41,59,0.8)",
            backdropFilter: "blur(8px)",
          }}
        >
          {isDark ? (
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
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Split Card */}
      <div
        className="relative z-10 w-full max-w-3xl flex rounded-2xl overflow-hidden shadow-2xl"
        style={{
          minHeight: "480px",
          boxShadow: isDark
            ? "0 25px 60px rgba(0,0,0,0.5)"
            : "0 25px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* ===== Left — Form ===== */}
        <div
          className="w-full md:w-1/2 flex flex-col justify-center p-10 transition-colors duration-500"
          style={{
            background: isDark ? "#1e293b" : "#ffffff",
          }}
        >
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
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
              <span
                className="text-lg font-bold"
                style={{ color: isDark ? "white" : "#0f172a" }}
              >
                DeliverHub
              </span>
            </div>

            <h2
              className="text-2xl font-bold mb-1"
              style={{ color: isDark ? "white" : "#0f172a" }}
            >
              {t("auth.signIn")}
            </h2>
            <p
              className="text-sm"
              style={{
                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(15,23,42,0.5)",
              }}
            >
              {t("auth.adminDashboard")}
            </p>
          </div>

          {/* API Error */}
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm"
              style={{
                background: isDark
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: isDark ? "#fca5a5" : "#dc2626",
              }}
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
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: isDark
                    ? "rgba(255,255,255,0.45)"
                    : "rgba(15,23,42,0.45)",
                }}
              >
                {t("auth.email")}
              </label>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    color: isDark
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(15,23,42,0.25)",
                  }}
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
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all
                    ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(15,23,42,0.04)",
                    border: validationErrors.email
                      ? "1px solid rgba(239,68,68,0.6)"
                      : isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(15,23,42,0.12)",
                    color: isDark ? "white" : "#0f172a",
                  }}
                  onFocus={(e) => {
                    if (!validationErrors.email)
                      e.currentTarget.style.border =
                        "1px solid rgba(59,130,246,0.7)";
                  }}
                  onBlur={(e) => {
                    if (!validationErrors.email)
                      e.currentTarget.style.border = isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(15,23,42,0.12)";
                  }}
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-red-400">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: isDark
                    ? "rgba(255,255,255,0.45)"
                    : "rgba(15,23,42,0.45)",
                }}
              >
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
                isDark={isDark}
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

          <p
            className="text-center text-xs mt-6"
            style={{
              color: isDark ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.3)",
            }}
          >
            {t("auth.copyright")} © {new Date().getFullYear()}
          </p>
        </div>

        {/* ===== Right — Image + Branding ===== */}
        <div className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col justify-between">
          {/* Photo */}
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, rgba(37,99,235,0.75) 0%, rgba(67,56,202,0.85) 100%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full p-10">
            {/* Top badge */}
            <div
              className="self-start px-3 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Admin Portal
            </div>

            {/* Bottom content */}
            <div>
              <h3 className="text-2xl font-bold text-white leading-snug mb-3">
                {t("auth.heroTitle", "Manage your deliveries smarter")}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed mb-8">
                {t(
                  "auth.heroSub",
                  "Full control over orders, drivers, and routes.",
                )}
              </p>

              {/* Stats */}
              <div className="flex gap-6">
                {[
                  { value: "12k+", label: t("auth.statOrders", "Orders/day") },
                  { value: "98%", label: t("auth.statRate", "On-time rate") },
                  { value: "340+", label: t("auth.statDrivers", "Drivers") },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-white font-bold text-lg">
                      {s.value}
                    </div>
                    <div className="text-white/50 text-xs mt-0.5">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
