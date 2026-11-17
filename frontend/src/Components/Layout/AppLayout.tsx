import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import gsap from "gsap";

import { BookOpen, Brain, LayoutDashboard, Menu, User, X } from "lucide-react";

const AppLayout = () => {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileItemsRef = useRef<HTMLDivElement | null>(null);

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Notes",
      path: "/notes",
      icon: BookOpen,
    },
    {
      label: "Quizzes",
      path: "/quizzes",
      icon: Brain,
    },
    {
      label: "Account",
      path: "/account",
      icon: User,
    },
  ];

  useLayoutEffect(() => {
    const menu = mobileMenuRef.current;
    const items = mobileItemsRef.current;

    if (!menu || !items) return;

    const itemElements = items.children;

    if (mobileMenuOpen) {
      gsap.set(menu, {
        height: 0,
        opacity: 0,
      });

      gsap.set(itemElements, {
        opacity: 0,
        y: -8,
      });

      const timeline = gsap.timeline();

      timeline.to(menu, {
        height: "auto",
        opacity: 1,
        duration: 0.24,
        ease: "power2.out",
      });

      timeline.to(
        itemElements,
        {
          opacity: 1,
          y: 0,
          duration: 0.2,
          stagger: 0.035,
          ease: "power2.out",
        },
        "-=0.12",
      );

      return () => {
        timeline.kill();
      };
    }

    gsap.to(menu, {
      height: 0,
      opacity: 0,
      duration: 0.18,
      ease: "power2.in",
    });

    gsap.to(itemElements, {
      opacity: 0,
      y: -6,
      duration: 0.12,
      stagger: 0.02,
      ease: "power2.in",
    });
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#080808] text-[#F5F5F5]">
      <header className="z-50 shrink-0 border-b border-[#252525] bg-[#080808]">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10 xl:px-12">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="shrink-0 text-[15px] font-semibold tracking-[-0.02em] text-[#F5F5F5] transition hover:text-white"
          >
            NoteGenius
          </button>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                      isActive
                        ? "bg-white/[0.06] text-[#F5F5F5]"
                        : "text-[#737373] hover:bg-white/[0.03] hover:text-[#A3A3A3]",
                    ].join(" ")
                  }
                >
                  <Icon size={15} strokeWidth={1.8} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-[#737373] transition hover:bg-white/[0.05] hover:text-[#F5F5F5] md:hidden"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
          >
            <span
              className={[
                "flex transition-transform duration-200",
                mobileMenuOpen ? "rotate-90" : "rotate-0",
              ].join(" ")}
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </span>
          </button>
        </div>

        {/* Mobile navigation */}
        <div
          ref={mobileMenuRef}
          className="overflow-hidden border-t border-[#252525] md:hidden"
          style={{ height: 0, opacity: 0 }}
        >
          <div ref={mobileItemsRef} className="space-y-1 px-5 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                        isActive
                          ? "bg-white/[0.06] text-[#F5F5F5]"
                          : "text-[#737373] hover:bg-white/[0.03] hover:text-[#A3A3A3]",
                      ].join(" ")
                    }
                  >
                    <Icon size={16} strokeWidth={1.8} />
                    {item.label}
                  </NavLink>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
