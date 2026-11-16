import { useState } from "react";
import { Download, FileText, Inbox, Share2 } from "lucide-react";

type WorkspacePanelProps = {
  note: {
    content: string;
    sourceText: string | null;
    pdfUrl: string | null;
  };
};

type WorkspaceTab = "downloads" | "shared" | "received";

const WorkspacePanel = ({ note }: WorkspacePanelProps) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("downloads");

  const tabs = [
    {
      id: "downloads" as const,
      label: "Downloads",
      icon: Download,
    },
    {
      id: "shared" as const,
      label: "Shared",
      icon: Share2,
    },
    {
      id: "received" as const,
      label: "Received",
      icon: Inbox,
    },
  ];

  return (
    <aside className="hidden min-h-0 w-[300px] shrink-0 border-l border-[#252525] xl:flex xl:flex-col">
      <div className="shrink-0 border-b border-[#252525] px-4">
        <div className="flex h-12 items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "flex h-full items-center gap-1.5 border-b-2 px-2 text-[11px] font-medium transition",
                  active
                    ? "border-[#5B8CFF] text-[#F5F5F5]"
                    : "border-transparent text-[#525252] hover:text-[#A3A3A3]",
                ].join(" ")}
              >
                <Icon size={13} strokeWidth={1.8} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {activeTab === "downloads" && (
          <>
            <div className="mb-5">
              <p className="text-xs font-medium text-[#F5F5F5]">
                Generated files
              </p>

              <p className="mt-1 text-[11px] leading-5 text-[#525252]">
                Files created from this note.
              </p>
            </div>

            {note.pdfUrl ? (
              <a
                href={note.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-[#252525] bg-[#0D0D0D] p-3 transition hover:border-[#303030] hover:bg-[#111111]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-[#737373]">
                  <FileText size={15} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs text-[#A3A3A3]">Note PDF</p>

                  <p className="mt-0.5 text-[10px] text-[#525252]">
                    Open generated file
                  </p>
                </div>
              </a>
            ) : (
              <EmptyState icon={Download} text="No downloads yet." />
            )}
          </>
        )}

        {activeTab === "shared" && (
          <EmptyState icon={Share2} text="Notes you share will appear here." />
        )}

        {activeTab === "received" && (
          <EmptyState
            icon={Inbox}
            text="Notes shared with you will appear here."
          />
        )}
      </div>
    </aside>
  );
};

type EmptyStateProps = {
  icon: typeof Download;
  text: string;
};

const EmptyState = ({ icon: Icon, text }: EmptyStateProps) => {
  return (
    <div className="py-12 text-center">
      <Icon size={18} className="mx-auto text-[#303030]" />

      <p className="mt-3 text-xs text-[#525252]">{text}</p>
    </div>
  );
};

export default WorkspacePanel;
