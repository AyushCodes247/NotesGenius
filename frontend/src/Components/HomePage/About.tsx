import { useLayoutEffect, useRef } from "react";
import {
  ArrowDownRight,
  Brain,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const stackRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const discussionRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const knowledgeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const ctx = gsap.context(() => {
      const elements = [
        statementRef.current,
        descriptionRef.current,
        documentRef.current,
        discussionRef.current,
        notesRef.current,
        knowledgeRef.current,
      ].filter(Boolean);

      /*
       * Keep About content hidden until the section
       * actually enters the viewport.
       */
      gsap.set(elements, {
        opacity: 0,
        y: 30,
      });

      /*
       * Entrance animation.
       *
       * Nothing runs when the page initially loads.
       * The timeline is created by ScrollTrigger only
       * when the About section reaches the viewport.
       */
      const intro = gsap.timeline({
        paused: true,
        onComplete: () => {
          /*
           * Start the subtle floating animation only
           * after the About section has entered and
           * finished its entrance animation.
           */
          gsap.to(stackRef.current, {
            y: -8,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        },
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
      });

      intro
        .to(statementRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        })
        .to(
          descriptionRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.5",
        )
        .to(
          documentRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.4",
        )
        .to(
          discussionRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.45",
        )
        .to(
          notesRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.45",
        )
        .to(
          knowledgeRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.45",
        );

      /*
       * Important:
       *
       * Do NOT start the floating animation here.
       * It is started inside intro.onComplete()
       * after ScrollTrigger activates the timeline.
       */
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden border-b border-white/10"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
          {/* Left */}
          <div className="lg:col-span-7">
            <div ref={statementRef}>
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-white/40">
                Why NoteGenius
              </p>

              <h2 className="max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl xl:text-7xl">
                Learning shouldn't mean
                <br />
                <span className="text-white/40">drowning in information.</span>
              </h2>
            </div>

            <div
              ref={descriptionRef}
              className="mt-10 max-w-2xl border-t border-white/10 pt-8"
            >
              <p className="text-base leading-7 text-white/50 lg:text-lg lg:leading-8">
                Your study material is scattered across PDFs, lecture notes,
                documents, and resources. NoteGenius brings it together and
                turns it into something you can actually learn from.
              </p>

              <div className="mt-8 flex items-center gap-3 text-sm text-white/60">
                <ArrowDownRight
                  size={18}
                  strokeWidth={1.5}
                  className="text-white/40"
                />

                <span>Less time organizing.</span>

                <span className="text-white/20">•</span>

                <span>More time learning.</span>
              </div>
            </div>
          </div>

          {/* Right — Knowledge Stack */}
          <div className="lg:col-span-5">
            <div
              ref={stackRef}
              className="relative mx-auto h-[430px] w-full max-w-[470px]"
            >
              {/* Ambient Glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5B8CFF]/10 blur-[100px]"
              />

              {/* Document */}
              <div
                ref={documentRef}
                className="absolute left-0 top-8 w-[82%] -rotate-3 rounded-xl border border-white/[0.12] bg-[#111111] p-5 shadow-2xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                      <FileText
                        size={17}
                        strokeWidth={1.6}
                        className="text-white/50"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-white/70">
                        Lecture Notes
                      </p>

                      <p className="mt-1 text-[10px] text-white/30">
                        Week 04 · 24 pages
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase tracking-wider text-white/25">
                    PDF
                  </span>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="h-1.5 w-[88%] rounded-full bg-white/[0.08]" />
                  <div className="h-1.5 w-[72%] rounded-full bg-white/[0.06]" />
                  <div className="h-1.5 w-[80%] rounded-full bg-white/[0.06]" />
                  <div className="h-1.5 w-[56%] rounded-full bg-white/[0.05]" />
                </div>
              </div>

              {/* Discussion */}
              <div
                ref={discussionRef}
                className="absolute right-0 top-[125px] z-10 w-[82%] rotate-2 rounded-xl border border-white/[0.14] bg-[#151515] p-5 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                    <MessageSquare
                      size={17}
                      strokeWidth={1.6}
                      className="text-white/55"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-white/70">
                      Document Discussion
                    </p>

                    <p className="mt-1 text-[10px] text-white/30">
                      Ask · Understand · Explore
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-white/[0.08] bg-white/[0.025] p-3">
                  <p className="text-[11px] leading-5 text-white/45">
                    Explain the key concepts from this section.
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div
                ref={notesRef}
                className="absolute bottom-12 left-[8%] z-20 w-[82%] rounded-xl border border-white/[0.16] bg-[#181818] p-5 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
                    <Sparkles
                      size={17}
                      strokeWidth={1.6}
                      className="text-white/65"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-white/75">
                      Structured Notes
                    </p>

                    <p className="mt-1 text-[10px] text-white/30">
                      Organized automatically
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-white/[0.07] bg-white/[0.025] p-3">
                    <div className="h-1.5 w-12 rounded-full bg-white/10" />
                    <div className="mt-2 h-1 w-full rounded-full bg-white/[0.05]" />
                    <div className="mt-1.5 h-1 w-3/4 rounded-full bg-white/[0.04]" />
                  </div>

                  <div className="rounded-md border border-white/[0.07] bg-white/[0.025] p-3">
                    <div className="h-1.5 w-10 rounded-full bg-white/10" />
                    <div className="mt-2 h-1 w-full rounded-full bg-white/[0.05]" />
                    <div className="mt-1.5 h-1 w-2/3 rounded-full bg-white/[0.04]" />
                  </div>
                </div>
              </div>

              {/* Knowledge */}
              <div
                ref={knowledgeRef}
                className="absolute bottom-0 right-0 z-30 flex items-center gap-3 rounded-full border border-white/[0.16] bg-[#0D0D0D] px-5 py-3 shadow-xl"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08]">
                  <Brain
                    size={14}
                    strokeWidth={1.6}
                    className="text-white/65"
                  />
                </div>

                <span className="text-xs font-medium text-white/70">
                  Knowledge, organized.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
