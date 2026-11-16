import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import gsap from "gsap";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    const menuItems = menuItemsRef.current;

    if (!menu || !menuItems) return;

    gsap.set(menu, {
      opacity: 0,
      y: -20,
      pointerEvents: "none",
    });

    gsap.set(menuItems.children, {
      opacity: 0,
      y: 20,
    });
  }, []);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    const menuItems = menuItemsRef.current;

    if (!menu || !menuItems) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(menu, {
        opacity: isMenuOpen ? 1 : 0,
        y: 0,
        pointerEvents: isMenuOpen ? "auto" : "none",
      });

      gsap.set(menuItems.children, {
        opacity: isMenuOpen ? 1 : 0,
        y: 0,
      });

      return;
    }

    if (isMenuOpen) {
      gsap.to(menu, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power3.out",
        pointerEvents: "auto",
      });

      gsap.to(menuItems.children, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        delay: 0.08,
        ease: "power3.out",
      });
    } else {
      gsap.to(menuItems.children, {
        opacity: 0,
        y: 12,
        duration: 0.2,
        stagger: 0.03,
        ease: "power2.in",
      });

      gsap.to(menu, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        delay: 0.05,
        ease: "power2.in",
        pointerEvents: "none",
      });
    }
  }, [isMenuOpen]);

  useLayoutEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    closeMenu();

    const section = document.getElementById(id);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.history.pushState(null, "", `/#${id}`);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="relative mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="relative z-20 text-lg font-semibold tracking-tight"
        >
          NoteGenius
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <button
            type="button"
            onClick={() => scrollToSection("features")}
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            Features
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("how-it-works")}
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("about")}
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            About
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
          >
            <FaGithub size={16} />
            GitHub
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            to="/login"
            className="text-sm text-white/70 transition-colors hover:text-white"
          >
            Log in
          </Link>

          <Link
            to="/register"
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="relative z-20 flex items-center gap-2 md:hidden">
          <Link
            to="/register"
            className="rounded-md bg-white px-3.5 py-2 text-sm font-medium text-black transition-transform active:scale-[0.98]"
          >
            Get Started
          </Link>

          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((previous) => !previous)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/[0.08]"
          >
            {isMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          ref={menuRef}
          className="absolute inset-x-0 top-0 -z-10 min-h-screen border-b border-white/10 bg-[#080808]/95 px-6 pt-24 backdrop-blur-xl md:hidden"
        >
          <div ref={menuItemsRef} className="flex flex-col">
            {/* Main Links */}
            <div className="border-t border-white/10">
              <button
                type="button"
                onClick={() => scrollToSection("features")}
                className="flex w-full items-center justify-between border-b border-white/10 py-5 text-left text-2xl font-medium tracking-tight text-white/90 transition-colors hover:text-white"
              >
                Features
                <ArrowUpRight size={20} className="text-white/40" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("how-it-works")}
                className="flex w-full items-center justify-between border-b border-white/10 py-5 text-left text-2xl font-medium tracking-tight text-white/90 transition-colors hover:text-white"
              >
                How It Works
                <ArrowUpRight size={20} className="text-white/40" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("about")}
                className="flex w-full items-center justify-between border-b border-white/10 py-5 text-left text-2xl font-medium tracking-tight text-white/90 transition-colors hover:text-white"
              >
                About
                <ArrowUpRight size={20} className="text-white/40" />
              </button>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
                className="flex items-center justify-between border-b border-white/10 py-5 text-2xl font-medium tracking-tight text-white/90 transition-colors hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <FaGithub size={21} />
                  GitHub
                </span>

                <ArrowUpRight size={20} className="text-white/40" />
              </a>
            </div>

            {/* Secondary Actions */}
            <div className="mt-8 flex flex-col gap-3">
              <Link
                to="/login"
                onClick={closeMenu}
                className="rounded-md border border-white/10 bg-white/[0.03] px-5 py-3.5 text-center text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Log in
              </Link>

              <Link
                to="/register"
                onClick={closeMenu}
                className="rounded-md bg-white px-5 py-3.5 text-center text-sm font-medium text-black transition-transform active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Footer */}
            <div className="mt-auto flex items-center gap-4 pb-8 pt-16 text-xs uppercase tracking-[0.14em] text-white/35">
              <span>Open Source</span>
              <span>•</span>
              <span>Built for Learners</span>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
