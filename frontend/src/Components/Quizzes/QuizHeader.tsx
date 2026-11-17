const QuizHeader = () => {
  return (
    <header className="border-b border-white/[0.08] pb-8">
      <div>
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#5B8CFF]">
          Quizzes
        </p>

        <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-white sm:text-[34px]">
          Test what you know.
        </h1>

        <p className="mt-2 max-w-[520px] text-[14px] leading-6 text-white/40">
          Turn your study material into focused practice and see how well you
          understand it.
        </p>
      </div>
    </header>
  );
};

export default QuizHeader;
