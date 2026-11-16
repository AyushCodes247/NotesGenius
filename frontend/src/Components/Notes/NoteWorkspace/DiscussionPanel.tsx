import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import { discussNote } from "../../../api/notesApi";
import { useAppDispatch, useAppSelector } from "../../../hooks/appHook";

import {
  addDiscussionMessage,
  clearDiscussion,
} from "../../../slices/noteSlice";

import DiscussionMessage from "./DiscussionMessage";
import DiscussionInput, { type DiscussionMode } from "./DiscussionInput";

type DiscussionPanelProps = {
  notesPublicId: string;
};

const MODE_COMMANDS: Record<DiscussionMode, string> = {
  summarize: "@summarize",
  create: "@create",
  bulletpoints: "@bulletpoints",
  "short-summary": "@short-summary",
  explain: "@explain",
};

const DiscussionPanel = ({ notesPublicId }: DiscussionPanelProps) => {
  const dispatch = useAppDispatch();

  const { discussion, discussing, error } = useAppSelector(
    (state) => state.notes,
  );

  const [input, setInput] = useState("");
  const [mode, setMode] = useState<DiscussionMode>("summarize");

  useEffect(() => {
    dispatch(clearDiscussion());
  }, [dispatch, notesPublicId]);

  const handleSend = async () => {
    const message = input.trim();

    if (!message || discussing) return;

    setInput("");

    dispatch(
      addDiscussionMessage({
        role: "user",
        content: message,
      }),
    );

    await dispatch(
      discussNote({
        notesPublicId,
        command: MODE_COMMANDS[mode],
        query: message,
        ...(discussion.conversationId
          ? {
              conversationId: discussion.conversationId,
            }
          : {}),
      }),
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col">
      {/* Conversation */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-[820px] flex-col px-6 py-8 sm:px-8 lg:px-10">
          {discussion.messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center pb-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#252525] bg-[#111111] text-[#5B8CFF]">
                <Sparkles size={19} />
              </div>

              <h2 className="mt-5 text-base font-semibold tracking-[-0.02em] text-[#F5F5F5]">
                What would you like to understand?
              </h2>

              <p className="mt-2 max-w-[420px] text-sm leading-6 text-[#737373]">
                Choose a mode below and ask NoteGenius to work with your study
                material.
              </p>
            </div>
          ) : (
            <div className="space-y-7">
              {discussion.messages.map((message, index) => (
                <DiscussionMessage
                  key={`${message.role}-${index}`}
                  role={message.role}
                  content={message.content}
                />
              ))}

              {discussing && (
                <div className="flex items-center gap-2 text-xs text-[#737373]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#5B8CFF]" />
                  NoteGenius is thinking...
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs leading-5 text-red-400">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0">
        <div className="mx-auto w-full max-w-[820px] px-6 pb-5 sm:px-8 lg:px-10">
          <DiscussionInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            mode={mode}
            onModeChange={setMode}
            disabled={discussing}
          />
        </div>
      </div>
    </section>
  );
};

export default DiscussionPanel;
