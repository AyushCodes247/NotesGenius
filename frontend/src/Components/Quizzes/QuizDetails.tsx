import { useEffect } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

import { getQuiz, startQuizAttempt } from "../../api/quizApi";
import { useAppDispatch, useAppSelector } from "../../hooks/appHook";

type QuizDetailsProps = {
  quizPublicId: string;
};

const QuizDetails = ({ quizPublicId }: QuizDetailsProps) => {
  const dispatch = useAppDispatch();

  const { currentQuiz, loadingQuiz, startingAttempt } = useAppSelector(
    (state) => state.quiz,
  );

  useEffect(() => {
    if (!quizPublicId) {
      return;
    }

    dispatch(getQuiz(quizPublicId));
  }, [dispatch, quizPublicId]);

  const handleStartAttempt = () => {
    if (!quizPublicId || startingAttempt) {
      return;
    }

    dispatch(startQuizAttempt(quizPublicId));
  };

  if (loadingQuiz) {
    return (
      <section className="rounded-xl border border-[#252525] bg-[#111111]">
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="flex items-center gap-2 text-[12px] text-white/40">
            <Loader2 size={15} strokeWidth={1.7} className="animate-spin" />
            Loading quiz...
          </div>
        </div>
      </section>
    );
  }

  if (!currentQuiz || currentQuiz.quiz.publicId !== quizPublicId) {
    return (
      <section className="rounded-xl border border-[#252525] bg-[#111111]">
        <div className="flex min-h-[280px] items-center justify-center px-6 text-center">
          <div>
            <p className="text-[13px] font-medium text-white/70">
              Quiz unavailable
            </p>

            <p className="mt-2 text-[12px] leading-5 text-white/30">
              This quiz could not be loaded.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { quiz, questions } = currentQuiz;

  return (
    <section className="rounded-xl border border-[#252525] bg-[#111111]">
      <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5B8CFF]">
              {quiz.difficulty} · {quiz.requestedQuestionCount} questions
            </p>

            <h2 className="truncate text-[20px] font-semibold tracking-[-0.025em] text-white">
              {quiz.title}
            </h2>

            {quiz.description && (
              <p className="mt-2 max-w-[650px] text-[12px] leading-5 text-white/35">
                {quiz.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleStartAttempt}
            disabled={startingAttempt || questions.length === 0}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-[8px] bg-white px-4 text-[12px] font-medium text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/25"
          >
            {startingAttempt ? (
              <>
                <Loader2 size={14} strokeWidth={1.8} className="animate-spin" />
                Starting...
              </>
            ) : (
              <>
                Start quiz
                <ArrowRight size={14} strokeWidth={1.8} />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {questions.map((question) => (
          <div key={question.publicId} className="px-5 py-5 sm:px-6">
            <div className="flex gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-white/[0.08] bg-white/[0.025] text-[10px] font-medium text-white/35">
                {question.questionNumber}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-6 text-white/85">
                  {question.questionText}
                </p>

                <div className="mt-4 space-y-2">
                  {question.options.map((option) => {
                    const isCorrect =
                      question.correctOptionNumber === option.optionNumber;

                    return (
                      <div
                        key={option.publicId}
                        className={`flex items-start gap-3 rounded-[8px] border px-3 py-2.5 ${
                          isCorrect
                            ? "border-[#5B8CFF]/30 bg-[#5B8CFF]/[0.06]"
                            : "border-white/[0.06] bg-white/[0.015]"
                        }`}
                      >
                        <span className="mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.10] text-[10px] text-white/35">
                          {String.fromCharCode(64 + option.optionNumber)}
                        </span>

                        <span className="flex-1 text-[12px] leading-5 text-white/55">
                          {option.optionText}
                        </span>

                        {isCorrect && (
                          <CheckCircle2
                            size={14}
                            strokeWidth={1.7}
                            className="mt-0.5 shrink-0 text-[#5B8CFF]"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {question.explanation && (
                  <div className="mt-4 rounded-[8px] border border-white/[0.06] bg-white/[0.015] px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
                      Explanation
                    </p>

                    <p className="mt-1.5 text-[12px] leading-5 text-white/40">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuizDetails;
