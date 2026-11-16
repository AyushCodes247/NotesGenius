import { ArrowLeft } from "lucide-react";
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
};

const NoteWorkspaceHeader = ({
  note,
}: NoteWorkspaceHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-white/[0.08] pb-5">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate("/notes")}
            className="mb-5 flex items-center gap-2 text-[11px] text-white/30 transition-colors hover:text-white/65"
          >
            <ArrowLeft size={14} strokeWidth={1.7} />
            Back to notes
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {note.topic && (
              <span className="rounded-[5px] bg-white/[0.05] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white/35">
                {note.topic}
              </span>
            )}

            <span className="rounded-[5px] border border-white/[0.07] px-2 py-1 text-[10px] text-white/25">
              {note.visibility === "public" ? "Public" : "Private"}
            </span>
          </div>

          <h1 className="mt-4 truncate text-[25px] font-semibold tracking-[-0.035em] text-white sm:text-[29px]">
            {note.title}
          </h1>
        </div>

        <NoteActions note={note} />
      </div>
    </header>
  );
};

export default NoteWorkspaceHeader;