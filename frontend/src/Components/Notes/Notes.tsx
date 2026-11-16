import { useEffect } from "react";

import { getAllNotes, getSharedNotes } from "../../api/notesApi";
import { useAppDispatch, useAppSelector } from "../../hooks/appHook";

import NotesHeader from "./NotesHeader";
import NotesToolbar from "./NotesToolbar";
import NotesGrid from "./NotesGrid";
import SharedNotesSection from "./SharedNotesSection";

const Notes = () => {
  const dispatch = useAppDispatch();

  const { notes, sharedNotes, loadingNotes } = useAppSelector(
    (state) => state.notes,
  );

  useEffect(() => {
    dispatch(getAllNotes());
    dispatch(getSharedNotes());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5]">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-12">
        <NotesHeader />

        <div className="mt-8">
          <NotesToolbar />
        </div>

        <div className="mt-6">
          <NotesGrid notes={notes} loading={loadingNotes} />
        </div>

        {sharedNotes.length > 0 && (
          <div className="mt-16">
            <SharedNotesSection notes={sharedNotes} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
