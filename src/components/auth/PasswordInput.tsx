import { useState } from "react";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  isDark?: boolean;
}

const PasswordInput = ({
  value,
  onChange,
  placeholder = "Enter password",
  disabled,
  error,
  isDark = true,
}: PasswordInputProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
          style={{
            color: isDark ? "rgba(255,255,255,0.3)" : "rgba(15,23,42,0.3)",
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-11 py-2.5 rounded-lg text-sm outline-none transition-all
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          style={{
            background: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.7)",
            border: error
              ? "1px solid rgba(239,68,68,0.6)"
              : isDark
                ? "1px solid rgba(255,255,255,0.12)"
                : "1px solid rgba(0,0,0,0.1)",
            color: isDark ? "white" : "#0f172a",
          }}
          onFocus={(e) => {
            if (!error)
              e.currentTarget.style.border = "1px solid rgba(59,130,246,0.7)";
          }}
          onBlur={(e) => {
            if (!error)
              e.currentTarget.style.border = isDark
                ? "1px solid rgba(255,255,255,0.12)"
                : "1px solid rgba(0,0,0,0.1)";
          }}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{
            color: isDark ? "rgba(255,255,255,0.35)" : "rgba(15,23,42,0.35)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = isDark
              ? "rgba(255,255,255,0.75)"
              : "rgba(15,23,42,0.75)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = isDark
              ? "rgba(255,255,255,0.35)"
              : "rgba(15,23,42,0.35)")
          }
        >
          {show ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default PasswordInput;
