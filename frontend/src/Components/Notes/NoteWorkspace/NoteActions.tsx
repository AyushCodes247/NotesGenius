import {
  Check,
  Loader2,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

import {
  deleteNote,
  getSharedByMe,
  revokeNoteShare,
  shareNote,
} from "../../../api/notesApi";
import { useAppDispatch, useAppSelector } from "../../../hooks/appHook";

type NoteActionsProps = {
  note: {
    publicId: string;
    title: string;
  };
};

type ShareModal = "share" | "manage" | null;

const NoteActions = ({ note }: NoteActionsProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { deleting, sharing, sharedByMe, error, loadingSharedByMe } =
    useAppSelector((state) => state.notes);

  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<ShareModal>(null);
  const [userHandle, setUserHandle] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLButtonElement | null>(null);

  const noteShares = sharedByMe.filter(
    (share) => share.notesPublicId === note.publicId,
  );

  useLayoutEffect(() => {
    if (!open || !dropdownRef.current) return;

    gsap.fromTo(
      dropdownRef.current,
      {
        opacity: 0,
        y: -5,
        scale: 0.98,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.16,
        ease: "power2.out",
      },
    );
  }, [open]);

  useLayoutEffect(() => {
    if (!modal || !modalRef.current || !backdropRef.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        backdropRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.16,
          ease: "power2.out",
        },
      );

      gsap.fromTo(
        modalRef.current,
        {
          opacity: 0,
          y: 10,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        },
      );
    });

    return () => context.revert();
  }, [modal]);

  const closeModal = () => {
    if (sharing) return;

    setModal(null);
    setUserHandle("");
    setShareSuccess(false);
    setShareError(null);
    setRevokeTarget(null);
  };

  const openShareModal = () => {
    setOpen(false);
    setShareSuccess(false);
    setShareError(null);
    setUserHandle("");
    setRevokeTarget(null);
    setModal("share");
  };

  const openManageModal = async () => {
    setOpen(false);
    setShareSuccess(false);
    setShareError(null);
    setRevokeTarget(null);
    setModal("manage");

    try {
      await dispatch(getSharedByMe()).unwrap();
    } catch {
      // Redux error state handles the failure.
    }
  };

  const handleEdit = () => {
    setOpen(false);

    console.log("Edit note:", note.publicId);
  };

  const handleShare = async () => {
    const normalizedHandle = userHandle.trim().replace(/^@/, "").toLowerCase();

    if (!normalizedHandle) {
      setShareError("Enter a user handle.");
      return;
    }

    if (sharing) return;

    setShareError(null);
    setShareSuccess(false);

    try {
      await dispatch(
        shareNote({
          notesPublicId: note.publicId,
          userHandle: normalizedHandle,
        }),
      ).unwrap();

      setUserHandle("");
      setShareSuccess(true);

      await dispatch(getSharedByMe()).unwrap();
    } catch (err) {
      setShareError(
        typeof err === "string" ? err : "Unable to share this note.",
      );
    }
  };

  const handleRevoke = async (sharePublicId: string) => {
    if (sharing) return;

    setShareError(null);

    try {
      await dispatch(
        revokeNoteShare({
          notesPublicId: note.publicId,
          sharePublicId,
        }),
      ).unwrap();

      setRevokeTarget(null);
    } catch (err) {
      setShareError(
        typeof err === "string" ? err : "Unable to revoke this share.",
      );
    }
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
    <>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          disabled={deleting}
          className="flex size-9 items-center justify-center rounded-[8px] border border-white/[0.08] bg-[#111111] text-white/40 transition-colors hover:border-white/[0.16] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Note actions"
          aria-expanded={open}
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

            <div
              ref={dropdownRef}
              className="absolute right-0 top-11 z-50 w-[190px] overflow-hidden rounded-[9px] border border-white/[0.09] bg-[#111111] p-1.5 shadow-2xl shadow-black/40"
            >
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
                onClick={openShareModal}
                className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[12px] text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <Share2 size={14} strokeWidth={1.6} />
                Share note
              </button>

              <button
                type="button"
                onClick={openManageModal}
                className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-[12px] text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <UserPlus size={14} strokeWidth={1.6} />
                Manage shares
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

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <button
            ref={backdropRef}
            type="button"
            aria-label="Close sharing dialog"
            className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-[2px]"
            onClick={closeModal}
          />

          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-[12px] border border-white/[0.09] bg-[#111111] shadow-2xl shadow-black/50"
          >
            {modal === "share" ? (
              <>
                <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[#F5F5F5]">
                      Share note
                    </h2>

                    <p className="mt-1 text-[11px] leading-5 text-[#737373]">
                      Share this note with another NoteGenius user.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={sharing}
                    className="flex size-7 items-center justify-center rounded-md text-white/35 transition hover:bg-white/[0.05] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Close share dialog"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="p-5">
                  <label
                    htmlFor="note-share-handle"
                    className="mb-2 block text-[11px] font-medium text-[#A3A3A3]"
                  >
                    User handle
                  </label>

                  <div className="flex h-10 items-center rounded-[8px] border border-white/[0.09] bg-[#0D0D0D] px-3 transition focus-within:border-[#5B8CFF]/50">
                    <span className="mr-1 text-sm text-[#737373]">@</span>

                    <input
                      id="note-share-handle"
                      type="text"
                      value={userHandle}
                      onChange={(event) => {
                        setUserHandle(event.target.value);
                        setShareError(null);
                        setShareSuccess(false);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleShare();
                        }
                      }}
                      placeholder="username"
                      disabled={sharing}
                      autoFocus
                      className="min-w-0 flex-1 bg-transparent text-xs text-[#F5F5F5] outline-none placeholder:text-[#525252] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {shareError && (
                    <p className="mt-2 text-[11px] leading-5 text-red-400">
                      {shareError}
                    </p>
                  )}

                  {!shareError && error && !shareSuccess && (
                    <p className="mt-2 text-[11px] leading-5 text-red-400">
                      {error}
                    </p>
                  )}

                  {shareSuccess && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#5B8CFF]">
                      <Check size={13} />
                      Note shared successfully.
                    </p>
                  )}

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={sharing}
                      className="h-9 rounded-[7px] px-3 text-[11px] font-medium text-[#737373] transition hover:bg-white/[0.04] hover:text-[#A3A3A3] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleShare()}
                      disabled={sharing || !userHandle.trim()}
                      className="flex h-9 items-center gap-1.5 rounded-[7px] bg-[#F5F5F5] px-3.5 text-[11px] font-medium text-[#080808] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {sharing ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Sharing...
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
              </>
            ) : (
              <>
                <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[#F5F5F5]">
                      Manage shares
                    </h2>

                    <p className="mt-1 text-[11px] leading-5 text-[#737373]">
                      Users who currently have access to this note.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={sharing}
                    className="flex size-7 items-center justify-center rounded-md text-white/35 transition hover:bg-white/[0.05] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Close manage shares dialog"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="max-h-[320px] overflow-y-auto p-3">
                  {loadingSharedByMe ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2
                        size={17}
                        className="animate-spin text-[#737373]"
                      />
                    </div>
                  ) : noteShares.length === 0 ? (
                    <div className="px-3 py-10 text-center">
                      <Share2
                        size={18}
                        className="mx-auto text-[#525252]"
                        strokeWidth={1.5}
                      />

                      <p className="mt-3 text-xs text-[#737373]">
                        This note hasn't been shared with anyone.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setModal("share");
                          setShareError(null);
                          setShareSuccess(false);
                          setUserHandle("");
                        }}
                        className="mt-4 text-[11px] font-medium text-[#5B8CFF] transition hover:text-[#7AA3FF]"
                      >
                        Share this note
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {noteShares.map((share) => (
                        <div
                          key={share.sharePublicId}
                          className="flex items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 transition hover:bg-white/[0.03]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-[#F5F5F5]">
                              @{share.recipientUserHandle}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[#525252]">
                              Shared{" "}
                              {new Date(share.sharedAt).toLocaleDateString()}
                            </p>
                          </div>

                          {revokeTarget === share.sharePublicId ? (
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setRevokeTarget(null)}
                                disabled={sharing}
                                className="h-7 rounded-[6px] px-2 text-[10px] text-[#737373] transition hover:bg-white/[0.04] hover:text-[#A3A3A3]"
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleRevoke(share.sharePublicId)
                                }
                                disabled={sharing}
                                className="flex h-7 items-center gap-1 rounded-[6px] bg-red-400/[0.08] px-2 text-[10px] font-medium text-red-400 transition hover:bg-red-400/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {sharing ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : null}
                                Revoke
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setRevokeTarget(share.sharePublicId)
                              }
                              disabled={sharing}
                              className="shrink-0 rounded-[6px] px-2 py-1.5 text-[10px] text-red-400/60 transition hover:bg-red-400/[0.06] hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {shareError && (
                    <p className="mt-2 px-3 text-[11px] leading-5 text-red-400">
                      {shareError}
                    </p>
                  )}
                </div>

                <div className="flex justify-end border-t border-white/[0.07] px-5 py-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={sharing}
                    className="h-8 rounded-[7px] px-3 text-[11px] font-medium text-[#737373] transition hover:bg-white/[0.04] hover:text-[#A3A3A3] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NoteActions;
