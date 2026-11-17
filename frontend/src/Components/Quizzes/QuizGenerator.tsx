import { useEffect, useState } from "react";
import { Brain, ChevronDown, Loader2 } from "lucide-react";

import type { QuizDifficulty } from "../../api/quizApi";
import { generateQuiz } from "../../api/quizApi";
import { getAllNotes, type NoteSummary } from "../../api/notesApi";
import { useAppDispatch, useAppSelector } from "../../hooks/appHook";

const QuizGenerator = () => {
  const dispatch = useAppDispatch();

  const { notes } = useAppSelector((state) => state.notes);
  const { generating } = useAppSelector((state) => state.quiz);

  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15>(10);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");

  useEffect(() => {
    if (notes.length === 0) {
      dispatch(getAllNotes());
    }
  }, [dispatch, notes.length]);

  const selectedNote = notes.find((note) => note.publicId === selectedNoteId);

  const handleGenerate = () => {
    if (!selectedNoteId || generating) {
      return;
    }

    dispatch(
      generateQuiz({
        notesPublicId: selectedNoteId,
        questionCount,
        difficulty,
      }),
    );
  };

  return (
    <section className="rounded-xl border border-[#252525] bg-[#111111]">
      <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-white/[0.08] bg-white/[0.03]">
            <Brain size={17} strokeWidth={1.7} className="text-[#5B8CFF]" />
          </div>

          <div>
            <h2 className="text-[14px] font-medium text-white">
              Generate a quiz
            </h2>

            <p className="mt-1 text-[12px] leading-5 text-white/35">
              Choose a note and turn it into focused practice questions.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <label
            htmlFor="quiz-note"
            className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-white/40"
          >
            Study material
          </label>

          <div className="relative">
            <select
              id="quiz-note"
              value={selectedNoteId}
              onChange={(event) => setSelectedNoteId(event.target.value)}
              disabled={generating}
              className="h-11 w-full appearance-none rounded-[8px] border border-white/[0.08] bg-[#0D0D0D] px-3 pr-10 text-[13px] text-white outline-none transition-colors focus:border-white/[0.18] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" className="bg-[#0D0D0D]">
                Select a note
              </option>

              {notes.map((note: NoteSummary) => (
                <option
                  key={note.publicId}
                  value={note.publicId}
                  className="bg-[#0D0D0D]"
                >
                  {note.title}
                </option>
              ))}
            </select>

            <ChevronDown
              size={15}
              strokeWidth={1.7}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
            />
          </div>

          {notes.length === 0 && (
            <p className="mt-2 text-[11px] text-white/30">
              Create a note first to generate a quiz.
            </p>
          )}

          {selectedNote && (
            <p className="mt-2 truncate text-[11px] text-white/30">
              Selected: {selectedNote.title}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="quiz-question-count"
              className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-white/40"
            >
              Questions
            </label>

            <div className="relative">
              <select
                id="quiz-question-count"
                value={questionCount}
                onChange={(event) =>
                  setQuestionCount(Number(event.target.value) as 5 | 10 | 15)
                }
                disabled={generating}
                className="h-11 w-full appearance-none rounded-[8px] border border-white/[0.08] bg-[#0D0D0D] px-3 pr-10 text-[13px] text-white outline-none transition-colors focus:border-white/[0.18] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value={5} className="bg-[#0D0D0D]">
                  5 questions
                </option>

                <option value={10} className="bg-[#0D0D0D]">
                  10 questions
                </option>

                <option value={15} className="bg-[#0D0D0D]">
                  15 questions
                </option>
              </select>

              <ChevronDown
                size={15}
                strokeWidth={1.7}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="quiz-difficulty"
              className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-white/40"
            >
              Difficulty
            </label>

            <div className="relative">
              <select
                id="quiz-difficulty"
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value as QuizDifficulty)
                }
                disabled={generating}
                className="h-11 w-full appearance-none rounded-[8px] border border-white/[0.08] bg-[#0D0D0D] px-3 pr-10 text-[13px] capitalize text-white outline-none transition-colors focus:border-white/[0.18] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="easy" className="bg-[#0D0D0D]">
                  Easy
                </option>

                <option value="medium" className="bg-[#0D0D0D]">
                  Medium
                </option>

                <option value="hard" className="bg-[#0D0D0D]">
                  Hard
                </option>
              </select>

              <ChevronDown
                size={15}
                strokeWidth={1.7}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12px] text-white/50">
              {selectedNote
                ? `${questionCount} questions · ${difficulty}`
                : "Select a note to continue"}
            </p>

            <p className="mt-1 text-[11px] text-white/25">
              Questions are generated from the selected study material.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!selectedNoteId || generating}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-[8px] bg-white px-4 text-[12px] font-medium text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/25"
          >
            {generating ? (
              <>
                <Loader2 size={14} strokeWidth={1.8} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain size={14} strokeWidth={1.8} />
                Generate quiz
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuizGenerator;
