import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";

import HeroScene from "./Three/HeroScene";

const Hero = () => {
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

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const visual = visualRef.current;

    if (!hero || !visual) {
      return;
    }

    const ctx = gsap.context(() => {
      /*
       * Respect reduced-motion preferences.
       */
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

      /*
       * ------------------------------------------------
       * HERO ENTRANCE
       * ------------------------------------------------
       */

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        /*
         * Navbar
         */
        .from(navRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.7,
        })

        /*
         * Hero visual
         */
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

        /*
         * Eyebrow
         */
        .from(
          eyebrowRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.45",
        )

        /*
         * Headline lines
         */
        .from(
          titleRef.current?.children ?? [],
          {
            y: 70,
            opacity: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "power4.out",
          },
          "-=0.25",
        )

        /*
         * Description
         */
        .from(
          descriptionRef.current,
          {
            y: 25,
            opacity: 0,
            duration: 0.65,
          },
          "-=0.45",
        )

        /*
         * Buttons
         */
        .from(
          actionsRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.35",
        )

        /*
         * Trust labels
         */
        .from(
          trustRef.current?.children ?? [],
          {
            y: 15,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
          },
          "-=0.3",
        );

      /*
       * ------------------------------------------------
       * HERO VISUAL PARALLAX
       * ------------------------------------------------
       */

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

        /*
         * Very subtle movement.
         *
         * The WebGL shader already handles
         * the stronger X-axis interaction.
         */
        moveX(normalizedX * 12);
        moveY(normalizedY * 8);

        rotate(normalizedX * 1.2);
      };

      window.addEventListener("mousemove", handleMouseMove);

      /*
       * ------------------------------------------------
       * PRIMARY BUTTON
       * ------------------------------------------------
       */

      if (primaryButtonRef.current && primaryArrowRef.current) {
        const button = primaryButtonRef.current;

        const arrow = primaryArrowRef.current;

        const handleEnter = () => {
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

        const handleLeave = () => {
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

        button.addEventListener("mouseenter", handleEnter);

        button.addEventListener("mouseleave", handleLeave);

        /*
         * Cleanup.
         */
        return () => {
          window.removeEventListener("mousemove", handleMouseMove);

          button.removeEventListener("mouseenter", handleEnter);

          button.removeEventListener("mouseleave", handleLeave);
        };
      }

      /*
       * ------------------------------------------------
       * SECONDARY BUTTON
       * ------------------------------------------------
       */

      if (secondaryButtonRef.current) {
        const button = secondaryButtonRef.current;

        const handleEnter = () => {
          gsap.to(button, {
            y: -3,
            borderColor: "rgba(255,255,255,0.3)",
            duration: 0.25,
            ease: "power2.out",
          });
        };

        const handleLeave = () => {
          gsap.to(button, {
            y: 0,
            borderColor: "rgba(255,255,255,0.15)",
            duration: 0.25,
            ease: "power2.out",
          });
        };

        button.addEventListener("mouseenter", handleEnter);

        button.addEventListener("mouseleave", handleLeave);

        /*
         * Cleanup.
         */
        return () => {
          window.removeEventListener("mousemove", handleMouseMove);

          button.removeEventListener("mouseenter", handleEnter);

          button.removeEventListener("mouseleave", handleLeave);
        };
      }

      /*
       * If buttons aren't available, still
       * clean up the mouse listener.
       */
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden border-b border-white/10"
    >
      {/* Three.js background */}
      <div ref={visualRef} className="absolute inset-0 will-change-transform">
        <HeroScene />
      </div>

      {/* Optional darkening layer */}
      <div className="pointer-events-none absolute inset-0 bg-black/10" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] items-end px-6 pb-20 pt-32 lg:px-8 lg:pb-24">
        <div className="grid w-full gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <p
              ref={eyebrowRef}
              className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-white/50"
            >
              AI-Powered Study Workspace
            </p>

            {/* Headline */}
            <h1
              ref={titleRef}
              className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl"
            >
              <span className="block">Turn Your Study</span>

              <span className="block">Material Into</span>

              <span className="block">Knowledge.</span>
            </h1>

            {/* Description */}
            <p
              ref={descriptionRef}
              className="mt-7 max-w-xl text-sm leading-6 text-white/55 sm:text-base"
            >
              Upload your notes and documents. NoteGenius helps you understand,
              organize, discuss, and practice what you learn.
            </p>

            {/* Actions */}
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
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium backdrop-blur-md will-change-transform"
              >
                <FaGithub size={16} />
                Explore on GitHub
              </a>
            </div>
          </div>

          {/* Trust */}
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
