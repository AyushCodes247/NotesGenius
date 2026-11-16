import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { BookOpen, LayoutDashboard, User, Brain } from "lucide-react";

const AppLayout = () => {
  const navigate = useNavigate();

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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#080808] text-[#F5F5F5]">
      {/* Global application header */}
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

          {/* Mobile navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-lg p-2 text-[#737373] transition hover:bg-white/[0.05] hover:text-[#F5F5F5]"
              aria-label="Dashboard"
            >
              <LayoutDashboard size={17} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/notes")}
              className="rounded-lg p-2 text-[#737373] transition hover:bg-white/[0.05] hover:text-[#F5F5F5]"
              aria-label="Notes"
            >
              <BookOpen size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
