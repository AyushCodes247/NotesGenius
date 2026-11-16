import { FilePlus2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="mb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
          Start here
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Create */}
        <button
          type="button"
          onClick={() => navigate("/notes/new")}
          className="group flex min-h-[118px] flex-col justify-between rounded-[12px] border border-white/[0.08] bg-[#111111] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-[#141414]"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-[8px] border border-[#5B8CFF]/[0.14] bg-[#5B8CFF]/[0.10] text-[#5B8CFF]">
              <FilePlus2 size={18} strokeWidth={1.7} />
            </div>

            <span className="text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/50">
              →
            </span>
          </div>

          <div>
            <h2 className="text-[14px] font-medium text-white">
              Create a new note
            </h2>

            <p className="mt-1 text-[12px] text-white/35">
              Start with a blank study workspace.
            </p>
          </div>
        </button>

        {/* Upload */}
        <button
          type="button"
          onClick={() => navigate("/notes/new?upload=true")}
          className="group flex min-h-[118px] flex-col justify-between rounded-[12px] border border-white/[0.10] bg-[#111111] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-[#141414]"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-[8px] bg-white/[0.05] text-white/60">
              <Upload size={17} strokeWidth={1.7} />
            </div>

            <span className="text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/50">
              →
            </span>
          </div>

          <div>
            <h2 className="text-[14px] font-medium text-white">
              Upload study material
            </h2>

            <p className="mt-1 text-[12px] text-white/35">
              Turn your document into structured notes.
            </p>
          </div>
        </button>
      </div>
    </section>
  );
};

export default QuickActions;