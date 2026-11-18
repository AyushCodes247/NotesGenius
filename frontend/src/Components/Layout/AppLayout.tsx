import { useLayoutEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import gsap from "gsap";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Notes",
    path: "/notes",
  },
  {
    label: "Quizzes",
    path: "/quizzes",
  },
  {
    label: "Account",
    path: "/account",
  },
];

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!mobileMenuRef.current) {
      return;
    }

    if (mobileOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        {
          height: 0,
          opacity: 0,
        },
        {
          height: "auto",
          opacity: 1,
          duration: 0.25,
          ease: "power2.out",
        },
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.2,
        ease: "power2.inOut",
      });
    }
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5]">
      <header className="border-b border-white/[0.08] bg-[#080808]">
        <div className="flex h-14 items-center justify-between px-5 sm:px-7 lg:px-10">
          <NavLink
            to="/dashboard"
            className="text-[15px] font-semibold tracking-[-0.02em] text-white"
          >
            NoteGenius
          </NavLink>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-3 py-2 text-[12px] font-medium transition-colors",
                    isActive
                      ? "bg-white/[0.06] text-white"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white/70",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white md:hidden"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          >
            {mobileOpen ? (
              <X size={17} strokeWidth={1.7} />
            ) : (
              <Menu size={17} strokeWidth={1.7} />
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        <div
          ref={mobileMenuRef}
          className="overflow-hidden border-t border-white/[0.06] md:hidden"
          style={{
            height: 0,
            opacity: 0,
          }}
        >
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-white/[0.06] text-white"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white/70",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
