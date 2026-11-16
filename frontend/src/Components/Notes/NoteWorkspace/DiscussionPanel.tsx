import { useEffect, useState } from "react";
import { Bot, Sparkles } from "lucide-react";

import { discussNote } from "../../../api/notesApi";
import { useAppDispatch, useAppSelector } from "../../../hooks/appHook";
import {
  addDiscussionMessage,
  clearDiscussion,
} from "../../../slices/noteSlice";

import DiscussionMessage from "./DiscussionMessage";
import DiscussionInput from "./DiscussionInput";

type DiscussionPanelProps = {
  notesPublicId: string;
};

const DiscussionPanel = ({
  notesPublicId,
}: DiscussionPanelProps) => {
  const dispatch = useAppDispatch();

  const {
    discussion,
    discussing,
    error,
  } = useAppSelector((state) => state.notes);

  const [input, setInput] = useState("");

  useEffect(() => {
    dispatch(clearDiscussion());
  }, [dispatch, notesPublicId]);

  const handleSend = async (value?: string) => {
    const message = (value ?? input).trim();

    if (!message || discussing) {
      return;
    }

    setInput("");

    /*
     * Immediately add the user's message to Redux.
     */
    dispatch(
      addDiscussionMessage({
        role: "user",
        content: message,
      }),
    );

    /*
     * The backend command parser expects a command.
     *
     * For free-form discussion we use @summarize as the
     * default command while the actual question is passed
     * through query.
     */
    await dispatch(
      discussNote({
        notesPublicId,
        command: "@summarize",
        query: message,
        ...(discussion.conversationId
          ? {
              conversationId: discussion.conversationId,
            }
          : {}),
      }),
    );
  };

  const handleQuickCommand = (command: string) => {
    setInput(`${command} `);
  };

  return (
    <section className="flex min-h-[620px] flex-col overflow-hidden rounded-2xl border border-[#252525] bg-[#0D0D0D] lg:sticky lg:top-6 lg:h-[calc(100vh-48px)] lg:min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#252525] px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(91,140,255,0.10)] text-[#5B8CFF]">
          <Bot size={18} />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[#F5F5F5]">
            AI Discussion
          </h2>

          <p className="mt-0.5 text-xs text-[#737373]">
            Ask questions about your note
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {discussion.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#252525] bg-[#111111] text-[#5B8CFF]">
              <Sparkles size={20} />
            </div>

            <h3 className="mt-4 text-sm font-medium text-[#F5F5F5]">
              Discuss your notes
            </h3>

            <p className="mt-2 max-w-[260px] text-xs leading-5 text-[#737373]">
              Ask NoteGenius to summarize, explain, or clarify something
              from this study material.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {[
                "@summarize",
                "@bulletpoints",
                "@explain",
              ].map((command) => (
                <button
                  key={command}
                  type="button"
                  onClick={() => handleQuickCommand(command)}
                  disabled={discussing}
                  className="rounded-lg border border-[#252525] bg-[#111111] px-3 py-2 text-xs text-[#A3A3A3] transition hover:border-[#303030] hover:text-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {command}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
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
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs leading-5 text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <DiscussionInput
        value={input}
        onChange={setInput}
        onSend={() => handleSend()}
        disabled={discussing}
      />
    </section>
  );
};

export default DiscussionPanel;