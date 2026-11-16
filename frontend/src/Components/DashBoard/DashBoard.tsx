import { useEffect } from "react";
import { useAppDispatch } from "../../hooks/appHook"
import { getAllNotes } from "../../api/notesApi";

import DashboardHeader from "./DashBoardHeader";
import QuickActions from "./QuickActions";
import NotesOverview from "../Notes/NotesOverview";

const Dashboard = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAllNotes());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5]">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-12">
        <DashboardHeader />

        <div className="mt-10">
          <QuickActions />
        </div>

        <div className="mt-12">
          <NotesOverview />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;