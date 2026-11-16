import { MoreHorizontal, Pencil, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteNote } from "../../../api/notesApi";
import { useAppDispatch, useAppSelector } from "../../../hooks/appHook";

type NoteActionsProps = {
  note: {
    publicId: string;
    title: string;
  };
};

const NoteActions = ({ note }: NoteActionsProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { deleting } = useAppSelector((state) => state.notes);

  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    setOpen(false);

    console.log("Edit note:", note.publicId);
  };

  const handleShare = () => {
    setOpen(false);

    console.log("Share note:", note.publicId);
  };

  const handleDelete = async () => {
    if (deleting) return;

    setOpen(false);

    const confirmed = window.confirm(
      `Delete "${note.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await dispatch(deleteNote(note.publicId)).unwrap();

      navigate("/dashboard");
    } catch {
      // The existing Redux error state handles the failure.
    }
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={deleting}
        className="flex size-9 items-center justify-center rounded-[8px] border border-white/[0.08] bg-[#111111] text-white/40 transition-colors hover:border-white/[0.16] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Note actions"
      >
        <MoreHorizontal size={17} strokeWidth={1.7} />
      </button>

      {open && !deleting && (
        <>
          <button
            type="button"
            aria-label="Close actions"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-11 z-50 w-[180px] overflow-hidden rounded-[9px] border border-white/[0.09] bg-[#111111] p-1.5 shadow-2xl shadow-black/40">
            <button
              type="button"
              onClick={handleEdit}
              className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[12px] text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              <Pencil size={14} strokeWidth={1.6} />
              Edit note
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[12px] text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              <Share2 size={14} strokeWidth={1.6} />
              Share note
            </button>

            <div className="my-1 h-px bg-white/[0.06]" />

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[12px] text-red-400/70 transition-colors hover:bg-red-400/[0.06] hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={14} strokeWidth={1.6} />
              {deleting ? "Deleting..." : "Delete note"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NoteActions;
