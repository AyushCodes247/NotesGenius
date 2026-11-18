import { useEffect, useRef, useState } from "react";
import {
  Check,
  Ellipsis,
  FileQuestion,
  Loader2,
  Share2,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  deleteQuiz,
  getQuizShares,
  revokeQuizShare,
  shareQuiz,
  type Quiz,
} from "../../api/quizApi";

import { useAppDispatch, useAppSelector } from "../../hooks/appHook";

type GeneratedQuizzesProps = {
  quizzes: Quiz[];
};

type ModalType = "share" | "shares" | "delete" | null;

const GeneratedQuizzes = ({ quizzes }: GeneratedQuizzesProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { sharing, loadingShares, revokingShare, deleting, quizShares, error } =
    useAppSelector((state) => state.quiz);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [userHandle, setUserHandle] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // --------------------------------------------------------------------------
  // Close action menu when clicking outside
  // --------------------------------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  if (quizzes.length === 0) {
    return null;
  }

  // --------------------------------------------------------------------------
  // Open share modal
  // --------------------------------------------------------------------------

  const handleOpenShare = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setUserHandle("");
    setShareSuccess(false);
    setOpenMenuId(null);
    setModal("share");
  };

  // --------------------------------------------------------------------------
  // Open manage shares modal
  // --------------------------------------------------------------------------

  const handleOpenShares = async (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setOpenMenuId(null);
    setModal("shares");

    await dispatch(getQuizShares(quiz.publicId));
  };

  // --------------------------------------------------------------------------
  // Open delete confirmation
  // --------------------------------------------------------------------------

  const handleOpenDelete = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setOpenMenuId(null);
    setModal("delete");
  };

  // --------------------------------------------------------------------------
  // Close modal
  // --------------------------------------------------------------------------

  const handleCloseModal = () => {
    if (sharing || deleting || revokingShare) {
      return;
    }

    setModal(null);
    setActiveQuiz(null);
    setUserHandle("");
    setShareSuccess(false);
  };

  // --------------------------------------------------------------------------
  // Share quiz
  // --------------------------------------------------------------------------

  const handleShare = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeQuiz || !userHandle.trim()) {
      return;
    }

    const result = await dispatch(
      shareQuiz({
        quizPublicId: activeQuiz.publicId,
        userHandle: userHandle.trim(),
      }),
    );

    if (shareQuiz.fulfilled.match(result)) {
      setShareSuccess(true);
      setUserHandle("");
    }
  };

  // --------------------------------------------------------------------------
  // Revoke share
  // --------------------------------------------------------------------------

  const handleRevokeShare = async (sharePublicId: string) => {
    if (!activeQuiz) {
      return;
    }

    await dispatch(
      revokeQuizShare({
        quizPublicId: activeQuiz.publicId,
        sharePublicId,
      }),
    );
  };

  // --------------------------------------------------------------------------
  // Delete quiz
  // --------------------------------------------------------------------------

  const handleDelete = async () => {
    if (!activeQuiz) {
      return;
    }

    const result = await dispatch(
      deleteQuiz({
        quizPublicId: activeQuiz.publicId,
      }),
    );

    if (deleteQuiz.fulfilled.match(result)) {
      setModal(null);
      setActiveQuiz(null);
    }
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#5B8CFF]">
            Your quizzes
          </p>

          <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.025em] text-white">
            Generated quizzes
          </h2>
        </div>

        <p className="text-[12px] text-white/30">
          {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {quizzes.map((quiz) => (
          <div
            key={quiz.publicId}
            className="group relative rounded-xl border border-[#252525] bg-[#111111] transition-colors hover:border-[#303030] hover:bg-[#141414]"
          >
            {/* ---------------------------------------------------------------- */}
            {/* Quiz card navigation area */}
            {/* ---------------------------------------------------------------- */}

            <button
              type="button"
              onClick={() => navigate(`/quizzes/${quiz.publicId}`)}
              className="block w-full p-5 text-left"
            >
              <div className="flex items-start justify-between gap-4 pr-8">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                  <FileQuestion
                    size={17}
                    strokeWidth={1.7}
                    className="text-[#5B8CFF]"
                  />
                </div>
              </div>

              <h3 className="mt-5 truncate text-[15px] font-medium text-white">
                {quiz.title}
              </h3>

              <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-white/40">
                {quiz.description ?? "AI-generated quiz."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-white/[0.08] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white/45">
                  {quiz.requestedQuestionCount} questions
                </span>

                <span className="rounded-md border border-white/[0.08] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white/45">
                  {quiz.difficulty}
                </span>

                <span className="rounded-md border border-[#5B8CFF]/20 bg-[#5B8CFF]/[0.08] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7AA3FF]">
                  {quiz.generationMode}
                </span>
              </div>
            </button>

            {/* ---------------------------------------------------------------- */}
            {/* Action menu */}
            {/* ---------------------------------------------------------------- */}

            <div
              ref={openMenuId === quiz.publicId ? menuRef : null}
              className="absolute right-3 top-3"
            >
              <button
                type="button"
                aria-label={`Actions for ${quiz.title}`}
                onClick={(event) => {
                  event.stopPropagation();

                  setOpenMenuId((current) =>
                    current === quiz.publicId ? null : quiz.publicId,
                  );
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-white/30 transition-colors hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white/70"
              >
                <Ellipsis size={17} strokeWidth={1.8} />
              </button>

              {openMenuId === quiz.publicId && (
                <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#111111] p-1 shadow-2xl shadow-black/50">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenShare(quiz);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[12px] text-white/65 transition-colors hover:bg-white/[0.05] hover:text-white"
                  >
                    <Share2 size={14} strokeWidth={1.7} />
                    Share quiz
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenShares(quiz);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[12px] text-white/65 transition-colors hover:bg-white/[0.05] hover:text-white"
                  >
                    <UserRound size={14} strokeWidth={1.7} />
                    Manage shares
                  </button>

                  <div className="my-1 border-t border-white/[0.06]" />

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenDelete(quiz);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[12px] text-red-400/80 transition-colors hover:bg-red-500/[0.06] hover:text-red-400"
                  >
                    <Trash2 size={14} strokeWidth={1.7} />
                    Delete quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ====================================================================== */}
      {/* Modal backdrop */}
      {/* ====================================================================== */}

      {modal !== null && activeQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          {/* ================================================================ */}
          {/* Share modal */}
          {/* ================================================================ */}

          {modal === "share" && (
            <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#111111] shadow-2xl shadow-black/60">
              <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#5B8CFF]">
                    Share quiz
                  </p>

                  <h3 className="mt-1.5 text-[16px] font-semibold text-white">
                    Share with a learner
                  </h3>

                  <p className="mt-1 text-[12px] text-white/35">
                    {activeQuiz.title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/70"
                >
                  <X size={17} strokeWidth={1.7} />
                </button>
              </div>

              <form onSubmit={handleShare} className="p-5">
                <label
                  htmlFor="quiz-share-handle"
                  className="text-[11px] font-medium text-white/55"
                >
                  User handle
                </label>

                <div className="mt-2 flex items-center rounded-lg border border-[#292929] bg-[#0D0D0D] transition-colors focus-within:border-[#5B8CFF]/50">
                  <span className="pl-3 text-[13px] text-white/25">@</span>

                  <input
                    id="quiz-share-handle"
                    type="text"
                    value={userHandle}
                    onChange={(event) => {
                      setUserHandle(event.target.value.replace(/^@/, ""));
                      setShareSuccess(false);
                    }}
                    placeholder="username"
                    autoComplete="off"
                    className="w-full bg-transparent px-2.5 py-3 text-[13px] text-white outline-none placeholder:text-white/20"
                    disabled={sharing}
                  />
                </div>

                {error && !shareSuccess && (
                  <p className="mt-2 text-[11px] text-red-400/80">{error}</p>
                )}

                {shareSuccess && (
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400/80">
                    <Check size={14} strokeWidth={1.8} />
                    Quiz shared successfully.
                  </div>
                )}

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={sharing}
                    className="rounded-lg px-3.5 py-2.5 text-[12px] font-medium text-white/45 transition-colors hover:bg-white/[0.04] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    disabled={sharing || !userHandle.trim()}
                    className="flex min-w-[92px] items-center justify-center gap-2 rounded-lg bg-[#5B8CFF] px-4 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[#6D99FF] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sharing ? (
                      <>
                        <Loader2
                          size={14}
                          strokeWidth={1.8}
                          className="animate-spin"
                        />
                        Sharing
                      </>
                    ) : (
                      <>
                        <Share2 size={14} strokeWidth={1.7} />
                        Share
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================ */}
          {/* Manage shares modal */}
          {/* ================================================================ */}

          {modal === "shares" && (
            <div className="w-full max-w-lg rounded-2xl border border-[#2A2A2A] bg-[#111111] shadow-2xl shadow-black/60">
              <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#5B8CFF]">
                    Quiz sharing
                  </p>

                  <h3 className="mt-1.5 text-[16px] font-semibold text-white">
                    Manage shares
                  </h3>

                  <p className="mt-1 truncate text-[12px] text-white/35">
                    {activeQuiz.title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={revokingShare}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/70 disabled:opacity-40"
                >
                  <X size={17} strokeWidth={1.7} />
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-5">
                {loadingShares ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2
                      size={20}
                      strokeWidth={1.7}
                      className="animate-spin text-white/30"
                    />
                  </div>
                ) : quizShares?.shares.length ? (
                  <div className="space-y-2">
                    {quizShares.shares.map((share) => {
                      const isRevoked = Boolean(share.revokedAt);

                      return (
                        <div
                          key={share.sharePublicId}
                          className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-[#0D0D0D] px-3.5 py-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.03]">
                                <UserRound
                                  size={13}
                                  strokeWidth={1.7}
                                  className="text-white/40"
                                />
                              </div>

                              <p className="truncate text-[12px] font-medium text-white/75">
                                @{share.recipient.userHandle}
                              </p>
                            </div>

                            <p className="mt-1 pl-9 text-[10px] text-white/25">
                              Shared{" "}
                              {new Date(share.sharedAt).toLocaleDateString()}
                            </p>
                          </div>

                          {isRevoked ? (
                            <span className="shrink-0 rounded-md border border-white/[0.07] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-white/25">
                              Revoked
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleRevokeShare(share.sharePublicId)
                              }
                              disabled={revokingShare}
                              className="shrink-0 rounded-md border border-red-500/10 px-2.5 py-1.5 text-[10px] font-medium text-red-400/70 transition-colors hover:border-red-500/20 hover:bg-red-500/[0.06] hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {revokingShare ? "Revoking..." : "Revoke"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03]">
                      <Share2
                        size={17}
                        strokeWidth={1.7}
                        className="text-white/25"
                      />
                    </div>

                    <p className="mt-3 text-[12px] text-white/45">
                      No shares yet.
                    </p>

                    <p className="mt-1 text-[11px] text-white/25">
                      Share this quiz with another learner.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t border-white/[0.06] px-5 py-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={revokingShare}
                  className="rounded-lg px-3.5 py-2.5 text-[12px] font-medium text-white/45 transition-colors hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-40"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* Delete confirmation */}
          {/* ================================================================ */}

          {modal === "delete" && (
            <div className="w-full max-w-sm rounded-2xl border border-[#2A2A2A] bg-[#111111] shadow-2xl shadow-black/60">
              <div className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/10 bg-red-500/[0.06]">
                  <Trash2
                    size={18}
                    strokeWidth={1.7}
                    className="text-red-400/80"
                  />
                </div>

                <h3 className="mt-5 text-[16px] font-semibold text-white">
                  Delete this quiz?
                </h3>

                <p className="mt-2 text-[12px] leading-5 text-white/40">
                  <span className="text-white/65">{activeQuiz.title}</span> will
                  be removed from your quizzes. Existing attempt history will be
                  preserved.
                </p>

                <p className="mt-2 text-[11px] leading-5 text-white/25">
                  Any active shares for this quiz will also be revoked.
                </p>

                {error && (
                  <p className="mt-3 text-[11px] text-red-400/80">{error}</p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={deleting}
                    className="rounded-lg px-3.5 py-2.5 text-[12px] font-medium text-white/45 transition-colors hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex min-w-[105px] items-center justify-center gap-2 rounded-lg bg-red-500/[0.12] px-4 py-2.5 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/[0.18] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {deleting ? (
                      <>
                        <Loader2
                          size={14}
                          strokeWidth={1.8}
                          className="animate-spin"
                        />
                        Deleting
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} strokeWidth={1.7} />
                        Delete quiz
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default GeneratedQuizzes;
