import { useState } from "react";
import { Check, Loader2, Share2, X } from "lucide-react";

import { shareNote } from "../../../api/notesApi";

import { useAppDispatch, useAppSelector } from "../../../hooks/appHook";

type ShareNoteProps = {
  notesPublicId: string;
  pdfUrl: string | null;
};

const ShareNote = ({ notesPublicId, pdfUrl }: ShareNoteProps) => {
  const dispatch = useAppDispatch();

  const { sharing, error } = useAppSelector((state) => state.notes);

  const [open, setOpen] = useState(false);
  const [userHandle, setUserHandle] = useState("");
  const [shareError, setShareError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOpen = () => {
    setUserHandle("");
    setShareError(null);
    setSuccess(false);
    setOpen(true);
  };

  const handleClose = () => {
    if (sharing) return;

    setOpen(false);
    setUserHandle("");
    setShareError(null);
    setSuccess(false);
  };

  const handleShare = async () => {
    const trimmedHandle = userHandle.trim().toLowerCase();

    if (!trimmedHandle) {
      setShareError("Enter a user handle.");
      return;
    }

    if (!pdfUrl) {
      setShareError("Generate the note PDF before sharing it.");
      return;
    }

    setShareError(null);
    setSuccess(false);

    try {
      await dispatch(
        shareNote({
          notesPublicId,
          userHandle: trimmedHandle,
        }),
      ).unwrap();

      setSuccess(true);
      setUserHandle("");
    } catch (err) {
      setShareError(
        typeof err === "string"
          ? err
          : error || "Unable to share the downloadable file.",
      );
    }
  };

  return (
    <>
      {/* Share button */}

      <button
        type="button"
        onClick={handleOpen}
        disabled={!pdfUrl}
        className="
          flex h-9 w-full items-center justify-center gap-2
          rounded-md border border-[#252525]
          bg-[#0D0D0D]
          text-[11px] font-medium text-[#A3A3A3]
          transition
          hover:border-[#303030]
          hover:bg-[#111111]
          hover:text-[#F5F5F5]
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <Share2 size={13} />
        Share downloadable file
      </button>

      {/* Share modal */}

      {open && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/60 px-4
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            className="
              w-full max-w-sm
              rounded-xl
              border border-[#252525]
              bg-[#111111]
              p-5
              shadow-2xl
            "
          >
            {/* Header */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-[#F5F5F5]">
                  Share downloadable file
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-[#737373]">
                  Enter the user's handle to share this note PDF.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={sharing}
                className="
                  flex h-7 w-7 shrink-0
                  items-center justify-center
                  rounded-md
                  text-[#525252]
                  transition
                  hover:bg-white/[0.04]
                  hover:text-[#A3A3A3]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                aria-label="Close share dialog"
              >
                <X size={14} />
              </button>
            </div>

            {/* Handle input */}

            <div className="mt-5">
              <label
                htmlFor="share-user-handle"
                className="text-[11px] font-medium text-[#A3A3A3]"
              >
                User handle
              </label>

              <div
                className="
                  mt-2 flex items-center
                  rounded-md
                  border border-[#252525]
                  bg-[#0D0D0D]
                  px-3
                  transition
                  focus-within:border-[#303030]
                "
              >
                <span className="text-xs text-[#525252]">@</span>

                <input
                  id="share-user-handle"
                  type="text"
                  value={userHandle}
                  onChange={(event) => {
                    setUserHandle(event.target.value);
                    setShareError(null);
                    setSuccess(false);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleShare();
                    }

                    if (event.key === "Escape") {
                      handleClose();
                    }
                  }}
                  placeholder="username"
                  autoFocus
                  disabled={sharing}
                  className="
                    h-9 min-w-0 flex-1
                    bg-transparent
                    px-2
                    text-xs text-[#F5F5F5]
                    outline-none
                    placeholder:text-[#525252]
                    disabled:cursor-not-allowed
                  "
                />
              </div>

              {shareError && (
                <p className="mt-2 text-[10px] text-red-400">{shareError}</p>
              )}

              {success && (
                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[#737373]">
                  <Check size={12} className="text-[#5B8CFF]" />
                  Downloadable file shared successfully.
                </p>
              )}
            </div>

            {/* Actions */}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={sharing}
                className="
                  h-8 rounded-md px-3
                  text-[11px] font-medium
                  text-[#737373]
                  transition
                  hover:bg-white/[0.04]
                  hover:text-[#A3A3A3]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleShare()}
                disabled={sharing || !userHandle.trim()}
                className="
                  flex h-8 items-center gap-1.5
                  rounded-md
                  bg-[#F5F5F5]
                  px-3
                  text-[11px] font-medium
                  text-[#080808]
                  transition
                  hover:bg-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {sharing ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Sharing
                  </>
                ) : (
                  <>
                    <Share2 size={12} />
                    Share
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareNote;
