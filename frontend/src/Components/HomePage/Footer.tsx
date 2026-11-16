import { ArrowUpRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa"

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-white/10">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5B8CFF]/[0.06] blur-[100px]"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-8">
        {/* Main CTA */}
        <div className="border-b border-white/10 py-20 lg:py-28">
          <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-white/35">
                Start learning differently
              </p>

              <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                Turn your study material
                <br />
                <span className="text-white/35">into knowledge.</span>
              </h2>

              <p className="mt-7 max-w-xl text-sm leading-6 text-white/45 lg:text-base">
                Upload your material, understand it with AI, and turn what you
                learn into structured notes and practice.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                to="/register"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-black transition-colors duration-300 hover:bg-white/90"
              >
                Get Started
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Link>

              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-white/70 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                <FaGithub size={16} strokeWidth={1.8} />
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Footer navigation */}
        <div className="grid gap-12 border-b border-white/10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-16">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link
              to="/"
              className="inline-flex items-center text-lg font-semibold tracking-[-0.03em] text-white"
            >
              NoteGenius
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/40">
              An open-source AI study workspace built to help learners
              understand, organize, and practice what they learn.
            </p>

            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 text-xs font-medium text-white/45 transition-colors hover:text-white"
            >
              <Star size={14} strokeWidth={1.6} />
              Star NoteGenius on GitHub
              <ArrowUpRight size={13} strokeWidth={1.6} />
            </a>
          </div>

          {/* Product */}
          <div className="lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
              Product
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                to="/notes"
                className="w-fit text-sm text-white/45 transition-colors hover:text-white"
              >
                Notes
              </Link>

              <Link
                to="/discussion"
                className="w-fit text-sm text-white/45 transition-colors hover:text-white"
              >
                Discussion
              </Link>

              <Link
                to="/quizzes"
                className="w-fit text-sm text-white/45 transition-colors hover:text-white"
              >
                Quizzes
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
              Resources
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <a
                href="#how-it-works"
                className="w-fit text-sm text-white/45 transition-colors hover:text-white"
              >
                How it works
              </a>

              <a
                href="#features"
                className="w-fit text-sm text-white/45 transition-colors hover:text-white"
              >
                Features
              </a>

              <a
                href="#about"
                className="w-fit text-sm text-white/45 transition-colors hover:text-white"
              >
                About
              </a>
            </div>
          </div>

          {/* Community */}
          <div className="lg:col-span-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
              Community
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="group flex w-fit items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white"
              >
                GitHub
                <ArrowUpRight
                  size={13}
                  strokeWidth={1.6}
                  className="opacity-50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>

              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="group flex w-fit items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white"
              >
                Issues
                <ArrowUpRight
                  size={13}
                  strokeWidth={1.6}
                  className="opacity-50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>

              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="group flex w-fit items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white"
              >
                Contribute
                <ArrowUpRight
                  size={13}
                  strokeWidth={1.6}
                  className="opacity-50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/25">
            © 2026 NoteGenius. Built for learners.
          </p>

          <div className="flex items-center gap-2 text-xs text-white/25">
            <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
            <span>Built in the open</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
