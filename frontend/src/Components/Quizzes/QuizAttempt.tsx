import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Lightbulb,
  Loader2,
  XCircle,
} from "lucide-react";

import { saveQuizAnswer, submitQuizAttempt } from "../../api/quizApi";
import { useAppDispatch, useAppSelector } from "../../hooks/appHook";

type QuizAttemptProps = {
  onSubmitted: () => void;
};

const QuizAttempt = ({ onSubmitted }: QuizAttemptProps) => {
  const dispatch = useAppDispatch();

  const {
    currentAttempt,
    currentQuiz,
    savedAnswers,
    savingAnswer,
    submittingAttempt,
  } = useAppSelector((state) => state.quiz);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const questions = currentAttempt?.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];

  const currentQuizQuestion = currentQuiz?.questions.find(
    (question) => question.publicId === currentQuestion?.publicId,
  );

  const savedAnswer = currentQuestion
    ? (savedAnswers[currentQuestion.publicId] ?? null)
    : null;

  const savedOptionId = savedAnswer?.questionOptionId ?? null;

  const selectedOptionId = pendingOptionId ?? savedOptionId;

  const answeredQuestionIds = new Set(
    Object.values(savedAnswers).map((answer) => answer.questionId),
  );

  if (!currentAttempt || !currentQuestion) {
    return (
      <section className="rounded-xl border border-[#252525] bg-[#111111]">
        <div className="flex min-h-[280px] items-center justify-center px-6 text-center">
          <div>
            <p className="text-[13px] font-medium text-white/70">
              No active quiz attempt
            </p>

            <p className="mt-2 text-[12px] leading-5 text-white/30">
              Start a quiz to begin answering questions.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const isCurrentQuestionAnswered = answeredQuestionIds.has(
    currentQuestion.publicId,
  );

  const isCurrentQuestionCorrect = savedAnswer?.isCorrect ?? false;

  const correctOptionNumber = currentQuizQuestion?.correctOptionNumber;

  const correctOption = currentQuestion.options.find(
    (option) => option.optionNumber === correctOptionNumber,
  );

  const handleSelectOption = (optionPublicId: string) => {
    if (savingAnswer || submittingAttempt || isCurrentQuestionAnswered) {
      return;
    }

    setPendingOptionId(optionPublicId);
  };

  const handleSaveAnswer = async () => {
    if (
      !selectedOptionId ||
      savingAnswer ||
      submittingAttempt ||
      isCurrentQuestionAnswered
    ) {
      return;
    }

    const result = await dispatch(
      saveQuizAnswer({
        attemptPublicId: currentAttempt.publicId,
        questionPublicId: currentQuestion.publicId,
        questionOptionId: selectedOptionId,
      }),
    );

    if (saveQuizAnswer.fulfilled.match(result)) {
      setPendingOptionId(null);
    }
  };

  const handlePrevious = () => {
    if (savingAnswer || submittingAttempt) {
      return;
    }

    if (currentQuestionIndex === 0) {
      return;
    }

    setCurrentQuestionIndex((index) => index - 1);
    setPendingOptionId(null);
    setShowHint(false);
  };

  const handleNext = () => {
    if (
      savingAnswer ||
      submittingAttempt ||
      !isCurrentQuestionAnswered ||
      isLastQuestion
    ) {
      return;
    }

    setCurrentQuestionIndex((index) => index + 1);
    setPendingOptionId(null);
    setShowHint(false);
  };

  const handleQuestionNavigation = (index: number) => {
    if (savingAnswer || submittingAttempt) {
      return;
    }

    setCurrentQuestionIndex(index);
    setPendingOptionId(null);
    setShowHint(false);
  };

  const handleSubmit = async () => {
    if (savingAnswer || submittingAttempt || !isCurrentQuestionAnswered) {
      return;
    }

    const result = await dispatch(submitQuizAttempt(currentAttempt.publicId));

    if (submitQuizAttempt.fulfilled.match(result)) {
      onSubmitted();
    }
  };

  const answeredCount = answeredQuestionIds.size;

  const progressPercentage =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  return (
    <section className="rounded-xl border border-[#252525] bg-[#111111]">
      <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#5B8CFF]">
              Quiz attempt
            </p>

            <p className="mt-1.5 text-[12px] text-white/40">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-white/35">
              {answeredCount} / {questions.length} answered
            </p>
          </div>
        </div>

        <div className="mt-5 h-[2px] overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[#5B8CFF] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-[760px]">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border border-white/[0.08] bg-white/[0.025] text-[11px] font-medium text-white/40">
              {currentQuestion.questionNumber}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-medium leading-7 tracking-[-0.01em] text-white sm:text-[18px]">
                {currentQuestion.questionText}
              </h2>

              <p className="mt-2 text-[11px] text-white/25">
                {isCurrentQuestionAnswered
                  ? "Answer submitted."
                  : "Select one answer."}
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-2.5">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option.publicId;

              const isCorrectOption =
                isCurrentQuestionAnswered &&
                option.optionNumber === correctOptionNumber;

              const isWrongSelectedOption =
                isCurrentQuestionAnswered &&
                isSelected &&
                !savedAnswer?.isCorrect;

              return (
                <button
                  key={option.publicId}
                  type="button"
                  onClick={() => handleSelectOption(option.publicId)}
                  disabled={
                    savingAnswer ||
                    submittingAttempt ||
                    isCurrentQuestionAnswered
                  }
                  className={`group flex w-full items-center gap-3 rounded-[9px] border px-4 py-3 text-left transition-colors ${
                    isCorrectOption
                      ? "border-emerald-400/30 bg-emerald-400/[0.07]"
                      : isWrongSelectedOption
                        ? "border-red-400/30 bg-red-400/[0.06]"
                        : isSelected
                          ? "border-[#5B8CFF]/40 bg-[#5B8CFF]/[0.08]"
                          : "border-white/[0.07] bg-white/[0.015] hover:border-white/[0.14] hover:bg-white/[0.025]"
                  } disabled:cursor-not-allowed`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] transition-colors ${
                      isCorrectOption
                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                        : isWrongSelectedOption
                          ? "border-red-400/40 bg-red-400/10 text-red-300"
                          : isSelected
                            ? "border-[#5B8CFF]/50 bg-[#5B8CFF]/10 text-[#7AA3FF]"
                            : "border-white/[0.10] text-white/35 group-hover:text-white/55"
                    }`}
                  >
                    {String.fromCharCode(65 + option.optionNumber - 1)}
                  </span>

                  <span
                    className={`flex-1 text-[12px] leading-5 ${
                      isCorrectOption
                        ? "text-emerald-100/90"
                        : isWrongSelectedOption
                          ? "text-red-100/80"
                          : isSelected
                            ? "text-white/85"
                            : "text-white/55"
                    }`}
                  >
                    {option.optionText}
                  </span>

                  {isCorrectOption && (
                    <CheckCircle2
                      size={15}
                      strokeWidth={1.8}
                      className="shrink-0 text-emerald-400"
                    />
                  )}

                  {isWrongSelectedOption && (
                    <XCircle
                      size={15}
                      strokeWidth={1.8}
                      className="shrink-0 text-red-400"
                    />
                  )}

                  {!isCurrentQuestionAnswered && isSelected && (
                    <Check
                      size={15}
                      strokeWidth={2}
                      className="shrink-0 text-[#5B8CFF]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint */}
          {currentQuizQuestion?.hint && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowHint((visible) => !visible)}
                className="inline-flex items-center gap-2 text-[11px] text-[#7AA3FF] transition-colors hover:text-white"
              >
                <Lightbulb size={14} strokeWidth={1.7} />

                {showHint ? "Hide hint" : "Show hint"}
              </button>

              {showHint && (
                <div className="mt-3 rounded-[9px] border border-[#5B8CFF]/15 bg-[#5B8CFF]/[0.035] px-4 py-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7AA3FF]">
                    Hint
                  </p>

                  <p className="mt-1.5 text-[12px] leading-5 text-white/45">
                    {currentQuizQuestion.hint}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Answer feedback */}
          {isCurrentQuestionAnswered && (
            <div className="mt-6 space-y-3">
              <div
                className={`rounded-[9px] border px-4 py-3.5 ${
                  isCurrentQuestionCorrect
                    ? "border-emerald-400/20 bg-emerald-400/[0.05]"
                    : "border-red-400/20 bg-red-400/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCurrentQuestionCorrect ? (
                    <CheckCircle2
                      size={16}
                      strokeWidth={1.8}
                      className="text-emerald-400"
                    />
                  ) : (
                    <XCircle
                      size={16}
                      strokeWidth={1.8}
                      className="text-red-400"
                    />
                  )}

                  <p
                    className={`text-[12px] font-medium ${
                      isCurrentQuestionCorrect
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {isCurrentQuestionCorrect
                      ? "Correct answer"
                      : "Incorrect answer"}
                  </p>
                </div>

                {!isCurrentQuestionCorrect && correctOption && (
                  <p className="mt-2 text-[12px] leading-5 text-white/50">
                    Correct answer:{" "}
                    <span className="text-white/75">
                      {correctOption.optionText}
                    </span>
                  </p>
                )}
              </div>

              {currentQuizQuestion?.explanation && (
                <div className="rounded-[9px] border border-white/[0.07] bg-white/[0.015] px-4 py-3.5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
                    Explanation
                  </p>

                  <p className="mt-2 text-[12px] leading-5 text-white/50">
                    {currentQuizQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={
                currentQuestionIndex === 0 || savingAnswer || submittingAttempt
              }
              className="flex h-10 items-center justify-center gap-2 rounded-[8px] border border-white/[0.08] bg-[#0D0D0D] px-4 text-[12px] text-white/50 transition-colors hover:border-white/[0.15] hover:text-white/75 disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ArrowLeft size={14} strokeWidth={1.7} />
              Previous
            </button>

            <div className="flex flex-col gap-2 sm:flex-row">
              {!isCurrentQuestionAnswered ? (
                <button
                  type="button"
                  onClick={handleSaveAnswer}
                  disabled={!selectedOptionId || savingAnswer}
                  className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-white px-4 text-[12px] font-medium text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/25"
                >
                  {savingAnswer ? (
                    <>
                      <Loader2
                        size={14}
                        strokeWidth={1.8}
                        className="animate-spin"
                      />
                      Checking...
                    </>
                  ) : (
                    <>
                      Check answer
                      <CheckCircle2 size={14} strokeWidth={1.7} />
                    </>
                  )}
                </button>
              ) : !isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={savingAnswer || submittingAttempt}
                  className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-white px-4 text-[12px] font-medium text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/25"
                >
                  Next question
                  <ArrowRight size={14} strokeWidth={1.7} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={savingAnswer || submittingAttempt}
                  className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-white px-4 text-[12px] font-medium text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/25"
                >
                  {submittingAttempt ? (
                    <>
                      <Loader2
                        size={14}
                        strokeWidth={1.8}
                        className="animate-spin"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} strokeWidth={1.7} />
                      Submit quiz
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-1.5">
            {questions.map((question, index) => {
              const answered = answeredQuestionIds.has(question.publicId);
              const active = index === currentQuestionIndex;

              return (
                <button
                  key={question.publicId}
                  type="button"
                  onClick={() => handleQuestionNavigation(index)}
                  disabled={savingAnswer || submittingAttempt}
                  aria-label={`Go to question ${question.questionNumber}`}
                  className={`flex h-7 min-w-7 items-center justify-center rounded-[6px] border px-1.5 text-[10px] transition-colors ${
                    active
                      ? "border-[#5B8CFF]/50 bg-[#5B8CFF]/10 text-[#7AA3FF]"
                      : answered
                        ? "border-white/[0.12] bg-white/[0.05] text-white/60"
                        : "border-white/[0.06] bg-transparent text-white/25 hover:border-white/[0.12] hover:text-white/50"
                  }`}
                >
                  {question.questionNumber}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuizAttempt;
