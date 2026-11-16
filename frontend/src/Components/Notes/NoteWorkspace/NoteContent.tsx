import { BookOpenText } from "lucide-react";

type NoteContentProps = {
  note: {
    title: string;
    content?: string | null;
    sourceText?: string | null;
  };
};

const NoteContent = ({ note }: NoteContentProps) => {
  const content = note.content?.trim();

  return (
    <section className="min-h-[600px] overflow-hidden rounded-[12px] border border-white/[0.08] bg-[#111111]">
      <div className="border-b border-white/[0.07] px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2 text-white/30">
          <BookOpenText size={15} strokeWidth={1.6} />

          <span className="text-[10px] font-medium uppercase tracking-[0.16em]">
            Note
          </span>
        </div>
      </div>

      <article className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
          {note.title}
        </h2>

        <div className="mt-8 h-px bg-white/[0.06]" />

        {content ? (
          <div className="mt-8 max-w-[850px] whitespace-pre-wrap text-[14px] leading-7 text-white/65">
            {content}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="flex size-10 items-center justify-center rounded-[9px] bg-white/[0.04] text-white/25">
              <BookOpenText size={18} strokeWidth={1.5} />
            </div>

            <p className="mt-4 text-[13px] text-white/40">
              This note doesn't have any content yet.
            </p>

            {note.sourceText && (
              <p className="mt-1 text-[11px] text-white/20">
                Source material is available for processing.
              </p>
            )}
          </div>
        )}
      </article>
    </section>
  );
};

export default NoteContent;
