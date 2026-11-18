import { useEffect } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { getQuiz, getQuizStats, startQuizAttempt } from "../../api/quizApi";
import { useAppDispatch, useAppSelector } from "../../hooks/appHook";

import QuizAttempt from "./QuizAttempt";

const QuizDetails = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { quizPublicId } = useParams<{ quizPublicId: string }>();

  const {
    currentQuiz,
    currentAttempt,
    stats,
    loadingQuiz,
    startingAttempt,
    loadingStats,
    error,
  } = useAppSelector((state) => state.quiz);

  useEffect(() => {
    if (!quizPublicId) {
      return;
    }

    dispatch(getQuiz(quizPublicId));
    dispatch(getQuizStats(quizPublicId));
  }, [dispatch, quizPublicId]);

  useEffect(() => {
    if (!quizPublicId || loadingStats || currentAttempt) {
      return;
    }

    if (stats?.latestAttempt) {
      navigate(`/quizzes/${quizPublicId}/result`, {
        replace: true,
      });
    }
  }, [
    currentAttempt,
    loadingStats,
    navigate,
    quizPublicId,
    stats?.latestAttempt,
  ]);

  const handleStartQuiz = async () => {
    if (!quizPublicId || startingAttempt) {
      return;
    }

    await dispatch(startQuizAttempt(quizPublicId));
  };

  const handleAttemptSubmitted = () => {
    if (!quizPublicId) {
      return;
    }

    navigate(`/quizzes/${quizPublicId}/result`);
  };

  if (currentAttempt?.status === "in_progress") {
    return (
      <div className="min-h-screen bg-[#080808] px-6 py-8 text-[#F5F5F5] sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-[900px]">
          <button
            type="button"
            onClick={() => navigate("/quizzes")}
            className="mb-6 inline-flex items-center gap-2 text-[12px] text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft size={15} strokeWidth={1.7} />
            Back to quizzes
          </button>

          <QuizAttempt onSubmitted={handleAttemptSubmitted} />
        </div>
      </div>
    );
  }

  if (loadingQuiz || loadingStats) {
    return (
      <div className="min-h-screen bg-[#080808] px-6 py-10 text-[#F5F5F5]">
        <div className="mx-auto flex min-h-[60vh] max-w-[1100px] items-center justify-center">
          <Loader2
            size={20}
            strokeWidth={1.7}
            className="animate-spin text-white/40"
          />
        </div>
      </div>
    );
  }

  if (error || !currentQuiz) {
    return (
      <div className="min-h-screen bg-[#080808] px-6 py-10 text-[#F5F5F5]">
        <div className="mx-auto max-w-[1100px]">
          <button
            type="button"
            onClick={() => navigate("/quizzes")}
            className="mb-8 inline-flex items-center gap-2 text-[12px] text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft size={15} strokeWidth={1.7} />
            Back to quizzes
          </button>

          <div className="rounded-xl border border-[#252525] bg-[#111111] p-6">
            <p className="text-[13px] text-white/50">
              {error ?? "Unable to load this quiz."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { quiz, questions } = currentQuiz;

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5]">
      <div className="mx-auto w-full max-w-[1100px]">
        <header className="border-b border-white/[0.08] px-6 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#5B8CFF]">
                {quiz.difficulty} · {quiz.requestedQuestionCount} questions
              </p>

              <h1 className="text-[25px] font-semibold tracking-[-0.03em] text-white sm:text-[28px]">
                {quiz.title}
              </h1>

              {quiz.description && (
                <p className="mt-3 max-w-[650px] text-[13px] leading-6 text-white/40">
                  {quiz.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleStartQuiz}
              disabled={startingAttempt}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-[12px] font-semibold text-[#080808] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {startingAttempt ? (
                <>
                  <Loader2
                    size={15}
                    strokeWidth={1.8}
                    className="animate-spin"
                  />
                  Starting
                </>
              ) : (
                <>
                  Start quiz
                  <ArrowRight size={15} strokeWidth={1.8} />
                </>
              )}
            </button>
          </div>
        </header>

        <section>
          {questions.map((question) => (
            <article
              key={question.publicId}
              className="border-b border-white/[0.08] px-6 py-7 sm:px-8 lg:px-10"
            >
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[11px] font-medium text-white/50">
                  {question.questionNumber}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-[14px] font-medium leading-6 text-white/90">
                    {question.questionText}
                  </h2>

                  <div className="mt-5 space-y-2.5">
                    {question.options.map((option) => (
                      <div
                        key={option.publicId}
                        className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-[#111111] px-3.5 py-3"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.10] text-[10px] font-medium text-white/40">
                          {String.fromCharCode(64 + option.optionNumber)}
                        </span>

                        <span className="text-[12px] leading-5 text-white/50">
                          {option.optionText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <div className="px-6 py-8 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={handleStartQuiz}
            disabled={startingAttempt}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.10] bg-[#111111] px-5 py-3 text-[12px] font-medium text-white/70 transition-colors hover:bg-[#171717] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {startingAttempt ? (
              <>
                <Loader2 size={15} strokeWidth={1.8} className="animate-spin" />
                Starting quiz
              </>
            ) : (
              <>
                Start quiz
                <ArrowRight size={15} strokeWidth={1.8} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizDetails;
