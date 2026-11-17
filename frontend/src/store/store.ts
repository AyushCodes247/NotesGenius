import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlice";
import notesReducer from "../slices/noteSlice";
import quizReducer from "../slices/quizSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    notes: notesReducer,
    quiz: quizReducer,
  },
});

export type appDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
