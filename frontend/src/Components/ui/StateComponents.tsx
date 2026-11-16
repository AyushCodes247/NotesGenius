import { useLayoutEffect, useRef } from "react";
import { AlertCircle, Check, LoaderCircle, RefreshCw, X } from "lucide-react";
import gsap from "gsap";

type LoadingStateProps = {
  label?: string;
};

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

type SuccessToastProps = {
  visible: boolean;
  message: string;
  onClose?: () => void;
};

type TaskListSkeletonProps = {
  count?: number;
};

type SavingIndicatorProps = {
  label?: string;
};

/* -------------------------------------------------------------------------- */
/* Shared surfaces                                                            */
/* -------------------------------------------------------------------------- */

const surfaceClass = "rounded-xl border border-white/[0.09] bg-white/[0.035]";

/* -------------------------------------------------------------------------- */
/* Loading State                                                              */
/* -------------------------------------------------------------------------- */

export function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  const containerRef = useRef<HTMLElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const spinner = spinnerRef.current;
    const labelElement = labelRef.current;

    if (!container || !spinner || !labelElement) {
      return;
    }

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.fromTo(
        container,
        {
          opacity: 0,
          y: 8,
        },
        {
          opacity: 1,
          y: 0,
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: "power3.out",
        },
      );

      if (!prefersReducedMotion) {
        gsap.to(spinner, {
          rotation: 360,
          duration: 1,
          repeat: -1,
          ease: "none",
        });
      }

      gsap.fromTo(
        labelElement,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: prefersReducedMotion ? 0 : 0.45,
          delay: prefersReducedMotion ? 0 : 0.1,
          ease: "power2.out",
        },
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label={label}
      aria-busy="true"
      className="flex min-h-40 flex-col items-center justify-center gap-3 text-center"
    >
      <div
        ref={spinnerRef}
        className="flex items-center justify-center text-[#5B8CFF]"
      >
        <LoaderCircle aria-hidden="true" size={21} strokeWidth={1.6} />
      </div>

      <p
        ref={labelRef}
        className="text-sm font-medium tracking-[-0.01em] text-white/45"
      >
        {label}
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Task List Skeleton                                                         */
/* -------------------------------------------------------------------------- */

export function TaskListSkeleton({ count = 4 }: TaskListSkeletonProps) {
  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const items = container.querySelectorAll<HTMLElement>(
        "[data-skeleton-item]",
      );

      gsap.fromTo(
        items,
        {
          opacity: 0,
          y: 10,
        },
        {
          opacity: 1,
          y: 0,
          duration: prefersReducedMotion ? 0 : 0.5,
          stagger: prefersReducedMotion ? 0 : 0.06,
          ease: "power3.out",
        },
      );

      if (!prefersReducedMotion) {
        const shimmerElements = container.querySelectorAll<HTMLElement>(
          "[data-skeleton-shimmer]",
        );

        gsap.to(shimmerElements, {
          opacity: 0.45,
          duration: 1.1,
          repeat: -1,
          yoyo: true,
          stagger: 0.08,
          ease: "sine.inOut",
        });
      }
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label="Loading"
      aria-busy="true"
      className="space-y-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <article
          key={index}
          data-skeleton-item
          className={`${surfaceClass} flex items-center gap-4 p-4 sm:p-5`}
        >
          <div
            data-skeleton-shimmer
            aria-hidden="true"
            className="size-5 shrink-0 rounded-md bg-white/[0.08]"
          />

          <div className="min-w-0 flex-1 space-y-2.5">
            <div
              data-skeleton-shimmer
              className="h-3.5 w-2/3 max-w-56 rounded bg-white/[0.08]"
            />

            <div
              data-skeleton-shimmer
              className="h-3 w-1/2 max-w-40 rounded bg-white/[0.045]"
            />
          </div>

          <div
            data-skeleton-shimmer
            aria-hidden="true"
            className="hidden h-6 w-20 rounded-full bg-white/[0.045] sm:block"
          />
        </article>
      ))}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Error State                                                                */
/* -------------------------------------------------------------------------- */

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
}: ErrorStateProps) {
  const containerRef = useRef<HTMLElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const icon = iconRef.current;
    const content = contentRef.current;
    const button = buttonRef.current;

    if (!container || !icon || !content) {
      return;
    }

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const duration = prefersReducedMotion ? 0 : 0.55;

      gsap.fromTo(
        container,
        {
          opacity: 0,
          y: 12,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        icon,
        {
          opacity: 0,
          scale: 0.85,
        },
        {
          opacity: 1,
          scale: 1,
          duration: prefersReducedMotion ? 0 : 0.5,
          delay: prefersReducedMotion ? 0 : 0.08,
          ease: "back.out(1.5)",
        },
      );

      gsap.fromTo(
        content.children,
        {
          opacity: 0,
          y: 6,
        },
        {
          opacity: 1,
          y: 0,
          duration: prefersReducedMotion ? 0 : 0.45,
          stagger: prefersReducedMotion ? 0 : 0.06,
          delay: prefersReducedMotion ? 0 : 0.12,
          ease: "power3.out",
        },
      );

      if (button) {
        gsap.fromTo(
          button,
          {
            opacity: 0,
            y: 6,
          },
          {
            opacity: 1,
            y: 0,
            duration: prefersReducedMotion ? 0 : 0.45,
            delay: prefersReducedMotion ? 0 : 0.25,
            ease: "power3.out",
          },
        );
      }
    }, container);

    return () => ctx.revert();
  }, []);

  const handleRetryEnter = () => {
    if (!buttonRef.current) return;

    gsap.to(buttonRef.current, {
      y: -2,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const handleRetryLeave = () => {
    if (!buttonRef.current) return;

    gsap.to(buttonRef.current, {
      y: 0,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  return (
    <section
      ref={containerRef}
      role="alert"
      className={`${surfaceClass} relative overflow-hidden px-5 py-9 text-center sm:px-8 sm:py-11`}
    >
      {/* Subtle ambient accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-400/[0.045] blur-3xl"
      />

      <div
        ref={iconRef}
        className="relative mx-auto mb-5 flex size-10 items-center justify-center rounded-lg border border-red-400/[0.16] bg-red-400/[0.06]"
      >
        <AlertCircle
          aria-hidden="true"
          size={19}
          strokeWidth={1.7}
          className="text-red-300/80"
        />
      </div>

      <div ref={contentRef} className="relative">
        <h2 className="text-base font-semibold tracking-[-0.02em] text-white/90">
          {title}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          ref={buttonRef}
          type="button"
          onClick={onRetry}
          onMouseEnter={handleRetryEnter}
          onMouseLeave={handleRetryLeave}
          className="relative mt-6 inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.045] px-3.5 text-sm font-medium text-white/75 transition-colors duration-200 hover:border-white/[0.2] hover:bg-white/[0.075] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8CFF]/60"
        >
          <RefreshCw aria-hidden="true" size={14} strokeWidth={1.8} />

          {retryLabel}
        </button>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Success Toast                                                              */
/* -------------------------------------------------------------------------- */

export function SuccessToast({ visible, message, onClose }: SuccessToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const toast = toastRef.current;
    const icon = iconRef.current;

    if (!toast || !visible) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        toast,
        {
          opacity: 0,
          y: 16,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: "power3.out",
        },
      );

      if (!prefersReducedMotion) {
        gsap.fromTo(
          icon,
          {
            scale: 0.7,
            opacity: 0,
          },
          {
            scale: 1,
            opacity: 1,
            duration: 0.45,
            delay: 0.08,
            ease: "back.out(1.7)",
          },
        );
      }
    });

    return () => ctx.revert();
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={toastRef}
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0D0D0D]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-md sm:bottom-6 sm:right-6"
    >
      {/* Blue ambient accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 -top-10 size-24 rounded-full bg-[#5B8CFF]/[0.08] blur-2xl"
      />

      <div
        ref={iconRef}
        className="relative flex size-7 shrink-0 items-center justify-center rounded-md border border-[#5B8CFF]/20 bg-[#5B8CFF]/[0.08]"
      >
        <Check
          aria-hidden="true"
          size={15}
          strokeWidth={2}
          className="text-[#7AA3FF]"
        />
      </div>

      <p className="relative min-w-0 flex-1 pt-0.5 text-sm leading-5 text-white/75">
        {message}
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="relative shrink-0 rounded-md p-1 text-white/30 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8CFF]/60"
        >
          <X aria-hidden="true" size={15} strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Saving Indicator                                                           */
/* -------------------------------------------------------------------------- */

export function SavingIndicator({ label = "Saving..." }: SavingIndicatorProps) {
  const spinnerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const spinner = spinnerRef.current;

    if (!spinner) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const tween = gsap.to(spinner, {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: "none",
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <span
      role="status"
      className="inline-flex items-center gap-2 text-xs font-medium text-white/40"
    >
      <span ref={spinnerRef} className="inline-flex text-[#5B8CFF]">
        <LoaderCircle aria-hidden="true" size={14} strokeWidth={1.7} />
      </span>

      {label}
    </span>
  );
}
