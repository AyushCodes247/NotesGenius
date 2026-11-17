import { BarChart3, Loader2, TrendingUp } from "lucide-react";

import type { QuizStats } from "../../api/quizApi";

type QuizAnalyticsProps = {
  stats: QuizStats | null;
  loading: boolean;
};

const QuizAnalytics = ({ stats, loading }: QuizAnalyticsProps) => {
  if (loading) {
    return (
      <section className="rounded-xl border border-[#252525] bg-[#111111]">
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="flex items-center gap-2 text-[12px] text-white/40">
            <Loader2 size={15} strokeWidth={1.7} className="animate-spin" />
            Loading analytics...
          </div>
        </div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="rounded-xl border border-[#252525] bg-[#111111]">
        <div className="flex min-h-[240px] items-center justify-center px-6 text-center">
          <div>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[8px] border border-white/[0.08] bg-white/[0.025]">
              <BarChart3
                size={17}
                strokeWidth={1.7}
                className="text-white/30"
              />
            </div>

            <p className="mt-4 text-[13px] font-medium text-white/60">
              No analytics yet
            </p>

            <p className="mx-auto mt-2 max-w-[360px] text-[12px] leading-5 text-white/30">
              Complete a quiz attempt to start building your performance
              history.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const latestAttempt = stats.latestAttempt;

  return (
    <section className="rounded-xl border border-[#252525] bg-[#111111]">
      <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-white/[0.08] bg-white/[0.03]">
            <BarChart3 size={17} strokeWidth={1.7} className="text-[#5B8CFF]" />
          </div>

          <div>
            <h2 className="text-[14px] font-medium text-white">
              Quiz analytics
            </h2>

            <p className="mt-1 text-[12px] leading-5 text-white/35">
              Track your performance across completed attempts.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[9px] border border-white/[0.06] bg-[#0D0D0D] p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
              Attempts
            </p>

            <p className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
              {stats.totalAttempts}
            </p>
          </div>

          <div className="rounded-[9px] border border-white/[0.06] bg-[#0D0D0D] p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
              Best score
            </p>

            <p className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
              {stats.bestScore ?? "—"}
            </p>
          </div>

          <div className="rounded-[9px] border border-white/[0.06] bg-[#0D0D0D] p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
              Best accuracy
            </p>

            <p className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
              {stats.bestPercentage !== null ? `${stats.bestPercentage}%` : "—"}
            </p>
          </div>

          <div className="rounded-[9px] border border-white/[0.06] bg-[#0D0D0D] p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
              Average accuracy
            </p>

            <p className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
              {stats.averagePercentage !== null
                ? `${stats.averagePercentage}%`
                : "—"}
            </p>
          </div>
        </div>

        {stats.attemptHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-medium text-white/75">
                  Performance history
                </h3>

                <p className="mt-1 text-[11px] text-white/25">
                  Accuracy across your completed attempts.
                </p>
              </div>

              <TrendingUp
                size={16}
                strokeWidth={1.7}
                className="text-white/25"
              />
            </div>

            <div className="mt-6 overflow-x-auto">
              <div
                className="flex min-w-[420px] items-end gap-3 border-b border-white/[0.06] px-2"
                style={{ height: "220px" }}
              >
                {stats.attemptHistory.map((attempt) => {
                  const percentage = Number(attempt.scorePercentage);

                  const chartPercentage = Math.min(
                    Math.max(percentage, 0),
                    100,
                  );

                  return (
                    <div
                      key={attempt.attemptPublicId}
                      className="flex h-full min-w-[38px] flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-[10px] text-white/35">
                        {attempt.scorePercentage}%
                      </span>

                      <div className="flex h-[170px] w-full items-end justify-center">
                        <div
                          className="w-full max-w-[38px] rounded-t-[5px] bg-[#5B8CFF]/70 transition-all duration-500"
                          style={{
                            height: `${Math.max(chartPercentage, 3)}%`,
                          }}
                          title={`Attempt ${attempt.attemptNumber}: ${attempt.scorePercentage}%`}
                        />
                      </div>

                      <span className="text-[10px] text-white/25">
                        #{attempt.attemptNumber}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {latestAttempt && (
          <div className="border-t border-white/[0.06] pt-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
              Latest attempt
            </p>

            <div className="mt-3 flex flex-col gap-3 rounded-[9px] border border-white/[0.06] bg-[#0D0D0D] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[13px] font-medium text-white/70">
                  {latestAttempt.score} / {latestAttempt.totalQuestions}
                </p>

                <p className="mt-1 text-[11px] text-white/25">
                  {new Date(latestAttempt.submittedAt).toLocaleString()}
                </p>
              </div>

              <p className="text-[18px] font-semibold text-white">
                {latestAttempt.scorePercentage}%
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuizAnalytics;
