import { useEffect, useRef, type ChangeEvent } from "react";
import { CheckCircle2, FileText, Upload, X } from "lucide-react";

type UploadDropzoneProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".png"];

const UploadDropzone = ({
  file,
  onFileChange,
  disabled = false,
  autoFocus = false,
}: UploadDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRef.current?.click();
    }
  }, [autoFocus, disabled]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      window.alert("File size must be 4 MB or smaller.");
      event.target.value = "";
      return;
    }

    const extension = `.${selectedFile.name.split(".").pop()?.toLowerCase()}`;

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      window.alert(
        "Unsupported file type. Please upload PDF, DOCX, TXT, MD, or PNG.",
      );
      event.target.value = "";
      return;
    }

    onFileChange(selectedFile);
  };

  const handleRemove = () => {
    onFileChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex min-h-[360px] flex-col rounded-2xl border border-[#252525] bg-[#111111] p-6 sm:p-7">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#737373]">
          Study material
        </p>

        <h2 className="mt-3 text-xl font-semibold tracking-tight text-[#F5F5F5]">
          Upload your material.
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-[#737373]">
          Add a document and NoteGenius will prepare it for notes, discussion,
          and revision.
        </p>
      </div>

      <label
        className={`mt-8 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition ${
          disabled
            ? "cursor-not-allowed border-[#252525] opacity-50"
            : "border-[#303030] bg-[#0D0D0D] hover:border-[#5B8CFF]/50 hover:bg-[#111111]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,.png"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />

        {file ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(91,140,255,0.10)] text-[#5B8CFF]">
              <FileText size={22} />
            </div>

            <p className="mt-4 max-w-full truncate text-sm font-medium text-[#F5F5F5]">
              {file.name}
            </p>

            <p className="mt-1 text-xs text-[#737373]">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#8FAEFF]">
              <CheckCircle2 size={14} />
              File selected
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleRemove();
              }}
              disabled={disabled}
              className="mt-5 flex items-center gap-1.5 rounded-md border border-[#252525] px-3 py-1.5 text-xs text-[#737373] transition hover:border-[#303030] hover:text-[#F5F5F5]"
            >
              <X size={13} />
              Remove
            </button>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#252525] bg-[#111111] text-[#737373]">
              <Upload size={21} />
            </div>

            <p className="mt-4 text-sm font-medium text-[#F5F5F5]">
              Choose a study file
            </p>

            <p className="mt-2 text-xs text-[#737373]">
              PDF, DOCX, TXT, MD, or PNG
            </p>

            <p className="mt-1 text-xs text-[#525252]">
              Maximum file size: 4 MB
            </p>
          </>
        )}
      </label>
    </div>
  );
};

export default UploadDropzone;
