import {
  BarChart3,
  CheckCircle2,
  CircleAlert,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import gsap from "gsap";

import { getQuizStats, startQuizAttempt } from "../../api/quizApi";
import { useAppDispatch, useAppSelector } from "../../hooks/appHook";
import { clearCurrentAttempt } from "../../slices/quizSlice";

const QuizResult = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { quizPublicId } = useParams<{ quizPublicId: string }>();

  const resultRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<SVGCircleElement | null>(null);
  const percentageRef = useRef<HTMLSpanElement | null>(null);

  const { currentAttempt, stats, loadingStats, startingAttempt } =
    useAppSelector((state) => state.quiz);

  useEffect(() => {
    if (!quizPublicId) {
      return;
    }

    dispatch(getQuizStats(quizPublicId));
  }, [dispatch, quizPublicId]);

  const latestAttempt = stats?.latestAttempt;

  const score = currentAttempt?.score ?? latestAttempt?.score ?? 0;

  const totalQuestions =
    currentAttempt?.totalQuestions ?? latestAttempt?.totalQuestions ?? 0;

  const percentage = Number(
    currentAttempt?.scorePercentage ?? latestAttempt?.scorePercentage ?? 0,
  );

  const correctAnswers = Math.max(0, Math.min(score, totalQuestions));

  const incorrectAnswers = Math.max(0, totalQuestions - correctAnswers);

  const bestPercentage = stats?.bestPercentage ?? percentage;
  const averagePercentage = stats?.averagePercentage ?? percentage;
  const totalAttempts = stats?.totalAttempts ?? 1;
  const history = stats?.attemptHistory ?? [];

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!resultRef.current) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-result-header]",
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
        },
      );

      gsap.fromTo(
        "[data-result-chart]",
        { opacity: 0, scale: 0.94 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.65,
          delay: 0.12,
          ease: "power2.out",
        },
      );

      gsap.fromTo(
        "[data-result-stat]",
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.07,
          delay: 0.18,
          ease: "power2.out",
        },
      );

      gsap.fromTo(
        "[data-result-panel]",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          delay: 0.28,
          ease: "power2.out",
        },
      );

      gsap.fromTo(
        "[data-result-actions]",
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          delay: 0.42,
          ease: "power2.out",
        },
      );
    }, resultRef);

    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!chartRef.current || !percentageRef.current) {
      return;
    }

    const chart = chartRef.current;
    const percentageElement = percentageRef.current;

    const progress = Math.max(0, Math.min(percentage, 100));

    gsap.set(chart, {
      strokeDashoffset: circumference,
    });

    gsap.set(percentageElement, {
      textContent: "0%",
    });

    const animation = gsap.timeline();

    animation.to(chart, {
      strokeDashoffset: circumference - (progress / 100) * circumference,
      duration: 1.25,
      delay: 0.3,
      ease: "power3.out",
    });

    const counter = { value: 0 };

    animation.to(
      counter,
      {
        value: progress,
        duration: 1.25,
        ease: "power3.out",
        onUpdate: () => {
          if (percentageElement) {
            percentageElement.textContent = `${Math.round(counter.value)}%`;
          }
        },
      },
      "<",
    );

    return () => {
      animation.kill();
    };
  }, [percentage, circumference]);

  const handleRetry = async () => {
    if (!quizPublicId || startingAttempt) {
      return;
    }

    dispatch(clearCurrentAttempt());

    const result = await dispatch(startQuizAttempt(quizPublicId));

    if (startQuizAttempt.fulfilled.match(result)) {
      navigate(`/quizzes/${quizPublicId}`);
    }
  };

  const handleDone = () => {
    dispatch(clearCurrentAttempt());
    navigate("/quizzes");
  };

  if (loadingStats && !stats && !currentAttempt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080808]">
        <div className="flex items-center gap-2 text-[12px] text-white/35">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5B8CFF]" />
          Loading result
        </div>
      </div>
    );
  }

  if (!currentAttempt && !latestAttempt) {
    return (
      <div className="min-h-screen bg-[#080808] px-6 py-10 text-[#F5F5F5]">
        <div className="mx-auto max-w-[900px]">
          <button
            type="button"
            onClick={() => navigate("/quizzes")}
            className="mb-8 inline-flex items-center gap-2 text-[12px] text-white/40 transition-colors hover:text-white"
          >
            Back to quizzes
          </button>

          <div className="rounded-xl border border-[#252525] bg-[#111111] p-6">
            <p className="text-[13px] text-white/50">
              Unable to load the quiz result.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={resultRef} className="min-h-screen bg-[#080808] text-[#F5F5F5]">
      <div className="mx-auto w-full max-w-[1000px] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        {/* Header */}
        <header
          data-result-header
          className="border-b border-white/[0.08] pb-8"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#5B8CFF]">
            Quiz result
          </p>

          <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.035em] text-white sm:text-[32px]">
            Your performance
          </h1>

          <p className="mt-2 max-w-[560px] text-[13px] leading-6 text-white/40">
            Review your accuracy, compare your performance, and use the feedback
            to strengthen your understanding.
          </p>
        </header>

        {/* Main result */}
        <section
          data-result-panel
          className="mt-8 rounded-xl border border-[#252525] bg-[#111111]"
        >
          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[280px_1fr] md:items-center">
            {/* Donut chart */}
            <div
              data-result-chart
              className="flex flex-col items-center justify-center"
            >
              <div className="relative h-52 w-52">
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full -rotate-90"
                  aria-label={`${percentage}% quiz accuracy`}
                  role="img"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="9"
                  />

                  <circle
                    ref={chartRef}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#5B8CFF"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    ref={percentageRef}
                    className="text-[30px] font-semibold tracking-[-0.04em] text-white"
                  >
                    0%
                  </span>

                  <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
                    Accuracy
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#5B8CFF]" />
                  <span className="text-[11px] text-white/45">Correct</span>
                  <span className="text-[11px] font-medium text-white/70">
                    {correctAnswers}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-white/[0.12]" />
                  <span className="text-[11px] text-white/45">Incorrect</span>
                  <span className="text-[11px] font-medium text-white/70">
                    {incorrectAnswers}
                  </span>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="border-t border-white/[0.06] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
                Latest attempt
              </p>

              <div className="mt-3 flex items-end gap-2">
                <span className="text-[42px] font-semibold leading-none tracking-[-0.045em] text-white">
                  {score}
                </span>

                <span className="pb-1 text-[14px] text-white/25">
                  / {totalQuestions}
                </span>
              </div>

              <p className="mt-3 max-w-[420px] text-[13px] leading-6 text-white/40">
                You answered {correctAnswers} of {totalQuestions} questions
                correctly.
              </p>

              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[#5B8CFF] transition-all duration-700"
                  style={{
                    width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[10px] text-white/25">
                {percentage}% overall accuracy
              </p>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <div
            data-result-stat
            className="rounded-xl border border-[#252525] bg-[#111111] p-5"
          >
            <div className="flex items-center gap-2 text-white/30">
              <Trophy size={14} strokeWidth={1.7} />
              <span className="text-[10px] font-medium uppercase tracking-[0.16em]">
                Best
              </span>
            </div>

            <p className="mt-4 text-[24px] font-semibold tracking-[-0.03em] text-white">
              {bestPercentage}%
            </p>

            <p className="mt-1 text-[11px] text-white/25">Highest accuracy</p>
          </div>

          <div
            data-result-stat
            className="rounded-xl border border-[#252525] bg-[#111111] p-5"
          >
            <div className="flex items-center gap-2 text-white/30">
              <BarChart3 size={14} strokeWidth={1.7} />
              <span className="text-[10px] font-medium uppercase tracking-[0.16em]">
                Average
              </span>
            </div>

            <p className="mt-4 text-[24px] font-semibold tracking-[-0.03em] text-white">
              {averagePercentage}%
            </p>

            <p className="mt-1 text-[11px] text-white/25">
              Across all attempts
            </p>
          </div>

          <div
            data-result-stat
            className="rounded-xl border border-[#252525] bg-[#111111] p-5"
          >
            <div className="flex items-center gap-2 text-white/30">
              <CheckCircle2 size={14} strokeWidth={1.7} />
              <span className="text-[10px] font-medium uppercase tracking-[0.16em]">
                Attempts
              </span>
            </div>

            <p className="mt-4 text-[24px] font-semibold tracking-[-0.03em] text-white">
              {totalAttempts}
            </p>

            <p className="mt-1 text-[11px] text-white/25">Completed attempts</p>
          </div>
        </section>

        {/* Attempt history */}
        {history.length > 0 && (
          <section
            data-result-panel
            className="mt-5 rounded-xl border border-[#252525] bg-[#111111]"
          >
            <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-2">
                <BarChart3
                  size={15}
                  strokeWidth={1.7}
                  className="text-white/35"
                />

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#5B8CFF]">
                    Performance
                  </p>

                  <h2 className="mt-1 text-[15px] font-medium text-white">
                    Attempt history
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-5 py-6 sm:px-6">
              <div className="flex h-[180px] items-end gap-3 overflow-x-auto">
                {history.map((attempt) => {
                  const attemptPercentage = Number(attempt.scorePercentage);

                  const height = Math.max(8, Math.min(attemptPercentage, 100));

                  return (
                    <div
                      key={attempt.attemptPublicId}
                      className="group flex min-w-[42px] flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div className="relative flex h-[140px] w-full items-end justify-center">
                        <div
                          className="w-full max-w-[32px] rounded-t-[5px] bg-[#5B8CFF]/70 transition-all duration-300 group-hover:bg-[#5B8CFF]"
                          style={{
                            height: `${height}%`,
                          }}
                          title={`${attemptPercentage}%`}
                        />
                      </div>

                      <span className="text-[9px] text-white/25">
                        #{attempt.attemptNumber}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Actions */}
        <div
          data-result-actions
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end"
        >
          <button
            type="button"
            onClick={handleDone}
            className="flex h-10 items-center justify-center rounded-[8px] border border-white/[0.08] bg-[#111111] px-5 text-[12px] font-medium text-white/55 transition-colors hover:border-white/[0.15] hover:text-white"
          >
            Back to quizzes
          </button>

          <button
            type="button"
            onClick={handleRetry}
            disabled={startingAttempt}
            className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-white px-5 text-[12px] font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {startingAttempt ? (
              "Starting..."
            ) : (
              <>
                <RotateCcw size={14} strokeWidth={1.7} />
                Retry quiz
              </>
            )}
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-center">
          <CircleAlert size={13} strokeWidth={1.6} className="text-white/20" />

          <p className="text-[10px] text-white/20">
            Your result is saved automatically with this quiz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
