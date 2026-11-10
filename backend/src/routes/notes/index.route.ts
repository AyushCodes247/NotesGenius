import { Router } from "express";
import auth from "@middlewares/auth.middleware.js";
import documentAuthentication from "@middlewares/upload.middleware.js";
import NotesController from "@controllers/notes/index.controller.js";

export const router: Router = Router();

// Document uploads
router.post(
  "/:notesPublicId/upload",
  auth,
  documentAuthentication,
  NotesController.upload,
);

// Notes creation
router.post("/", auth, NotesController.create);

// Notes Discussion
router.post("/:notesPublicId", auth, NotesController.discuss);

// Notes retrieval for the user all notes
router.get("/all", auth, NotesController.getAll);

// Notes Get the shared record
router.get("/shared", auth, NotesController.getShared);

// Notes retrieval for the use one notes by id
router.get("/:notesPublicId/one", auth, NotesController.getOne);

// Notes update
router.patch("/:notesPublicId", auth, NotesController.update);

// Notes Delete
router.delete("/:notesPublicId", auth, NotesController.delete);

// Notes Share
router.post("/:notesPublicId/share", auth, NotesController.share);

// Notes Share Revoke
router.delete(
  "/:notesPublicId/share/:sharePublicId",
  auth,
  NotesController.revokeShare,
);
