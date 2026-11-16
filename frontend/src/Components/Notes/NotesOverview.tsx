import { Search } from "lucide-react";

import { useAppSelector } from "../../hooks/appHook";

import NoteCard from "./NoteCard";
import EmptyNotes from "./EmptyNotes";

const NotesOverview = () => {
  const { notes, loadingNotes, error } = useAppSelector((state) => state.notes);

  const latestNotes = notes.slice(0, 6);

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#737373]">
            Your library
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#F5F5F5]">
            Latest notes
          </h2>

          <p className="mt-2 text-sm text-[#737373]">
            Pick up where you left off.
          </p>
        </div>

        <div className="hidden h-10 w-10 items-center justify-center rounded-lg border border-[#252525] bg-[#111111] text-[#737373] sm:flex">
          <Search size={17} />
        </div>
      </div>

      {loadingNotes && notes.length === 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-xl border border-[#252525] bg-[#111111]"
            />
          ))}
        </div>
      ) : error && notes.length === 0 ? (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-6 text-sm text-red-400">
          {error}
        </div>
      ) : latestNotes.length === 0 ? (
        <div className="mt-6">
          <EmptyNotes />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestNotes.map((note) => (
            <NoteCard key={note.publicId} note={note} />
          ))}
        </div>
      )}
    </section>
  );
};

export default NotesOverview;
