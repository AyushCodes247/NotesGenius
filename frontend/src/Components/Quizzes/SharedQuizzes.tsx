import { ArrowRight, BookOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { SharedQuiz } from "../../api/quizApi";

type SharedQuizzesProps = {
  quizzes: SharedQuiz[];
  loading: boolean;
};

const SharedQuizzes = ({ quizzes, loading }: SharedQuizzesProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-white/[0.08] bg-white/[0.025]">
            <Users size={15} strokeWidth={1.7} className="text-white/30" />
          </div>

          <div>
            <h2 className="text-[14px] font-medium text-white/75">
              Shared with you
            </h2>

            <p className="mt-1 text-[11px] text-white/25">
              Quizzes other learners have shared with you.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-xl border border-[#252525] bg-[#111111]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (quizzes.length === 0) {
    return (
      <section>
        <div className="rounded-xl border border-[#252525] bg-[#111111]">
          <div className="flex min-h-[220px] items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[8px] border border-white/[0.08] bg-white/[0.025]">
                <Users size={17} strokeWidth={1.7} className="text-white/30" />
              </div>

              <h2 className="mt-4 text-[13px] font-medium text-white/60">
                No shared quizzes
              </h2>

              <p className="mx-auto mt-2 max-w-[360px] text-[12px] leading-5 text-white/30">
                Quizzes shared with you will appear here.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-white/[0.08] bg-white/[0.025]">
          <Users size={15} strokeWidth={1.7} className="text-[#5B8CFF]" />
        </div>

        <div>
          <h2 className="text-[14px] font-medium text-white/75">
            Shared with you
          </h2>

          <p className="mt-1 text-[11px] text-white/25">
            Quizzes other learners have shared with you.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <article
            key={quiz.sharePublicId}
            className="group flex min-h-[210px] flex-col rounded-xl border border-[#252525] bg-[#111111] transition-colors hover:border-white/[0.12]"
          >
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-white/[0.08] bg-white/[0.025]">
                  <BookOpen
                    size={16}
                    strokeWidth={1.7}
                    className="text-[#5B8CFF]"
                  />
                </div>

                <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-white/35">
                  {quiz.difficulty}
                </span>
              </div>

              <h3 className="mt-5 line-clamp-2 text-[14px] font-medium leading-5 text-white/80">
                {quiz.title}
              </h3>

              {quiz.description && (
                <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-white/30">
                  {quiz.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/25">
                <span>{quiz.requestedQuestionCount} questions</span>

                <span className="h-1 w-1 rounded-full bg-white/15" />

                <span className="capitalize">{quiz.generationMode}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-4">
              <p className="text-[10px] text-white/25">
                Shared {new Date(quiz.sharedAt).toLocaleDateString()}
              </p>

              <button
                type="button"
                onClick={() => navigate(`/quizzes/${quiz.quizPublicId}`)}
                className="flex h-8 items-center justify-center gap-1.5 rounded-[7px] border border-white/[0.08] bg-white/[0.02] px-3 text-[10px] font-medium text-white/50 transition-colors hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white/80"
              >
                Open
                <ArrowRight size={12} strokeWidth={1.8} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SharedQuizzes;
