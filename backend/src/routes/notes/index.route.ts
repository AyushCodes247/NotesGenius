import { Router } from "express";
import auth from "@middlewares/auth.middleware.js";
import documentAuthentication from "@middlewares/upload.middleware.js";
import NotesController from "@controllers/notes/index.controller.js"

export const router: Router = Router();

router.post("/:notesPublicId/upload", auth, documentAuthentication, NotesController.upload);

router.post("/", auth, NotesController.create);

router.post("/:notesPublicId",  auth, NotesController.discuss);