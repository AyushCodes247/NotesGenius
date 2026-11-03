import { Router } from "express";
import { router as users } from "./users/index.route.js";
import { router as notes } from "./notes/index.route.js";

const router: Router = Router();

router.use("/users", users);

router.use("/notes", notes);

export default router;
