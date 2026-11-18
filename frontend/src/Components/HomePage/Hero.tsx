import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";

import HeroScene from "./Three/HeroScene";

const GITHUB_REPO_URL = "https://github.com/AyushCodes247/NotesGenius";

const Hero = () => {
  const [showScene, setShowScene] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  const primaryButtonRef = useRef<HTMLAnchorElement>(null);
  const secondaryButtonRef = useRef<HTMLAnchorElement>(null);

  const primaryArrowRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowScene(true);
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const visual = visualRef.current;

    if (!hero || !visual) {
      return;
    }

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(
          [
            navRef.current,
            eyebrowRef.current,
            titleRef.current,
            descriptionRef.current,
            actionsRef.current,
            trustRef.current,
            visualRef.current,
          ],
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
          },
        );

        return;
      }

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .from(navRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.7,
        })
        .from(
          visualRef.current,
          {
            opacity: 0,
            scale: 1.04,
            duration: 1.4,
            ease: "power2.out",
          },
          0,
        )
        .from(
          eyebrowRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.45",
        )
        .from(
          titleRef.current ? Array.from(titleRef.current.children) : [],
          {
            y: 70,
            duration: 0.9,
            stagger: 0.1,
            ease: "power4.out",
          },
          "-=0.25",
        )
        .from(
          descriptionRef.current,
          {
            y: 25,
            duration: 0.65,
          },
          "-=0.45",
        )
        .from(
          actionsRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.35",
        )
        .from(
          trustRef.current?.children
            ? Array.from(trustRef.current.children)
            : [],
          {
            y: 15,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
          },
          "-=0.3",
        );

      const moveX = gsap.quickTo(visual, "x", {
        duration: 1.2,
        ease: "power3.out",
      });

      const moveY = gsap.quickTo(visual, "y", {
        duration: 1.2,
        ease: "power3.out",
      });

      const rotate = gsap.quickTo(visual, "rotation", {
        duration: 1.4,
        ease: "power3.out",
      });

      const handleMouseMove = (event: MouseEvent) => {
        const normalizedX = event.clientX / window.innerWidth - 0.5;
        const normalizedY = event.clientY / window.innerHeight - 0.5;

        moveX(normalizedX * 12);
        moveY(normalizedY * 8);
        rotate(normalizedX * 1.2);
      };

      window.addEventListener("mousemove", handleMouseMove);

      const button = primaryButtonRef.current;
      const arrow = primaryArrowRef.current;

      const handlePrimaryEnter = () => {
        if (!button || !arrow) {
          return;
        }

        gsap.to(button, {
          y: -3,
          duration: 0.25,
          ease: "power2.out",
        });

        gsap.to(arrow, {
          x: 4,
          duration: 0.25,
          ease: "power2.out",
        });
      };

      const handlePrimaryLeave = () => {
        if (!button || !arrow) {
          return;
        }

        gsap.to(button, {
          y: 0,
          duration: 0.25,
          ease: "power2.out",
        });

        gsap.to(arrow, {
          x: 0,
          duration: 0.25,
          ease: "power2.out",
        });
      };

      if (button) {
        button.addEventListener("mouseenter", handlePrimaryEnter);
        button.addEventListener("mouseleave", handlePrimaryLeave);
      }

      const secondaryButton = secondaryButtonRef.current;

      const handleSecondaryEnter = () => {
        if (!secondaryButton) {
          return;
        }

        gsap.to(secondaryButton, {
          y: -3,
          borderColor: "rgba(255,255,255,0.3)",
          duration: 0.25,
          ease: "power2.out",
        });
      };

      const handleSecondaryLeave = () => {
        if (!secondaryButton) {
          return;
        }

        gsap.to(secondaryButton, {
          y: 0,
          borderColor: "rgba(255,255,255,0.15)",
          duration: 0.25,
          ease: "power2.out",
        });
      };

      if (secondaryButton) {
        secondaryButton.addEventListener("mouseenter", handleSecondaryEnter);
        secondaryButton.addEventListener("mouseleave", handleSecondaryLeave);
      }

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);

        if (button) {
          button.removeEventListener("mouseenter", handlePrimaryEnter);
          button.removeEventListener("mouseleave", handlePrimaryLeave);
        }

        if (secondaryButton) {
          secondaryButton.removeEventListener(
            "mouseenter",
            handleSecondaryEnter,
          );

          secondaryButton.removeEventListener(
            "mouseleave",
            handleSecondaryLeave,
          );
        }
      };
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden border-b border-white/10"
    >
      <div ref={visualRef} className="absolute inset-0 will-change-transform">
        {showScene && <HeroScene />}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-black/10" />

      <div
        ref={navRef}
        className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] items-end px-6 pb-20 pt-32 lg:px-8 lg:pb-24"
      >
        <div className="grid w-full gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div className="max-w-3xl">
            <p
              ref={eyebrowRef}
              className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-white/50"
            >
              AI-Powered Study Workspace
            </p>

            <h1
              ref={titleRef}
              className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl"
            >
              <span className="block">Turn Your Study</span>
              <span className="block">Material Into</span>
              <span className="block">Knowledge.</span>
            </h1>

            <p
              ref={descriptionRef}
              className="mt-7 max-w-xl text-sm leading-6 text-white/55 sm:text-base"
            >
              Upload your notes and documents. NoteGenius helps you understand,
              organize, discuss, and practice what you learn.
            </p>

            <div ref={actionsRef} className="mt-8 flex flex-wrap gap-3">
              <Link
                ref={primaryButtonRef}
                to="/register"
                className="group flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-black will-change-transform"
              >
                Get Started
                <ArrowRight ref={primaryArrowRef} size={16} />
              </Link>

              <a
                ref={secondaryButtonRef}
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium backdrop-blur-md will-change-transform"
              >
                <FaGithub size={16} />
                Explore on GitHub
              </a>
            </div>
          </div>

          <div className="flex justify-start lg:justify-end">
            <div
              ref={trustRef}
              className="flex max-w-xs flex-wrap gap-x-4 gap-y-2 text-xs text-white/45"
            >
              <span>Open Source</span>
              <span>AI-Powered</span>
              <span>Built for Learners</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
