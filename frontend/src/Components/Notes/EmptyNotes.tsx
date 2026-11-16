import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyNotes = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 flex min-h-[300px] flex-col items-center justify-center rounded-[12px] border border-dashed border-white/[0.1] bg-white/[0.015] px-6 text-center">
      <div className="flex size-11 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-white/35">
        <FileText size={19} strokeWidth={1.6} />
      </div>

      <h3 className="mt-5 text-[15px] font-medium text-white/80">
        Your study library is empty
      </h3>

      <p className="mt-2 max-w-[360px] text-[12px] leading-5 text-white/30">
        Create your first note or upload study material to start building your
        knowledge workspace.
      </p>

      <button
        type="button"
        onClick={() => navigate("/notes/new")}
        className="mt-5 flex h-9 items-center gap-2 rounded-[7px] bg-white px-4 text-[12px] font-medium text-black transition-colors hover:bg-white/90"
      >
        <Plus size={14} strokeWidth={2} />
        New note
      </button>
    </div>
  );
};

export default EmptyNotes;
