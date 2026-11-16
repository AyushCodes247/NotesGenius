import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NewNoteHeader = () => {
  const navigate = useNavigate();

  return (
    <header>
      <button
        type="button"
        onClick={() => navigate("/notes")}
        className="mb-7 flex items-center gap-2 text-[12px] text-white/35 transition-colors hover:text-white/70"
      >
        <ArrowLeft size={14} strokeWidth={1.7} />
        Back to notes
      </button>

      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#5B8CFF]">
        New note
      </p>

      <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-white sm:text-[34px]">
        Start learning.
      </h1>

      <p className="mt-2 max-w-[540px] text-[14px] leading-6 text-white/40">
        Create a note from scratch or turn your study material into structured
        knowledge.
      </p>
    </header>
  );
};

export default NewNoteHeader;