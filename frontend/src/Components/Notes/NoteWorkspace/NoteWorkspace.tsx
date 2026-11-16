import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Check, FileText, Loader2, Upload, X } from "lucide-react";
import { useParams } from "react-router-dom";

import {
  clearCurrentNote,
  clearDiscussion,
  clearError,
} from "../../../slices/noteSlice";

import { getOneNote, uploadNote } from "../../../api/notesApi";

import { useAppDispatch, useAppSelector } from "../../../hooks/appHook";

import NoteWorkspaceHeader from "./NoteWorkspaceHeader";
import DiscussionPanel from "./DiscussionPanel";
import WorkspacePanel from "./WorkspacePanel";

type UploadStatus = "idle" | "uploading" | "success" | "error";

const NoteWorkspace = () => {
  const { notesPublicId } = useParams<{
    notesPublicId: string;
  }>();

  const dispatch = useAppDispatch();

  const { currentNote, loadingNote, uploading, error } = useAppSelector(
    (state) => state.notes,
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!notesPublicId) return;

    dispatch(clearError());
    dispatch(getOneNote(notesPublicId));

    return () => {
      dispatch(clearCurrentNote());
      dispatch(clearDiscussion());
      dispatch(clearError());
    };
  }, [dispatch, notesPublicId]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) return;

    dispatch(clearError());

    setFile(selectedFile);
    setUploadStatus("idle");
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!notesPublicId || !file || uploading) return;

    dispatch(clearError());

    setUploadStatus("uploading");
    setUploadError(null);

    try {
      await dispatch(
        uploadNote({
          notesPublicId,
          file,
        }),
      ).unwrap();

      setUploadStatus("success");
      setUploadError(null);
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await dispatch(getOneNote(notesPublicId));
    } catch (err) {
      setUploadStatus("error");

      setUploadError(
        typeof err === "string" ? err : "Unable to upload the study material.",
      );
    }
  };

  const clearSelectedFile = () => {
    if (uploading) return;

    dispatch(clearError());

    setFile(null);
    setUploadStatus("idle");
    setUploadError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loadingNote) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080808] text-[#F5F5F5]">
        <p className="text-sm text-[#737373]">Loading note...</p>
      </div>
    );
  }

  if (!currentNote || !notesPublicId) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080808] text-[#F5F5F5]">
        <p className="text-sm text-[#737373]">Note not found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#080808] text-[#F5F5F5]">
      {/* Note header */}
      <div className="shrink-0 border-b border-[#252525] px-6 sm:px-8 lg:px-10">
        <NoteWorkspaceHeader
          note={currentNote}
          onAddMaterial={() => {
            dispatch(clearError());
            setUploadStatus("idle");
            setUploadError(null);
            fileInputRef.current?.click();
          }}
        />
      </div>

      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Selected file */}
      {file && (
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#252525] px-6 py-2 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-2">
            <FileText size={14} className="shrink-0 text-[#737373]" />

            <p className="truncate text-xs text-[#A3A3A3]">{file.name}</p>

            <span className="shrink-0 text-[10px] text-[#525252]">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={clearSelectedFile}
              disabled={uploading}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#525252] transition hover:bg-white/[0.04] hover:text-[#A3A3A3] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Remove selected file"
            >
              <X size={13} />
            </button>

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="flex h-7 items-center gap-1.5 rounded-md bg-[#F5F5F5] px-3 text-[11px] font-medium text-[#080808] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <Upload size={12} />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upload feedback */}
      {(uploadStatus === "success" || uploadStatus === "error") && (
        <div className="flex shrink-0 items-center border-b border-[#252525] px-6 py-2 sm:px-8 lg:px-10">
          {uploadStatus === "success" ? (
            <p className="flex items-center gap-2 text-[11px] text-[#737373]">
              <Check size={13} className="text-[#5B8CFF]" />
              Study material uploaded successfully.
            </p>
          ) : (
            <p className="text-[11px] text-red-400">{uploadError || error}</p>
          )}
        </div>
      )}

      {/* Main workspace */}
      <main className="min-h-0 flex-1">
        <div className="flex h-full min-h-0">
          <section className="min-w-0 flex-1">
            <DiscussionPanel notesPublicId={currentNote.publicId} />
          </section>

          <WorkspacePanel note={currentNote} />
        </div>
      </main>
    </div>
  );
};

export default NoteWorkspace;
