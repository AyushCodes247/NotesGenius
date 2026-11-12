import { Router } from "express";
import auth from "@middlewares/auth.middleware.js";
import documentAuthentication from "@middlewares/upload.middleware.js";
import validate from "@middlewares/validate.middleware.js";
import NotesController from "@controllers/notes/index.controller.js";
import {
  createNoteSchema,
  discussNoteSchema,
  uploadNoteSchema,
  updateNoteSchema,
  getOneNoteSchema,
  deleteNoteSchema,
  shareNoteSchema,
  revokeNoteShareSchema,
} from "@validators/notes.validator.js";
import {
  uploadRateLimit,
  conversationRateLimit,
  retrievalRateLimit,
  sharingRateLimit,
} from "@utils/rateLimiters.util.js";

export const router: Router = Router();

router.post(
  "/:notesPublicId/upload",
  auth,
  uploadRateLimit,
  validate(uploadNoteSchema),
  documentAuthentication,
  NotesController.upload,
);

router.post("/", auth, validate(createNoteSchema), NotesController.create);

router.post(
  "/:notesPublicId",
  auth,
  conversationRateLimit,
  validate(discussNoteSchema),
  NotesController.discuss,
);

router.get("/all", auth, retrievalRateLimit, NotesController.getAll);

router.get("/shared", auth, retrievalRateLimit, NotesController.getShared);

router.get(
  "/:notesPublicId/one",
  auth,
  retrievalRateLimit,
  validate(getOneNoteSchema),
  NotesController.getOne,
);

router.patch(
  "/:notesPublicId",
  auth,
  validate(updateNoteSchema),
  NotesController.update,
);

router.delete(
  "/:notesPublicId",
  auth,
  validate(deleteNoteSchema),
  NotesController.delete,
);

router.post(
  "/:notesPublicId/share",
  auth,
  sharingRateLimit,
  validate(shareNoteSchema),
  NotesController.share,
);

router.delete(
  "/:notesPublicId/share/:sharePublicId",
  auth,
  sharingRateLimit,
  validate(revokeNoteShareSchema),
  NotesController.revokeShare,
);
