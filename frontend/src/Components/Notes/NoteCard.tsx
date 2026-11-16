import { ArrowUpRight, LockKeyhole, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

type NoteCardProps = {
  note: {
    publicId: string;
    title: string;
    topic?: string | null;
    visibility: "private" | "public";
    updatedAt: string;
  };
};

const NoteCard = ({ note }: NoteCardProps) => {
  const navigate = useNavigate();

  const updatedDate = new Date(note.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isPublic = note.visibility === "public";

  return (
    <button
      type="button"
      onClick={() => navigate(`/notes/${note.publicId}`)}
      className="group relative flex min-h-[185px] flex-col justify-between overflow-hidden rounded-[12px] border border-white/[0.08] bg-[#111111] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-[#141414]"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-[5px] bg-white/[0.05] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white/35">
            {note.topic || "Study note"}
          </span>

          <ArrowUpRight
            size={16}
            strokeWidth={1.6}
            className="shrink-0 text-white/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/60"
          />
        </div>

        <h3 className="mt-7 line-clamp-2 text-[16px] font-medium leading-6 tracking-[-0.02em] text-white/90">
          {note.title}
        </h3>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
        <span className="text-[11px] text-white/25">Updated {updatedDate}</span>

        <span className="flex items-center gap-1.5 text-[10px] text-white/25">
          {isPublic ? (
            <Users size={12} strokeWidth={1.6} />
          ) : (
            <LockKeyhole size={12} strokeWidth={1.6} />
          )}

          {isPublic ? "Public" : "Private"}
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-5 right-5 h-px origin-left scale-x-0 bg-white/20 transition-transform duration-300 group-hover:scale-x-100" />
    </button>
  );
};

export default NoteCard;
