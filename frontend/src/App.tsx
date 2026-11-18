import { Route, Routes } from "react-router-dom";

import HomePage from "./Components/HomePage/HomePage";
import Login from "./Components/Authentication/Login";
import Register from "./Components/Authentication/Register";
import ProtectedRoute from "./Components/Authentication/Protected";
import AuthInitializer from "./Components/Authentication/AuthInitializer";

import DashBoard from "./Components/DashBoard/DashBoard";
import Notes from "./Components/Notes/Notes";
import NewNote from "./Components/Notes/NewNote/NewNote";
import NoteWorkspace from "./Components/Notes/NoteWorkspace/NoteWorkspace";
import Account from "./Components/Account/Account";

import Quizzes from "./Components/Quizzes/Quizzes";
import QuizDetails from "./Components/Quizzes/QuizDetails";
import QuizResult from "./Components/Quizzes/QuizResult";

import AppLayout from "./Components/Layout/AppLayout";

const App = () => {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected application */}
      <Route
        element={
          <AuthInitializer>
            <ProtectedRoute />
          </AuthInitializer>
        }
      >
        {/* Normal application pages */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashBoard />} />

          <Route path="/notes" element={<Notes />} />

          <Route path="/notes/new" element={<NewNote />} />

          <Route path="/quizzes" element={<Quizzes />} />

          <Route path="/account" element={<Account />} />
        </Route>

        {/* Standalone note workspace */}
        <Route path="/notes/:notesPublicId" element={<NoteWorkspace />} />

        {/* Standalone quiz details */}
        <Route path="/quizzes/:quizPublicId" element={<QuizDetails />} />

        {/* Standalone quiz result */}
        <Route path="/quizzes/:quizPublicId/result" element={<QuizResult />} />
      </Route>
    </Routes>
  );
};

export default App;
