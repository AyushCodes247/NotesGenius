import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./Components/HomePage/HomePage";
import Login from "./Components/Authentication/Login";
import Register from "./Components/Authentication/Register";
import ProtectedRoute from "./Components/Authentication/Protected";
import AuthInitializer from "./Components/Authentication/AuthInitializer";
import DashBoard from "./Components/DashBoard/DashBoard";
import Notes from "./Components/Notes/Notes";
import NewNote from "./Components/Notes/NewNote/NewNote"
import NoteWorkspace from "./Components/Notes/NoteWorkspace/NoteWorkspace"

const App = () => {
  return (
    <>
      <AuthInitializer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashBoard />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/new" element={<NewNote />} />
            <Route path="/notes/:notesPublicId" element={<NoteWorkspace />} />
          </Route>
        </Routes>
      </AuthInitializer>
    </>
  );
};

export default App;
