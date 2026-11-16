import { useLayoutEffect, useRef } from "react";
import type { ComponentType } from "react";
import {
  ArrowUpRight,
  Brain,
  FolderOpen,
  MessageSquare,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";

const features = [
  {
    icon: Brain,
    title: "AI Notes",
    description:
      "Turn your study material into structured notes, summaries, key points, and explanations.",
    number: "01",
    featured: true,
  },
  {
    icon: MessageSquare,
    title: "Document Discussion",
    description:
      "Ask questions about your material and have contextual conversations grounded in what you're learning.",
    number: "02",
  },
  {
    icon: Sparkles,
    title: "Smart Quizzes",
    description:
      "Generate quizzes from your study material and test how well you actually understand it.",
    number: "03",
  },
  {
    icon: Search,
    title: "Knowledge Retrieval",
    description:
      "Find relevant information from your documents without searching through everything manually.",
    number: "04",
  },
  {
    icon: Share2,
    title: "Export & Share",
    description:
      "Export your notes and share useful study material with others when you need to.",
    number: "05",
  },
  {
    icon: FolderOpen,
    title: "Organized Workspace",
    description:
      "Keep your documents, notes, discussions, and quizzes together in one focused workspace.",
    number: "06",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="relative overflow-hidden border-b border-white/10"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-8 lg:py-32">
        {/* Section Header */}
        <div className="mb-16 max-w-2xl lg:mb-20">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-white/40">
            Features
          </p>

          <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Everything you need
            <br />
            to learn smarter.
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
            From understanding your material to testing what you know,
            NoteGenius brings your entire learning workflow together.
          </p>
        </div>

        {/* Feature Bento */}
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Featured */}
          <div className="lg:col-span-7">
            <FeatureCard {...features[0]} featured />
          </div>

          {/* Right Column */}
          <div className="grid gap-4 lg:col-span-5">
            <FeatureCard {...features[1]} />
            <FeatureCard {...features[2]} />
          </div>

          {/* Bottom Row */}
          <div className="lg:col-span-4">
            <FeatureCard {...features[3]} />
          </div>

          <div className="lg:col-span-4">
            <FeatureCard {...features[4]} />
          </div>

          <div className="lg:col-span-4">
            <FeatureCard {...features[5]} />
          </div>
        </div>
      </div>
    </section>
  );
};

type FeatureCardProps = {
  icon: ComponentType<{
    className?: string;
    size?: number;
    strokeWidth?: number;
  }>;
  title: string;
  description: string;
  number: string;
  featured?: boolean;
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  number,
  featured = false,
}: FeatureCardProps) => {
  const cardRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    const icon = iconRef.current;
    const arrow = arrowRef.current;
    const numberElement = numberRef.current;
    const line = lineRef.current;

    if (!card || !glow || !icon || !arrow || !numberElement || !line) {
      return;
    }

    const ctx = gsap.context(() => {
      const enter = () => {
        gsap.killTweensOf([card, glow, icon, arrow, numberElement, line]);

        gsap.to(card, {
          y: -5,
          duration: 0.45,
          ease: "power3.out",
        });

        gsap.to(glow, {
          opacity: 1,
          scale: 1.15,
          x: -10,
          y: 10,
          duration: 0.7,
          ease: "power3.out",
        });

        gsap.to(icon, {
          y: -3,
          rotation: -4,
          scale: 1.04,
          duration: 0.45,
          ease: "power3.out",
        });

        gsap.to(arrow, {
          x: 3,
          y: -3,
          rotation: 4,
          duration: 0.4,
          ease: "power3.out",
        });

        // Background number
        gsap.to(numberElement, {
          x: -3,
          y: -2,
          opacity: 0.07,
          scale: 1.02,
          duration: 0.6,
          ease: "power3.out",
        });

        // White hover accent
        gsap.to(line, {
          scaleX: 1,
          transformOrigin: "left center",
          duration: 0.55,
          ease: "power3.out",
        });
      };

      const leave = () => {
        gsap.killTweensOf([card, glow, icon, arrow, numberElement, line]);

        gsap.to(card, {
          y: 0,
          duration: 0.55,
          ease: "power3.out",
        });

        gsap.to(glow, {
          opacity: 0,
          scale: 1,
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
        });

        gsap.to(icon, {
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.5,
          ease: "power3.out",
        });

        gsap.to(arrow, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.45,
          ease: "power3.out",
        });

        // Return number to its original state
        gsap.to(numberElement, {
          x: 0,
          y: 0,
          opacity: 0.05,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
        });

        // Hide white hover accent
        gsap.to(line, {
          scaleX: 0,
          transformOrigin: "right center",
          duration: 0.45,
          ease: "power3.inOut",
        });
      };

      card.addEventListener("mouseenter", enter);
      card.addEventListener("mouseleave", leave);

      return () => {
        card.removeEventListener("mouseenter", enter);
        card.removeEventListener("mouseleave", leave);
      };
    }, card);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <article
      ref={cardRef}
      className={`group relative overflow-hidden rounded-xl border border-white/[0.14] bg-white/[0.05] ${
        featured
          ? "min-h-[360px] lg:min-h-[440px]"
          : "min-h-[250px] lg:min-h-[210px]"
      }`}
    >
      {/* Hover Glow */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 z-0 h-72 w-72 rounded-full bg-[#5B8CFF]/10 opacity-0 blur-3xl"
      />

      {/* Subtle Inner Highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-gradient-to-br from-white/[0.035] via-transparent to-transparent opacity-60"
      />

      {/* Background Number */}
      <span
        ref={numberRef}
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-10 right-4 z-[1] select-none font-semibold leading-none tracking-[-0.09em] text-white/[0.05] ${
          featured ? "text-[190px]" : "text-[140px]"
        }`}
      >
        {number}
      </span>

      {/* Content */}
      <div
        className={`relative z-10 flex h-full flex-col ${
          featured ? "p-8 lg:p-10" : "p-7 lg:p-8"
        }`}
      >
        {/* Top */}
        <div className="flex items-start justify-between">
          <div
            ref={iconRef}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.055] text-white/70"
          >
            <Icon size={20} strokeWidth={1.7} />
          </div>

          <div
            ref={arrowRef}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.10] text-white/30"
          >
            <ArrowUpRight size={15} strokeWidth={1.7} />
          </div>
        </div>

        {/* Text */}
        <div className="mt-auto">
          <h3
            className={`font-semibold tracking-[-0.03em] text-white ${
              featured ? "text-3xl lg:text-4xl" : "text-xl lg:text-2xl"
            }`}
          >
            {title}
          </h3>

          <p
            className={`mt-3 leading-6 text-white/50 ${
              featured
                ? "max-w-2xl text-sm lg:text-[15px] lg:leading-7"
                : "max-w-md text-sm"
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      {/* White Hover Accent */}
      <div
        ref={lineRef}
        aria-hidden="true"
        className="absolute bottom-0 left-0 z-20 h-px w-full origin-left scale-x-0 bg-white"
      />
    </article>
  );
};

export default Features;
