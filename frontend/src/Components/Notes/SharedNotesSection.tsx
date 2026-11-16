import { ArrowUpRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

type SharedNote = {
  publicId: string;
  title: string;
  topic?: string | null;
  updatedAt: string;
  sharedAt: string;
};

type SharedNotesSectionProps = {
  notes: SharedNote[];
};

const SharedNotesSection = ({ notes }: SharedNotesSectionProps) => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="border-b border-white/[0.08] pb-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
          Shared with me
        </p>

        <h2 className="mt-2 text-[19px] font-medium tracking-[-0.02em] text-white">
          Notes from others.
        </h2>

        <p className="mt-1 text-[13px] text-white/35">
          Study material that has been shared with you.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {notes.map((note) => {
          const sharedDate = new Date(note.sharedAt).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            },
          );

          return (
            <button
              key={note.publicId}
              type="button"
              onClick={() => navigate(`/notes/${note.publicId}`)}
              className="group relative flex min-h-[175px] flex-col justify-between overflow-hidden rounded-[12px] border border-white/[0.08] bg-[#111111] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-[#141414]"
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
                <span className="text-[11px] text-white/25">
                  Shared {sharedDate}
                </span>

                <span className="flex items-center gap-1.5 text-[10px] text-white/25">
                  <Users size={12} strokeWidth={1.6} />
                  Shared
                </span>
              </div>

              <div className="pointer-events-none absolute bottom-0 left-5 right-5 h-px origin-left scale-x-0 bg-white/20 transition-transform duration-300 group-hover:scale-x-100" />
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default SharedNotesSection;
