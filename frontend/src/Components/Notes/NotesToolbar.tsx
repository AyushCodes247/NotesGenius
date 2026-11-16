import { Search, SlidersHorizontal } from "lucide-react";

const NotesToolbar = () => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-[300px]">
        <Search
          size={15}
          strokeWidth={1.7}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
        />

        <input
          type="text"
          placeholder="Search your notes..."
          className="h-10 w-full rounded-[8px] border border-white/[0.08] bg-[#111111] pl-9 pr-3 text-[12px] text-white outline-none placeholder:text-white/25 transition-colors focus:border-white/[0.18]"
        />
      </div>

      <button
        type="button"
        className="flex h-10 items-center justify-center gap-2 rounded-[8px] border border-white/[0.08] bg-[#111111] px-3 text-[12px] text-white/45 transition-colors hover:border-white/[0.15] hover:text-white/70"
      >
        <SlidersHorizontal size={14} strokeWidth={1.7} />
        Recently updated
      </button>
    </div>
  );
};

export default NotesToolbar;