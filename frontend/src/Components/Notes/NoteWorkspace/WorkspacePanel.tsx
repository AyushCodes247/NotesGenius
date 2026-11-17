import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Download, FileText, Inbox, Loader2, Share2, X } from "lucide-react";
import gsap from "gsap";

import {
  getSharedByMe,
  getSharedNotes,
  type SharedByMe,
  type SharedNote,
} from "../../../api/notesApi";

import { useAppDispatch, useAppSelector } from "../../../hooks/appHook";

import ShareNote from "./ShareNote";

type WorkspacePanelProps = {
  note: {
    publicId: string;
    content: string;
    sourceText: string | null;
    pdfUrl: string | null;
  };
};

type WorkspaceTab = "downloads" | "shared" | "received";

const WorkspacePanel = ({ note }: WorkspacePanelProps) => {
  const dispatch = useAppDispatch();

  const { sharedNotes, sharedByMe, loadingShared, loadingSharedByMe } =
    useAppSelector((state) => state.notes);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("downloads");

  const [mobileOpen, setMobileOpen] = useState(false);

  const mobileDrawerRef = useRef<HTMLDivElement | null>(null);
  const mobileContentRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (activeTab === "shared") {
      dispatch(getSharedByMe());
    }

    if (activeTab === "received") {
      dispatch(getSharedNotes());
    }
  }, [activeTab, dispatch]);

  useLayoutEffect(() => {
    const drawer = mobileDrawerRef.current;

    if (!drawer) return;

    if (mobileOpen) {
      gsap.fromTo(
        drawer,
        {
          y: "100%",
        },
        {
          y: "0%",
          duration: 0.28,
          ease: "power3.out",
        },
      );

      if (mobileContentRef.current) {
        gsap.fromTo(
          mobileContentRef.current,
          {
            opacity: 0,
            y: 8,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.2,
            delay: 0.08,
            ease: "power2.out",
          },
        );
      }
    } else {
      gsap.to(drawer, {
        y: "100%",
        duration: 0.22,
        ease: "power2.in",
      });
    }

    return () => {
      gsap.killTweensOf(drawer);

      if (mobileContentRef.current) {
        gsap.killTweensOf(mobileContentRef.current);
      }
    };
  }, [mobileOpen]);

  const handleMobileTabClick = (tab: WorkspaceTab) => {
    if (mobileOpen && activeTab === tab) {
      setMobileOpen(false);
      return;
    }

    setActiveTab(tab);
    setMobileOpen(true);
  };

  const renderContent = () => {
    if (activeTab === "downloads") {
      return (
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
            <div className="space-y-3">
              <a
                href={note.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-[#252525] bg-[#0D0D0D] p-3 transition hover:border-[#303030] hover:bg-[#111111]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-[#737373]">
                  <FileText size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-[#A3A3A3]">Note PDF</p>

                  <p className="mt-0.5 text-[10px] text-[#525252]">
                    Open generated file
                  </p>
                </div>

                <Download
                  size={14}
                  className="shrink-0 text-[#525252] transition group-hover:text-[#A3A3A3]"
                />
              </a>

              <ShareNote notesPublicId={note.publicId} pdfUrl={note.pdfUrl} />
            </div>
          ) : (
            <EmptyState
              icon={Download}
              text="Generate a note PDF before sharing."
            />
          )}
        </>
      );
    }

    if (activeTab === "shared") {
      return (
        <>
          <div className="mb-5">
            <p className="text-xs font-medium text-[#F5F5F5]">Shared files</p>

            <p className="mt-1 text-[11px] leading-5 text-[#525252]">
              Downloadable files you share with other users.
            </p>
          </div>

          {loadingSharedByMe ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={17} className="animate-spin text-[#525252]" />
            </div>
          ) : sharedByMe.length === 0 ? (
            <EmptyState
              icon={Share2}
              text="You have not shared any files yet."
            />
          ) : (
            <div className="space-y-2">
              {sharedByMe.map((shared: SharedByMe) => (
                <div
                  key={shared.sharePublicId}
                  className="rounded-lg border border-[#252525] bg-[#0D0D0D] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-[#737373]">
                      <FileText size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-[#A3A3A3]">
                        {shared.title}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-[#525252]">
                        Shared with @{shared.recipientUserHandle}
                      </p>
                    </div>

                    {shared.pdfUrl ? (
                      <a
                        href={shared.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#525252] transition hover:bg-white/[0.04] hover:text-[#A3A3A3]"
                        aria-label={`Download ${shared.title}`}
                      >
                        <Download size={13} />
                      </a>
                    ) : (
                      <span className="text-[10px] text-[#525252]">
                        Unavailable
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#525252]">
                      Shared file
                    </span>

                    <span className="text-[10px] text-[#525252]">
                      {new Date(shared.sharedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <div className="mb-5">
          <p className="text-xs font-medium text-[#F5F5F5]">Received files</p>

          <p className="mt-1 text-[11px] leading-5 text-[#525252]">
            Downloadable files shared with you.
          </p>
        </div>

        {loadingShared ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={17} className="animate-spin text-[#525252]" />
          </div>
        ) : sharedNotes.length === 0 ? (
          <EmptyState
            icon={Inbox}
            text="No downloadable files have been shared with you."
          />
        ) : (
          <div className="space-y-2">
            {sharedNotes.map((sharedNote: SharedNote) => (
              <div
                key={sharedNote.sharePublicId}
                className="flex items-center gap-3 rounded-lg border border-[#252525] bg-[#0D0D0D] p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-[#737373]">
                  <FileText size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-[#A3A3A3]">
                    {sharedNote.title}
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#525252]">
                    Shared file
                  </p>
                </div>

                {sharedNote.pdfUrl ? (
                  <a
                    href={sharedNote.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#525252] transition hover:bg-white/[0.04] hover:text-[#A3A3A3]"
                    aria-label={`Download ${sharedNote.title}`}
                  >
                    <Download size={13} />
                  </a>
                ) : (
                  <span className="text-[10px] text-[#525252]">
                    Unavailable
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {/* ------------------------------------------------------------ */}
      {/* Desktop workspace panel */}
      {/* ------------------------------------------------------------ */}

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
          {renderContent()}
        </div>
      </aside>

      {/* ------------------------------------------------------------ */}
      {/* Mobile / tablet workspace */}
      {/* ------------------------------------------------------------ */}

      <div className="absolute inset-x-0 bottom-0 z-30 xl:hidden">
        {/* ---------------------------------------------------------- */}
        {/* Mobile drawer */}
        {/* ---------------------------------------------------------- */}

        <div
          ref={mobileDrawerRef}
          className="
            absolute
            bottom-0
            left-0
            right-0
            translate-y-full
            border-t
            border-[#252525]
            bg-[#0D0D0D]
            shadow-[0_-20px_50px_rgba(0,0,0,0.45)]
          "
        >
          {/* Drawer header */}

          <div className="flex h-11 items-center justify-between border-b border-[#252525] px-4">
            <p className="text-xs font-medium text-[#F5F5F5]">
              {tabs.find((tab) => tab.id === activeTab)?.label}
            </p>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#525252] transition hover:bg-white/[0.04] hover:text-[#A3A3A3]"
              aria-label="Close workspace panel"
            >
              <X size={14} />
            </button>
          </div>

          {/* Drawer content */}

          <div ref={mobileContentRef} className="h-[230px] overflow-y-auto p-5">
            {renderContent()}
          </div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Mobile workspace toolbar */}
        {/* ---------------------------------------------------------- */}

        <div className="relative border-t border-[#252525] bg-[#080808] px-3">
          <div className="flex h-12 items-center justify-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = mobileOpen && activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleMobileTabClick(tab.id)}
                  className={[
                    "flex h-9 items-center gap-1.5 rounded-md px-3 text-[11px] font-medium transition",
                    active
                      ? "bg-white/[0.07] text-[#F5F5F5]"
                      : "text-[#525252] hover:bg-white/[0.04] hover:text-[#A3A3A3]",
                  ].join(" ")}
                >
                  <Icon size={13} strokeWidth={1.8} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

type EmptyStateProps = {
  icon: typeof Download;
  text: string;
};

const EmptyState = ({ icon: Icon, text }: EmptyStateProps) => {
  return (
    <div className="py-8 text-center">
      <Icon size={18} strokeWidth={1.6} className="mx-auto text-[#303030]" />

      <p className="mt-3 text-xs text-[#525252]">{text}</p>
    </div>
  );
};

export default WorkspacePanel;
