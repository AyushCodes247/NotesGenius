import type { FormEvent } from "react";
import { ArrowRight } from "lucide-react";

type CreateNoteFormProps = {
  title: string;
  onTitleChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
};

const CreateNoteForm = ({
  title,
  onTitleChange,
  onSubmit,
  loading,
}: CreateNoteFormProps) => {
  return (
    <form
      onSubmit={onSubmit}
      className="flex min-h-[360px] flex-col rounded-2xl border border-[#252525] bg-[#111111] p-6 sm:p-7"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#737373]">
          Create note
        </p>

        <h2 className="mt-3 text-xl font-semibold tracking-tight text-[#F5F5F5]">
          Start with a title.
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-[#737373]">
          Give your study workspace a name. You can upload your material
          alongside it.
        </p>
      </div>

      <div className="mt-8">
        <label
          htmlFor="note-title"
          className="mb-2 block text-sm font-medium text-[#A3A3A3]"
        >
          Note title
        </label>

        <input
          id="note-title"
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="e.g. Operating Systems — Processes"
          maxLength={200}
          disabled={loading}
          className="h-11 w-full rounded-lg border border-[#252525] bg-[#0D0D0D] px-3.5 text-sm text-[#F5F5F5] outline-none placeholder:text-[#525252] transition focus:border-[#5B8CFF] disabled:cursor-not-allowed disabled:opacity-50"
        />

        <p className="mt-2 text-xs text-[#525252]">
          {title.length}/200 characters
        </p>
      </div>

      <div className="mt-auto pt-8">
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#F5F5F5] px-4 text-sm font-semibold text-[#080808] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#080808]/20 border-t-[#080808]" />
              Creating workspace...
            </>
          ) : (
            <>
              Create note
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateNoteForm;
