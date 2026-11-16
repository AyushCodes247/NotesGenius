import { forwardRef, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Upload",
    subtitle: "Bring Your Material",
    description:
      "Upload your PDFs, documents, and study material into NoteGenius.",
  },
  {
    number: "02",
    title: "Understand",
    subtitle: "Make Sense of It",
    description:
      "NoteGenius analyzes your material and helps you understand complex topics.",
  },
  {
    number: "03",
    title: "Create",
    subtitle: "Build Your Notes",
    description:
      "Turn your material into structured notes, summaries, key points, and explanations.",
  },
  {
    number: "04",
    title: "Discuss",
    subtitle: "Ask. Explore. Understand.",
    description:
      "Have a contextual conversation with your material and ask questions about what you're learning.",
  },
  {
    number: "05",
    title: "Practice",
    subtitle: "Test What You Know",
    description:
      "Generate quizzes from your material and discover what you know—and what you still need to revise.",
  },
];

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const progress = progressRef.current;

    if (!section || !progress) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      /*
       * Initial progress state
       */
      gsap.set(progress, {
        scaleY: 0,
        transformOrigin: "top center",
      });

      /*
       * Initial card state
       */
      gsap.set(cardRefs.current, {
        opacity: prefersReducedMotion ? 1 : 0.55,
        y: prefersReducedMotion ? 0 : 30,
      });

      /*
       * Initial timeline node state
       */
      gsap.set(stepRefs.current, {
        opacity: prefersReducedMotion ? 1 : 0.35,
        scale: prefersReducedMotion ? 1 : 0.85,
      });

      /*
       * Reduced motion
       */
      if (prefersReducedMotion) {
        gsap.set(progress, {
          scaleY: 1,
        });

        return;
      }

      /*
       * Main timeline progress
       */
      gsap.to(progress, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 65%",
          end: "bottom 75%",
          scrub: 0.8,
        },
      });

      /*
       * Individual step animations
       */
      stepRefs.current.forEach((step, index) => {
        const card = cardRefs.current[index];

        if (!step || !card) return;

        ScrollTrigger.create({
          trigger: step,
          start: "top 65%",
          end: "bottom 40%",

          onEnter: () => {
            activateStep(step, card);
          },

          onEnterBack: () => {
            activateStep(step, card);
          },

          onLeave: () => {
            deactivateStep(step, card);
          },

          onLeaveBack: () => {
            deactivateStep(step, card);
          },
        });
      });

      function activateStep(step: HTMLDivElement, card: HTMLElement) {
        gsap.to(step, {
          opacity: 1,
          scale: 1,
          duration: 0.45,
          ease: "power3.out",
        });

        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.12), 0 0 45px rgba(91,140,255,0.12)",
          borderColor: "rgba(255,255,255,0.22)",
          backgroundColor: "rgba(255,255,255,0.065)",
        });
      }

      function deactivateStep(step: HTMLDivElement, card: HTMLElement) {
        gsap.to(step, {
          opacity: 0.45,
          scale: 0.88,
          duration: 0.35,
          ease: "power2.out",
        });

        gsap.to(card, {
          opacity: 0.58,
          y: 15,
          duration: 0.4,
          ease: "power2.out",
          boxShadow: "0 0 0 0 rgba(0,0,0,0)",
          borderColor: "rgba(255,255,255,0.14)",
          backgroundColor: "rgba(255,255,255,0.05)",
        });
      }
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative scroll-mt-20 overflow-hidden border-b border-white/10"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-8 lg:py-32">
        {/* Section Header */}
        <div className="mx-auto mb-24 max-w-2xl text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-white/40">
            How It Works
          </p>

          <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            From information
            <br />
            to understanding.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
            NoteGenius turns your study material into an intelligent learning
            workflow—from your first upload to active practice.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Base */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-white/10 lg:block"
          />

          {/* Timeline Progress */}
          <div
            ref={progressRef}
            aria-hidden="true"
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-white lg:block"
          />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => {
              const isRight = index % 2 === 0;

              return (
                <div
                  key={step.number}
                  ref={(element) => {
                    stepRefs.current[index] = element;
                  }}
                  className="relative lg:grid lg:min-h-[500px] lg:grid-cols-2 lg:items-center"
                >
                  {/* Step Card */}
                  <div
                    className={`lg:row-start-1 ${
                      isRight
                        ? "lg:col-start-2 lg:pl-20"
                        : "lg:col-start-1 lg:pr-20"
                    }`}
                  >
                    <StepCard
                      ref={(element) => {
                        cardRefs.current[index] = element;
                      }}
                      {...step}
                      align={isRight ? "left" : "right"}
                    />
                  </div>

                  {/* Timeline Node */}
                  <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-[#080808]">
                      <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

type StepCardProps = {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  align?: "left" | "right";
};

const StepCard = forwardRef<HTMLElement, StepCardProps>(
  ({ number, title, subtitle, description, align = "left" }, ref) => {
    return (
      <article
        ref={ref}
        className={`relative min-h-[300px] overflow-hidden rounded-xl border border-white/[0.14] bg-white/[0.05] p-8 transition-colors lg:min-h-[340px] lg:p-9 ${
          align === "right" ? "text-right" : "text-left"
        }`}
      >
        {/* Step Number */}
        <span
          className={`absolute top-7 text-xs font-medium tracking-[0.16em] text-white/40 ${
            align === "right" ? "left-8" : "right-8"
          }`}
        >
          {number}
        </span>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-center">
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white lg:text-3xl">
            {title}
          </h3>

          <p className="mt-3 text-sm font-medium text-white/70 lg:text-base">
            {subtitle}
          </p>

          <p
            className={`mt-5 max-w-md text-sm leading-6 text-white/50 lg:text-[15px] lg:leading-7 ${
              align === "right" ? "ml-auto" : ""
            }`}
          >
            {description}
          </p>
        </div>

        {/* Large Background Number */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-[-12px] text-[150px] font-semibold leading-none tracking-[-0.08em] text-white/[0.035] lg:text-[180px] ${
            align === "right" ? "left-5" : "right-5"
          }`}
        >
          {number}
        </span>
      </article>
    );
  },
);

StepCard.displayName = "StepCard";

export default HowItWorks;
