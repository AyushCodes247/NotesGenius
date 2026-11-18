import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface HomeLoaderProps {
  progress: number;
  isComplete: boolean;
  onComplete: () => void;
}

const HomeLoader = ({ progress, isComplete, onComplete }: HomeLoaderProps) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const monogramRef = useRef<HTMLDivElement>(null);
  const monogramLineRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressGlowRef = useRef<HTMLDivElement>(null);
  const cornerRefs = useRef<(HTMLSpanElement | null)[]>([]);

  /*
   * Initial reveal
   */
  useLayoutEffect(() => {
    const loader = loaderRef.current;

    if (!loader) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      gsap.set(frameRef.current, {
        opacity: 0,
      });

      gsap.set(monogramRef.current, {
        opacity: 0,
        y: reduceMotion ? 0 : 20,
        scale: reduceMotion ? 1 : 0.94,
      });

      gsap.set(monogramLineRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set(wordmarkRef.current, {
        opacity: 0,
        y: reduceMotion ? 0 : 8,
      });

      gsap.set(metaRef.current, {
        opacity: 0,
        y: reduceMotion ? 0 : 6,
      });

      gsap.set(progressRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set(progressGlowRef.current, {
        opacity: 0,
      });

      gsap.set(cornerRefs.current, {
        opacity: 0,
      });

      if (reduceMotion) {
        gsap.set(
          [
            frameRef.current,
            monogramRef.current,
            wordmarkRef.current,
            metaRef.current,
          ],
          {
            opacity: 1,
            clearProps: "transform",
          },
        );

        gsap.set(monogramLineRef.current, {
          scaleX: 1,
        });

        gsap.set(cornerRefs.current, {
          opacity: 1,
        });

        return;
      }

      const timeline = gsap.timeline();

      timeline
        .to(frameRef.current, {
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
        })
        .to(
          cornerRefs.current,
          {
            opacity: 1,
            duration: 0.25,
            stagger: 0.05,
            ease: "power2.out",
          },
          "-=0.15",
        )
        .to(
          monogramRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.1",
        )
        .to(
          monogramLineRef.current,
          {
            scaleX: 1,
            duration: 0.55,
            ease: "power3.inOut",
          },
          "-=0.35",
        )
        .to(
          wordmarkRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power3.out",
          },
          "-=0.15",
        )
        .to(
          metaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
          },
          "-=0.15",
        );
    }, loader);

    return () => {
      ctx.revert();
    };
  }, []);

  /*
   * Progress
   */
  useLayoutEffect(() => {
    const progressBar = progressRef.current;
    const progressGlow = progressGlowRef.current;
    const percentage = percentageRef.current;

    if (!progressBar || !percentage) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    gsap.to(progressBar, {
      scaleX: progress / 100,
      duration: reduceMotion ? 0 : 0.45,
      ease: "power3.out",
      overwrite: true,
    });

    if (progressGlow) {
      gsap.to(progressGlow, {
        opacity: progress > 0 ? 0.8 : 0,
        xPercent: progress - 100,
        duration: reduceMotion ? 0 : 0.45,
        ease: "power3.out",
        overwrite: true,
      });
    }

    gsap.to(percentage, {
      innerText: Math.round(progress),
      duration: reduceMotion ? 0 : 0.25,
      snap: {
        innerText: 1,
      },
      ease: "power2.out",
      overwrite: true,
    });
  }, [progress]);

  /*
   * Completion
   */
  useLayoutEffect(() => {
    if (!isComplete) return;

    const loader = loaderRef.current;

    if (!loader) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete,
      });

      timeline
        .to(progressRef.current, {
          scaleX: 1,
          duration: 0.25,
          ease: "power3.out",
        })
        .to(
          [statusRef.current, percentageRef.current],
          {
            opacity: 0,
            duration: 0.18,
            ease: "power2.in",
          },
          "-=0.05",
        )
        .to(
          monogramLineRef.current,
          {
            scaleX: 0,
            transformOrigin: "right center",
            duration: 0.3,
            ease: "power3.inOut",
          },
          "-=0.02",
        )
        .to(
          [wordmarkRef.current, monogramRef.current],
          {
            opacity: 0,
            y: -12,
            duration: 0.35,
            ease: "power3.in",
          },
          "-=0.15",
        )
        .to(
          frameRef.current,
          {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
          },
          "-=0.15",
        )
        .to(loader, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.85,
          ease: "power4.inOut",
        });
    }, loader);

    return () => {
      ctx.revert();
    };
  }, [isComplete, onComplete]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] min-h-screen overflow-hidden bg-[#080808] text-[#F5F5F5]"
    >
      {/* Very subtle atmospheric depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5B8CFF]/[0.025] blur-[150px]"
      />

      {/* Main frame */}
      <div
        ref={frameRef}
        className="absolute inset-6 border border-white/[0.055] sm:inset-8 lg:inset-10"
      >
        {/* Corner markers */}
        <span
          ref={(element) => {
            cornerRefs.current[0] = element;
          }}
          className="absolute -left-px -top-px h-3 w-3 border-l border-t border-[#5B8CFF]/50"
        />

        <span
          ref={(element) => {
            cornerRefs.current[1] = element;
          }}
          className="absolute -right-px -top-px h-3 w-3 border-r border-t border-[#5B8CFF]/50"
        />

        <span
          ref={(element) => {
            cornerRefs.current[2] = element;
          }}
          className="absolute -bottom-px -left-px h-3 w-3 border-b border-l border-[#5B8CFF]/50"
        />

        <span
          ref={(element) => {
            cornerRefs.current[3] = element;
          }}
          className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-[#5B8CFF]/50"
        />
      </div>

      {/* Top metadata */}
      <div className="absolute left-8 top-8 flex items-center gap-3 sm:left-10 sm:top-10 lg:left-12 lg:top-12">
        <span className="size-1.5 rounded-full bg-[#5B8CFF]" />

        <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/30">
          NoteGenius
        </span>
      </div>

      <span className="absolute right-8 top-8 text-[9px] tabular-nums tracking-[0.16em] text-white/20 sm:right-10 sm:top-10 lg:right-12 lg:top-12">
        NG / 01
      </span>

      {/* Central identity */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          {/* Monogram */}
          <div
            ref={monogramRef}
            className="relative flex size-[112px] items-center justify-center sm:size-[128px]"
          >
            {/* Fine outer circle */}
            <div className="absolute inset-0 rounded-full border border-white/[0.065]" />

            {/* Inner vertical guide */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.045]"
            />

            {/* Inner horizontal guide */}
            <div
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/[0.045]"
            />

            {/* N */}
            <span className="relative z-10 text-[72px] font-semibold leading-none tracking-[-0.12em] text-[#F5F5F5] sm:text-[82px]">
              N
            </span>

            {/* Accent point */}
            <span className="absolute right-[10px] top-[10px] size-1.5 rounded-full bg-[#5B8CFF]" />
          </div>

          {/* Drawn line */}
          <div className="mt-7 h-px w-[72px] overflow-hidden bg-white/[0.08]">
            <div ref={monogramLineRef} className="h-full w-full bg-[#5B8CFF]" />
          </div>

          {/* Wordmark */}
          <div
            ref={wordmarkRef}
            className="mt-5 text-center text-[13px] font-medium tracking-[0.08em] text-white/65"
          >
            NOTEGENIUS
          </div>
        </div>
      </div>

      {/* Bottom status */}
      <div
        ref={metaRef}
        className="absolute bottom-8 left-8 right-8 sm:bottom-10 sm:left-10 sm:right-10 lg:bottom-12 lg:left-12 lg:right-12"
      >
        <div className="flex items-end justify-between gap-6">
          <div>
            <span
              ref={statusRef}
              className="block text-[9px] font-medium uppercase tracking-[0.18em] text-white/30"
            >
              Preparing your workspace
            </span>

            <span className="mt-1.5 block text-[9px] tracking-[0.04em] text-white/15">
              Initializing experience
            </span>
          </div>

          <span
            ref={percentageRef}
            className="text-[11px] font-medium tabular-nums tracking-[0.08em] text-white/40"
          >
            0
          </span>
        </div>

        {/* Architectural progress line */}
        <div className="relative mt-4 h-px w-full overflow-visible bg-white/[0.07]">
          <div
            ref={progressRef}
            className="absolute inset-y-0 left-0 w-full origin-left bg-[#5B8CFF]"
          />

          {/* Moving light at progress edge */}
          <div
            ref={progressGlowRef}
            aria-hidden="true"
            className="absolute left-0 top-1/2 size-1 -translate-y-1/2 rounded-full bg-[#7AA3FF] shadow-[0_0_12px_rgba(91,140,255,0.7)]"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeLoader;
