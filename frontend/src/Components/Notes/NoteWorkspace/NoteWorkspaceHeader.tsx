import { ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

import NoteActions from "./NoteActions";

type Note = {
  publicId: string;
  title: string;
  topic?: string | null;
  visibility: "private" | "public";
};

type NoteWorkspaceHeaderProps = {
  note: Note;
  onAddMaterial: () => void;
};

const NoteWorkspaceHeader = ({
  note,
  onAddMaterial,
}: NoteWorkspaceHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex h-[76px] w-full items-center justify-between gap-5">
      {/* Left side */}
      <div className="flex min-w-0 items-center gap-4">
        {/* Back to dashboard */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs text-[#737373] transition hover:bg-white/[0.04] hover:text-[#F5F5F5]"
        >
          <ArrowLeft size={14} />
          Dashboard
        </button>

        <div className="h-5 w-px shrink-0 bg-[#252525]" />

        {/* Note information */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {note.topic && (
              <span className="hidden rounded-[5px] bg-white/[0.05] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white/35 md:inline">
                {note.topic}
              </span>
            )}

            <span className="rounded-[5px] border border-white/[0.07] px-2 py-1 text-[10px] text-white/35">
              {note.visibility === "public" ? "Public" : "Private"}
            </span>
          </div>

          <h1 className="mt-1 truncate text-lg font-semibold tracking-[-0.025em] text-[#F5F5F5]">
            {note.title}
          </h1>
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onAddMaterial}
          className="flex h-9 items-center gap-2 rounded-md border border-[#252525] px-3 text-xs font-medium text-[#A3A3A3] transition hover:border-[#303030] hover:bg-[#111111] hover:text-[#F5F5F5]"
        >
          <Upload size={13} />
          Add material
        </button>

        <NoteActions note={note} />
      </div>
    </header>
  );
};

export default NoteWorkspaceHeader;
