type DiscussionMessageProps = {
  role: "user" | "assistant";
  content: string;
};

const DiscussionMessage = ({ role, content }: DiscussionMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[88%] rounded-[9px] px-3.5 py-3",
          isUser
            ? "bg-[#5B8CFF]/[0.10] text-white/75"
            : "border border-white/[0.06] bg-white/[0.025] text-white/60",
        ].join(" ")}
      >
        <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/25">
          {isUser ? "You" : "NoteGenius"}
        </p>

        <p className="whitespace-pre-wrap text-[12px] leading-5">{content}</p>
      </div>
    </div>
  );
};

export default DiscussionMessage;
