import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlice";
import notesReducer from "../slices/noteSlice";

export const store = configureStore({
  reducer: {
    user : userReducer,
    notes : notesReducer
  },
});

export type appDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
