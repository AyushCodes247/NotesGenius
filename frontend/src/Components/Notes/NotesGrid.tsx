import type { Note } from "../../api/notesApi";

import EmptyNotes from "./EmptyNotes";
import NoteCard from "./NoteCard";

type NotesGridProps = {
  notes: Note[];
  loading: boolean;
};

const NotesGrid = ({ notes, loading }: NotesGridProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-xl border border-[#252525] bg-[#111111]"
          />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return <EmptyNotes />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.publicId} note={note} />
      ))}
    </div>
  );
};

export default NotesGrid;
