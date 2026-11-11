import { Router } from "express";
import auth from "@middlewares/auth.middleware.js";
import documentAuthentication from "@middlewares/upload.middleware.js";
import NotesController from "@controllers/notes/index.controller.js";

export const router: Router = Router();

router.post(
  "/:notesPublicId/upload",
  auth,
  documentAuthentication,
  NotesController.upload,
);

router.post("/", auth, NotesController.create);

router.post("/:notesPublicId", auth, NotesController.discuss);

router.get("/all", auth, NotesController.getAll);

router.get("/shared", auth, NotesController.getShared);

router.get("/:notesPublicId/one", auth, NotesController.getOne);

router.patch("/:notesPublicId", auth, NotesController.update);

router.delete("/:notesPublicId", auth, NotesController.delete);

router.post("/:notesPublicId/share", auth, NotesController.share);

router.delete(
  "/:notesPublicId/share/:sharePublicId",
  auth,
  NotesController.revokeShare,
);
