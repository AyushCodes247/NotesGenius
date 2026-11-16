import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { createNote } from "../../../api/notesApi";
import { useAppDispatch, useAppSelector } from "../../../hooks/appHook";

import CreateNoteForm from "./CreateNoteForm";

const NewNote = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { creating, error } = useAppSelector((state) => state.notes);

  const [title, setTitle] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const uploadMode =
    new URLSearchParams(location.search).get("upload") === "true";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setSubmitError("Please enter a note title.");
      return;
    }

    setSubmitError(null);

    try {
      const createdNote = await dispatch(
        createNote({
          title: trimmedTitle,
        }),
      ).unwrap();

      /*
       * The note now exists in the database.
       *
       * Upload happens from the workspace after creation.
       */
      navigate(
        `/notes/${createdNote.publicId}${uploadMode ? "?upload=true" : ""}`,
      );
    } catch (err) {
      setSubmitError(
        typeof err === "string"
          ? err
          : "Unable to create the note. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5]">
      <div className="mx-auto flex min-h-screen w-full max-w-[900px] items-center px-6 py-12 sm:px-8 lg:px-10">
        <div className="w-full">
          <div className="mb-10">
            <p className="text-xs font-medium tracking-[0.18em] text-[#737373]">
              {uploadMode ? "UPLOAD MATERIAL" : "NEW NOTE"}
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#F5F5F5] sm:text-4xl">
              {uploadMode
                ? "Create a note for your material."
                : "Create a new note."}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#A3A3A3]">
              Give your note a title first. You can upload your study material
              immediately after the note is created.
            </p>
          </div>

          <CreateNoteForm
            title={title}
            onTitleChange={setTitle}
            onSubmit={handleSubmit}
            loading={creating}
          />

          {(submitError || error) && (
            <p className="mt-4 text-sm text-red-400">
              {submitError || error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewNote;