import { useState, type FormEvent } from "react";
import { ArrowUp, ChevronDown } from "lucide-react";

export type DiscussionMode =
  | "summarize"
  | "create"
  | "bulletpoints"
  | "short-summary"
  | "explain";

type DiscussionInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  mode: DiscussionMode;
  onModeChange: (mode: DiscussionMode) => void;
  disabled?: boolean;
};

const MODES: {
  value: DiscussionMode;
  label: string;
}[] = [
  {
    value: "summarize",
    label: "Summarize",
  },
  {
    value: "create",
    label: "Create",
  },
  {
    value: "bulletpoints",
    label: "Bullet points",
  },
  {
    value: "short-summary",
    label: "Short summary",
  },
  {
    value: "explain",
    label: "Explain",
  },
];

const DiscussionInput = ({
  value,
  onChange,
  onSend,
  mode,
  onModeChange,
  disabled = false,
}: DiscussionInputProps) => {
  const [focused, setFocused] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);

  const selectedMode = MODES.find((item) => item.value === mode) ?? MODES[0];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!value.trim() || disabled) return;

    onSend();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={[
          "relative overflow-visible rounded-xl border bg-[#111111] transition",
          focused ? "border-[#5B8CFF]/60" : "border-[#252525]",
        ].join(" ")}
      >
        {/* Mode */}
        <div className="relative border-b border-[#252525] px-2 py-1.5">
          <button
            type="button"
            onClick={() => setModeOpen((current) => !current)}
            disabled={disabled}
            className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-[#A3A3A3] transition hover:bg-white/[0.04] hover:text-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {selectedMode.label}

            <ChevronDown
              size={12}
              className={`transition-transform ${modeOpen ? "rotate-180" : ""}`}
            />
          </button>

          {modeOpen && !disabled && (
            <div className="absolute bottom-full left-2 z-50 mb-2 w-48 rounded-lg border border-[#252525] bg-[#111111] p-1 shadow-2xl">
              {MODES.map((item) => {
                const active = item.value === mode;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      onModeChange(item.value);
                      setModeOpen(false);
                    }}
                    className={[
                      "flex w-full items-center rounded-md px-3 py-2 text-left text-xs transition",
                      active
                        ? "bg-[rgba(91,140,255,0.10)] text-[#F5F5F5]"
                        : "text-[#737373] hover:bg-white/[0.04] hover:text-[#F5F5F5]",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Query */}
        <div className="flex items-end gap-2 p-2">
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();

                if (value.trim() && !disabled) {
                  onSend();
                }
              }
            }}
            placeholder="Ask something about your notes..."
            rows={2}
            disabled={disabled}
            className="min-h-[48px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-6 text-[#F5F5F5] outline-none placeholder:text-[#525252] disabled:cursor-not-allowed disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={disabled || !value.trim()}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5] text-[#080808] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            {disabled ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#080808]/20 border-t-[#080808]" />
            ) : (
              <ArrowUp size={16} />
            )}
          </button>
        </div>
      </div>

      <p className="mt-2 px-1 text-[10px] text-[#454545]">
        Enter to send · Shift + Enter for a new line
      </p>
    </form>
  );
};

export default DiscussionInput;
