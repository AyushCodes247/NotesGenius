import { useSelector } from "react-redux";

import type { RootState } from "../../store/store";

const DashboardHeader = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const firstName = user.username?.trim().split(" ")[0] || "there";

  const hour = new Date().getHours();

  let greeting = "Good morning";

  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good evening";
  } else if (hour >= 21 || hour < 5) {
    greeting = "Good night";
  }

  return (
    <header className="flex flex-col gap-6 border-b border-white/[0.08] pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#5B8CFF]">
          My Workspace
        </p>

        <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-white sm:text-[34px]">
          {greeting}, {firstName}.
        </h1>

        <p className="mt-2 max-w-[520px] text-[14px] leading-6 text-white/45">
          Continue learning from where you left off.
        </p>
      </div>

      <div className="text-left md:text-right">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/25">
          Your study space
        </p>

        <p className="mt-1 text-[13px] text-white/50">
          Notes · Discussions · Quizzes
        </p>
      </div>
    </header>
  );
};

export default DashboardHeader;
