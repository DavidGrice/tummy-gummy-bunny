import { AUTH_CONFIG } from "@/config/auth.config";

interface UsernameInputProps {
  value:    string;
  onChange: (value: string) => void;
  error:    string | null;
  isValid:  boolean;
}

const { username: cfg } = AUTH_CONFIG;

export function UsernameInput({ value, onChange, error, isValid }: UsernameInputProps) {
  const charCount   = value.length;
  const isNearLimit = charCount >= cfg.maxLength - 6;
  const atLimit     = charCount >= cfg.maxLength;
  const hasContent  = charCount > 0;
  const showSuccess = hasContent && isValid && !error;

  const counterColor = atLimit      ? "text-summer-error"
                     : isNearLimit  ? "text-summer-ember"
                     :               "text-gray-400";

  const borderClass  = error       ? "border-summer-error   ring-2 ring-summer-error/15"
                     : showSuccess ? "border-summer-gold    ring-2 ring-summer-gold/20"
                     :               "border-gray-200 focus-within:border-summer-coral focus-within:ring-2 focus-within:ring-summer-coral/20";

  const hintLine = error       ? null
                 : showSuccess ? <span className="text-gray-400">&#10003;&nbsp;Looks good!</span>
                 :               <span className="text-gray-400">Letters, numbers, and&nbsp;{cfg.allowedSpecialChars.join(" ")}</span>;

  return (
    <div className="w-full">

      {/* Label row */}
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs font-bold tracking-widest uppercase text-gray-700">
          Player Name
        </label>
        <span className={`text-xs font-mono tabular-nums transition-colors duration-200 ${counterColor}`}>
          {charCount}&thinsp;/&thinsp;{cfg.maxLength}
        </span>
      </div>

      {/* Input wrapper — owns the border/ring visual state */}
      <div className={`rounded-xl border-2 transition-all duration-200 bg-white ${borderClass}`}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={cfg.maxLength}
          placeholder="bunny_player_01"
          autoComplete="off"
          spellCheck={false}
          className="
            w-full bg-transparent
            px-4 py-3
            text-gray-900 placeholder:text-gray-300
            font-mono
            outline-none
            rounded-xl
          "
          style={{ fontSize: '16px' }}
        />
      </div>

      {/* Hint / error row — fixed height prevents layout shift */}
      <div className="h-5 mt-1.5 text-xs leading-5">
        {error ? (
          <span className="text-summer-error flex items-center gap-1">
            <span aria-hidden>&#10005;</span>
            {error}
          </span>
        ) : (
          hintLine
        )}
      </div>

    </div>
  );
}
