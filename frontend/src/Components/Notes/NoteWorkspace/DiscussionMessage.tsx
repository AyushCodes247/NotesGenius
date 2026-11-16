import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type DiscussionMessageProps = {
  role: "user" | "assistant";
  content: string;
};

const REVEAL_INTERVAL = 20;
const REVEAL_CHUNK = 2;

const DiscussionMessage = ({ role, content }: DiscussionMessageProps) => {
  const isUser = role === "user";

  const [visibleContent, setVisibleContent] = useState(isUser ? content : "");

  useEffect(() => {
    if (isUser) {
      return;
    }

    let currentIndex = 0;

    const interval = window.setInterval(() => {
      currentIndex = Math.min(currentIndex + REVEAL_CHUNK, content.length);

      setVisibleContent(content.slice(0, currentIndex));

      if (currentIndex >= content.length) {
        window.clearInterval(interval);
      }
    }, REVEAL_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [content, isUser]);

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[75%] rounded-xl bg-[#111111] px-4 py-3 text-[#D4D4D4]"
            : "max-w-[90%] text-[#C4C4C4]"
        }
      >
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#525252]">
          {isUser ? "You" : "NoteGenius"}
        </p>

        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-7">
            {visibleContent}
          </p>
        ) : (
          <div className="text-sm leading-7">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-4 text-xl font-semibold tracking-tight text-[#F5F5F5]">
                    {children}
                  </h1>
                ),

                h2: ({ children }) => (
                  <h2 className="mb-3 mt-7 text-base font-semibold text-[#F5F5F5]">
                    {children}
                  </h2>
                ),

                h3: ({ children }) => (
                  <h3 className="mb-2 mt-5 text-sm font-semibold text-[#F5F5F5]">
                    {children}
                  </h3>
                ),

                p: ({ children }) => (
                  <p className="mb-3 last:mb-0">{children}</p>
                ),

                strong: ({ children }) => (
                  <strong className="font-semibold text-[#F5F5F5]">
                    {children}
                  </strong>
                ),

                em: ({ children }) => (
                  <em className="italic text-[#C4C4C4]">{children}</em>
                ),

                ul: ({ children }) => (
                  <ul className="mb-4 ml-5 list-disc space-y-1.5">
                    {children}
                  </ul>
                ),

                ol: ({ children }) => (
                  <ol className="mb-4 ml-5 list-decimal space-y-1.5">
                    {children}
                  </ol>
                ),

                li: ({ children }) => <li className="pl-1">{children}</li>,

                blockquote: ({ children }) => (
                  <blockquote className="my-4 border-l-2 border-[#5B8CFF] pl-4 text-[#A3A3A3]">
                    {children}
                  </blockquote>
                ),

                hr: () => <hr className="my-5 border-[#252525]" />,

                code: ({ children }) => (
                  <code className="rounded bg-[#171717] px-1.5 py-0.5 font-mono text-[12px] text-[#D4D4D4]">
                    {children}
                  </code>
                ),

                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5B8CFF] underline underline-offset-2 hover:text-[#7AA3FF]"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {visibleContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionMessage;
