import { BarChart3, CheckCircle2, RotateCcw, Trophy } from "lucide-react";

import type { QuizAttempt } from "../../api/quizApi";
import { useAppDispatch } from "../../hooks/appHook";
import { clearCurrentAttempt } from "../../slices/quizSlice";

type QuizResultProps = {
  attempt: QuizAttempt;
  onRetry: () => void;
  onDone: () => void;
};

const QuizResult = ({ attempt, onRetry, onDone }: QuizResultProps) => {
  const dispatch = useAppDispatch();

  const score = attempt.score ?? 0;
  const totalQuestions = attempt.totalQuestions;
  const percentage = attempt.scorePercentage ?? "0";

  const handleRetry = () => {
    dispatch(clearCurrentAttempt());
    onRetry();
  };

  const handleDone = () => {
    dispatch(clearCurrentAttempt());
    onDone();
  };

  return (
    <section className="rounded-xl border border-[#252525] bg-[#111111]">
      <div className="px-5 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-[620px] text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#5B8CFF]/20 bg-[#5B8CFF]/[0.08]">
            <Trophy size={21} strokeWidth={1.6} className="text-[#5B8CFF]" />
          </div>

          <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#5B8CFF]">
            Quiz completed
          </p>

          <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.035em] text-white sm:text-[28px]">
            Your result
          </h2>

          <p className="mt-2 text-[12px] leading-5 text-white/35">
            Your attempt has been submitted and your score has been recorded.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-[10px] border border-white/[0.07] bg-[#0D0D0D] px-4 py-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                Score
              </p>

              <p className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">
                {score}
                <span className="text-[14px] font-normal text-white/25">
                  {" "}
                  / {totalQuestions}
                </span>
              </p>
            </div>

            <div className="rounded-[10px] border border-white/[0.07] bg-[#0D0D0D] px-4 py-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                Accuracy
              </p>

              <p className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">
                {percentage}%
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-[8px] bg-white/[0.05]">
            <div
              className="h-1 rounded-full bg-[#5B8CFF] transition-all duration-700"
              style={{
                width: `${Math.min(Number(percentage), 100)}%`,
              }}
            />
          </div>

          <div className="mt-7 flex flex-col gap-2 text-left">
            <div className="flex items-center gap-3 rounded-[8px] border border-white/[0.06] bg-white/[0.015] px-4 py-3">
              <CheckCircle2
                size={15}
                strokeWidth={1.7}
                className="shrink-0 text-[#5B8CFF]"
              />

              <div>
                <p className="text-[12px] text-white/65">Attempt submitted</p>

                <p className="mt-0.5 text-[11px] text-white/25">
                  Your result is now available in quiz analytics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[8px] border border-white/[0.06] bg-white/[0.015] px-4 py-3">
              <BarChart3
                size={15}
                strokeWidth={1.7}
                className="shrink-0 text-white/35"
              />

              <div>
                <p className="text-[12px] text-white/65">Keep practicing</p>

                <p className="mt-0.5 text-[11px] text-white/25">
                  Retry the quiz to improve your understanding.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleRetry}
              className="flex h-10 items-center justify-center gap-2 rounded-[8px] border border-white/[0.08] bg-[#0D0D0D] px-4 text-[12px] text-white/55 transition-colors hover:border-white/[0.15] hover:text-white/80"
            >
              <RotateCcw size={14} strokeWidth={1.7} />
              Try again
            </button>

            <button
              type="button"
              onClick={handleDone}
              className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-white px-4 text-[12px] font-medium text-black transition-colors hover:bg-white/90"
            >
              Back to quizzes
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuizResult;
