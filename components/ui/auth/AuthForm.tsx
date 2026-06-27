"use client";

import { useRouter } from "next/navigation";
import { useUsernameValidation } from "@/hooks/useUsernameValidation";
import { themeGradients } from "@/config/theme.config";
import { setUsername } from "@/lib/cookies";
import { AuthCard } from "./AuthCard";
import { UsernameInput } from "./UsernameInput";

export function AuthForm() {
  const router = useRouter();
  const { value, error, isValid, onChange, markTouched } = useUsernameValidation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    markTouched();
    if (!isValid) return;
    setUsername(value);
    router.push("/welcome");
  };

  return (
    <AuthCard>

      {/* ── Brand header ── */}
      <div className="flex flex-col items-center text-center mb-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 shadow-summer-sm"
          style={{ background: themeGradients.button }}
          aria-hidden
        >
          🐰
        </div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase leading-none">
          Tummy Gummy Bunny
        </h1>
        <p className="mt-1 text-xs tracking-widest uppercase text-gray-500">
          Point &amp; Click Adventure
        </p>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-gray-100 mb-6" />

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate>
        <UsernameInput
          value={value}
          onChange={onChange}
          error={error}
          isValid={isValid}
        />

        <button
          type="submit"
          disabled={!isValid}
          style={isValid ? { background: themeGradients.button } : undefined}
          className={`
            w-full mt-5 py-3.5 rounded-xl
            text-sm font-black tracking-widest uppercase
            transition-all duration-200
            ${isValid
              ? "text-white shadow-summer-sm hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              : "text-gray-400 bg-gray-100 cursor-not-allowed"
            }
          `}
        >
          Enter Game
        </button>
      </form>

      {/* ── Footer note ── */}
      <p className="mt-5 text-center text-[11px] text-gray-400 leading-relaxed">
        Your name is saved locally only.
      </p>

    </AuthCard>
  );
}
