import { useState, type FormEvent } from "react";
import { ArrowUp } from "lucide-react";

type DiscussionInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

const DiscussionInput = ({
  value,
  onChange,
  onSend,
  disabled = false,
}: DiscussionInputProps) => {
  const [focused, setFocused] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!value.trim() || disabled) {
      return;
    }

    onSend();
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-[#252525] p-4">
      <div
        className={`flex items-end gap-2 rounded-xl border bg-[#111111] p-2 transition ${
          focused ? "border-[#5B8CFF]/60" : "border-[#252525]"
        }`}
      >
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

      <p className="mt-2 px-1 text-[11px] text-[#525252]">
        Enter to send · Shift + Enter for a new line
      </p>
    </form>
  );
};

export default DiscussionInput;
