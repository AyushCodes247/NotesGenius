import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  clearCurrentNote,
  clearDiscussion,
} from "../../../slices/noteSlice";

import {
  getOneNote,
  uploadNote,
} from "../../../api/notesApi";

import { useAppDispatch, useAppSelector } from "../../../hooks/appHook";

import NoteWorkspaceHeader from "./NoteWorkspaceHeader";
import NoteContent from "./NoteContent";
import DiscussionPanel from "./DiscussionPanel";
import UploadDropzone from "../NewNote/UploadDropzone";

const NoteWorkspace = () => {
  const { notesPublicId } = useParams<{ notesPublicId: string }>();

  const dispatch = useAppDispatch();

  const {
    currentNote,
    loadingNote,
    uploading,
    error,
  } = useAppSelector((state) => state.notes);

  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!notesPublicId) return;

    dispatch(getOneNote(notesPublicId));

    return () => {
      dispatch(clearCurrentNote());
      dispatch(clearDiscussion());
    };
  }, [dispatch, notesPublicId]);

  const handleUpload = async () => {
    if (!notesPublicId || !file) return;

    setUploadError(null);

    try {
      await dispatch(
        uploadNote({
          notesPublicId,
          file,
        }),
      ).unwrap();

      setFile(null);

      /*
       * Refresh the note after upload so the workspace
       * gets the latest processing/source information.
       */
      await dispatch(getOneNote(notesPublicId));
    } catch (err) {
      setUploadError(
        typeof err === "string"
          ? err
          : "Unable to upload the study material.",
      );
    }
  };

  if (loadingNote) {
    return (
      <div className="min-h-screen bg-[#080808] text-[#F5F5F5]">
        <div className="mx-auto flex min-h-screen max-w-[1440px] items-center justify-center px-6">
          <p className="text-sm text-[#737373]">
            Loading note...
          </p>
        </div>
      </div>
    );
  }

  if (!currentNote || !notesPublicId) {
    return (
      <div className="min-h-screen bg-[#080808] text-[#F5F5F5]">
        <div className="mx-auto flex min-h-screen max-w-[1440px] items-center justify-center px-6">
          <p className="text-sm text-[#737373]">
            Note not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5]">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-6 sm:px-8 lg:px-10">
        <NoteWorkspaceHeader note={currentNote} />

        {!currentNote.sourceText && (
          <div className="mt-6 rounded-xl border border-[#252525] bg-[#111111] p-5">
            <div className="mb-4">
              <p className="text-sm font-medium text-[#F5F5F5]">
                Upload study material
              </p>

              <p className="mt-1 text-sm text-[#737373]">
                Upload a PDF, DOCX, TXT, Markdown, or PNG file to start
                generating knowledge from this note.
              </p>
            </div>

            <UploadDropzone
              file={file}
              onFileChange={setFile}
              disabled={uploading}
            />

            {file && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#5B8CFF] px-5 text-sm font-medium text-white transition hover:bg-[#7AA3FF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload material"}
              </button>
            )}

            {(uploadError || error) && (
              <p className="mt-3 text-sm text-red-400">
                {uploadError || error}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          <NoteContent note={currentNote} />

          <DiscussionPanel
            notesPublicId={currentNote.publicId}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteWorkspace;