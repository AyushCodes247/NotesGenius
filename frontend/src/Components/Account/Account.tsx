import { useLayoutEffect, useRef } from "react";
import { CalendarDays, Mail, User, AtSign } from "lucide-react";
import gsap from "gsap";

import { useAppSelector } from "../../hooks/appHook";
import Logout from "../Authentication/Logout";

const Account = () => {
  const user = useAppSelector((state) => state.user.user);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const profile = profileRef.current;
    const section = sectionRef.current;

    if (!container || !profile || !section) return;

    const elements = section.children;

    const context = gsap.context(() => {
      gsap.set(profile, {
        opacity: 0,
        y: 12,
      });

      gsap.set(elements, {
        opacity: 0,
        y: 8,
      });

      const timeline = gsap.timeline();

      timeline.to(profile, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out",
      });

      timeline.to(
        elements,
        {
          opacity: 1,
          y: 0,
          duration: 0.28,
          stagger: 0.06,
          ease: "power2.out",
        },
        "-=0.12",
      );
    }, container);

    return () => {
      context.revert();
    };
  }, []);

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const initials = user.username
    ? user.username.slice(0, 1).toUpperCase()
    : "U";

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto bg-[#080808] text-[#F5F5F5]"
    >
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        {/* Page heading */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[#737373]">
            Account
          </p>

          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#F5F5F5] sm:text-3xl">
            Profile
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#737373]">
            Manage your NoteGenius account information.
          </p>
        </div>

        {/* Profile identity */}
        <div
          ref={profileRef}
          className="mb-6 rounded-xl border border-[#252525] bg-[#111111] p-5 sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#303030] bg-[#171717] text-lg font-semibold text-[#F5F5F5]">
              {initials}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold tracking-[-0.02em] text-[#F5F5F5]">
                {user.username || "User"}
              </h2>

              <p className="mt-1 truncate text-sm text-[#737373]">
                @{user.userhandle || "username"}
              </p>
            </div>
          </div>
        </div>

        {/* Account information */}
        <section
          ref={sectionRef}
          className="overflow-hidden rounded-xl border border-[#252525] bg-[#111111]"
        >
          {/* Section heading */}
          <div className="border-b border-[#252525] px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold text-[#F5F5F5]">
              Account information
            </h2>

            <p className="mt-1 text-xs text-[#737373]">
              Your basic account details.
            </p>
          </div>

          {/* Username */}
          <div className="flex items-center gap-4 border-b border-[#252525] px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#252525] bg-[#171717] text-[#737373]">
              <User size={16} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#737373]">Username</p>

              <p className="mt-1 truncate text-sm text-[#F5F5F5]">
                {user.username || "—"}
              </p>
            </div>
          </div>

          {/* Handle */}
          <div className="flex items-center gap-4 border-b border-[#252525] px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#252525] bg-[#171717] text-[#737373]">
              <AtSign size={16} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#737373]">User handle</p>

              <p className="mt-1 truncate text-sm text-[#F5F5F5]">
                {user.userhandle ? `@${user.userhandle}` : "—"}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4 border-b border-[#252525] px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#252525] bg-[#171717] text-[#737373]">
              <Mail size={16} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#737373]">Email</p>

              <p className="mt-1 truncate text-sm text-[#F5F5F5]">
                {user.email || "—"}
              </p>
            </div>
          </div>

          {/* Member since */}
          <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#252525] bg-[#171717] text-[#737373]">
              <CalendarDays size={16} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#737373]">Member since</p>

              <p className="mt-1 text-sm text-[#F5F5F5]">{memberSince}</p>
            </div>
          </div>
        </section>

        {/* Account actions */}
        <section className="mt-6">
          <Logout />
        </section>
      </div>
    </div>
  );
};

export default Account;
