import { useEffect } from "react";

import { getMyQuizzes, getSharedQuizzes } from "../../api/quizApi";
import { useAppDispatch, useAppSelector } from "../../hooks/appHook";

import QuizHeader from "./QuizHeader";
import QuizGenerator from "./QuizGenerator";
import GeneratedQuizzes from "./GeneratedQuizzes";
import SharedQuizzes from "./SharedQuizzes";

const Quizzes = () => {
  const dispatch = useAppDispatch();

  const { quizzes, sharedQuizzes, loadingShared } = useAppSelector(
    (state) => state.quiz,
  );

  useEffect(() => {
    dispatch(getMyQuizzes());
    dispatch(getSharedQuizzes());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5]">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-12">
        <QuizHeader />

        <div className="mt-8">
          <QuizGenerator />
        </div>

        {quizzes.length > 0 && (
          <div className="mt-12">
            <GeneratedQuizzes quizzes={quizzes} />
          </div>
        )}

        {sharedQuizzes.length > 0 && (
          <div className="mt-16 pb-10">
            <SharedQuizzes quizzes={sharedQuizzes} loading={loadingShared} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
