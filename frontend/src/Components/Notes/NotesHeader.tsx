import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const NotesHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col gap-6 border-b border-white/[0.08] pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#5B8CFF]">
          Notes
        </p>

        <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-white sm:text-[34px]">
          Your study library.
        </h1>

        <p className="mt-2 max-w-[520px] text-[14px] leading-6 text-white/40">
          Keep your learning material organized and easy to revisit.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate("/notes/new")}
        className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-white px-4 text-[12px] font-medium text-black transition-all hover:bg-white/90"
      >
        <Plus size={15} strokeWidth={2} />
        New note
      </button>
    </header>
  );
};

export default NotesHeader;