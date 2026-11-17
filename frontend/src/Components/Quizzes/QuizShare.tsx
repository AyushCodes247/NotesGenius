import { useState } from "react";
import { Loader2, Share2, Trash2, UserPlus } from "lucide-react";

import { getQuizShares, revokeQuizShare, shareQuiz } from "../../api/quizApi";
import { useAppDispatch, useAppSelector } from "../../hooks/appHook";

type QuizShareProps = {
  quizPublicId: string;
};

const QuizShare = ({ quizPublicId }: QuizShareProps) => {
  const dispatch = useAppDispatch();

  const { quizShares, sharing, loadingShares, revokingShare } = useAppSelector(
    (state) => state.quiz,
  );

  const [userHandle, setUserHandle] = useState("");

  const handleShare = async () => {
    const trimmedHandle = userHandle.trim().toLowerCase();

    if (!trimmedHandle || sharing) {
      return;
    }

    const result = await dispatch(
      shareQuiz({
        quizPublicId,
        userHandle: trimmedHandle,
      }),
    );

    if (shareQuiz.fulfilled.match(result)) {
      setUserHandle("");
    }
  };

  const handleLoadShares = () => {
    if (!quizPublicId || loadingShares) {
      return;
    }

    dispatch(getQuizShares(quizPublicId));
  };

  const handleRevoke = (sharePublicId: string) => {
    if (revokingShare) {
      return;
    }

    dispatch(
      revokeQuizShare({
        quizPublicId,
        sharePublicId,
      }),
    );
  };

  return (
    <section className="rounded-xl border border-[#252525] bg-[#111111]">
      <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-white/[0.08] bg-white/[0.03]">
            <Share2 size={17} strokeWidth={1.7} className="text-[#5B8CFF]" />
          </div>

          <div>
            <h2 className="text-[14px] font-medium text-white">Share quiz</h2>

            <p className="mt-1 text-[12px] leading-5 text-white/35">
              Share this quiz with another NoteGenius learner.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <label
            htmlFor="quiz-share-handle"
            className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-white/40"
          >
            User handle
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-white/25">
                @
              </span>

              <input
                id="quiz-share-handle"
                type="text"
                value={userHandle}
                onChange={(event) => setUserHandle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleShare();
                  }
                }}
                placeholder="username"
                disabled={sharing}
                className="h-10 w-full rounded-[8px] border border-white/[0.08] bg-[#0D0D0D] pl-7 pr-3 text-[12px] text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/[0.18] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <button
              type="button"
              onClick={handleShare}
              disabled={!userHandle.trim() || sharing}
              className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-white px-4 text-[12px] font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/25"
            >
              {sharing ? (
                <>
                  <Loader2
                    size={14}
                    strokeWidth={1.8}
                    className="animate-spin"
                  />
                  Sharing...
                </>
              ) : (
                <>
                  <UserPlus size={14} strokeWidth={1.8} />
                  Share
                </>
              )}
            </button>
          </div>

          <p className="mt-2 text-[11px] text-white/25">
            Enter the recipient&apos;s NoteGenius handle without the @.
          </p>
        </div>

        <div className="border-t border-white/[0.06] pt-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-medium text-white/65">
                Shared with
              </p>

              <p className="mt-1 text-[11px] text-white/25">
                Manage people who can access this quiz.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLoadShares}
              disabled={loadingShares}
              className="flex h-9 items-center justify-center gap-2 rounded-[8px] border border-white/[0.08] bg-[#0D0D0D] px-3 text-[11px] text-white/45 transition-colors hover:border-white/[0.15] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loadingShares ? (
                <>
                  <Loader2
                    size={13}
                    strokeWidth={1.7}
                    className="animate-spin"
                  />
                  Loading
                </>
              ) : (
                "View shares"
              )}
            </button>
          </div>

          {quizShares?.quizPublicId === quizPublicId &&
            quizShares.shares.length > 0 && (
              <div className="mt-4 space-y-2">
                {quizShares.shares.map((share) => {
                  const revoked = Boolean(share.revokedAt);

                  return (
                    <div
                      key={share.sharePublicId}
                      className="flex flex-col gap-3 rounded-[8px] border border-white/[0.06] bg-[#0D0D0D] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[12px] text-white/65">
                          @{share.recipient.userHandle}
                        </p>

                        <p className="mt-1 text-[10px] text-white/25">
                          Shared {new Date(share.sharedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        {revoked ? (
                          <span className="text-[10px] text-white/25">
                            Revoked
                          </span>
                        ) : (
                          <>
                            <span className="text-[10px] text-[#5B8CFF]/70">
                              Active
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRevoke(share.sharePublicId)}
                              disabled={revokingShare}
                              className="flex h-8 items-center justify-center gap-1.5 rounded-[7px] border border-white/[0.07] px-2.5 text-[10px] text-white/35 transition-colors hover:border-white/[0.14] hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {revokingShare ? (
                                <Loader2
                                  size={12}
                                  strokeWidth={1.7}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={12} strokeWidth={1.7} />
                              )}
                              Revoke
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          {quizShares?.quizPublicId === quizPublicId &&
            quizShares.shares.length === 0 && (
              <div className="mt-4 rounded-[8px] border border-white/[0.06] bg-white/[0.015] px-4 py-4 text-center">
                <p className="text-[11px] text-white/30">
                  This quiz has not been shared yet.
                </p>
              </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default QuizShare;
