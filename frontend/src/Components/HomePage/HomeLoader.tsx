import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface HomeLoaderProps {
  progress: number;
  isComplete: boolean;
  onComplete: () => void;
}

const HomeLoader = ({ progress, isComplete, onComplete }: HomeLoaderProps) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  /*
   * Initial animation
   */
  useLayoutEffect(() => {
    const loader = loaderRef.current;

    if (!loader) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(wordmarkRef.current, {
        opacity: 0,
        y: 35,
        scale: 0.97,
      });

      gsap.set([statusRef.current, percentageRef.current], {
        opacity: 0,
        y: 10,
      });

      gsap.set(progressRef.current, {
        scaleX: 0,
      });

      gsap
        .timeline()
        .to(wordmarkRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
        })
        .to(
          [statusRef.current, percentageRef.current],
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power3.out",
          },
          "-=0.4",
        );
    }, loader);

    return () => {
      ctx.revert();
    };
  }, []);

  /*
   * Progress animation
   */
  useLayoutEffect(() => {
    const progressBar = progressRef.current;
    const percentage = percentageRef.current;

    if (!progressBar || !percentage) {
      return;
    }

    gsap.to(progressBar, {
      scaleX: progress / 100,
      duration: 0.35,
      ease: "power2.out",
    });

    gsap.to(percentage, {
      innerText: Math.round(progress),
      duration: 0.25,
      snap: {
        innerText: 1,
      },
      ease: "power2.out",
    });
  }, [progress]);

  /*
   * Exit animation
   */
  useLayoutEffect(() => {
    if (!isComplete) {
      return;
    }

    const loader = loaderRef.current;

    if (!loader) {
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
          ease: "power2.out",
        })
        .to([statusRef.current, percentageRef.current], {
          opacity: 0,
          y: -8,
          duration: 0.25,
          ease: "power2.in",
        })
        .to(
          wordmarkRef.current,
          {
            opacity: 0,
            y: -30,
            scale: 0.98,
            duration: 0.45,
            ease: "power3.in",
          },
          "-=0.1",
        )
        .to(
          loader,
          {
            yPercent: -100,
            duration: 0.9,
            ease: "power4.inOut",
          },
          "-=0.1",
        );
    }, loader);

    return () => {
      ctx.revert();
    };
  }, [isComplete, onComplete]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] text-[#F5F5F5]"
    >
      {/* Ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5B8CFF]/[0.05] blur-[140px]"
      />

      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative w-full px-6">
        <div className="mx-auto max-w-[1100px]">
          <div className="overflow-hidden">
            <h1
              ref={wordmarkRef}
              className="text-center text-[17vw] font-semibold leading-[0.78] tracking-[-0.085em] text-white sm:text-[14vw] lg:text-[11vw]"
            >
              NoteGenius
            </h1>
          </div>

          <div className="mx-auto mt-10 max-w-[900px]">
            <div className="flex items-center justify-between">
              <span
                ref={statusRef}
                className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35 sm:text-xs"
              >
                Preparing your workspace
              </span>

              <span
                ref={percentageRef}
                className="text-xs tabular-nums text-white/45"
              >
                0
              </span>
            </div>

            <div className="mt-3 h-px w-full overflow-hidden bg-white/10">
              <div
                ref={progressRef}
                className="h-full w-full origin-left bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLoader;
